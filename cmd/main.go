package main

import (
	"log"
	"net/http"

	"github.com/gorilla/websocket"
)

var connectedClients = make(map[*websocket.Conn]bool)
var broadcastChannel = make(chan Message)
var upgrader = websocket.Upgrader{}

type Message struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Text     string `json:"text"`
}

func main() {
	fs := http.FileServer(http.Dir("public"))
	http.Handle("/", fs)
	http.HandleFunc("/ws", handleConnections)

	go handleMessages()

	log.Println("Seru HTTP server started on :8000")
	err := http.ListenAndServe(":8000", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Fatal("handleConnections: ", err)
	}
	defer ws.Close()

	connectedClients[ws] = true

	for {
		var msg Message

		err := ws.ReadJSON(&msg)
		if err != nil {
			log.Printf("Error: %v", err)
			delete(connectedClients, ws)
			break
		}

		broadcastChannel <- msg
	}
}

func handleMessages() {
	for {
		msg := <-broadcastChannel

		for client := range connectedClients {
			err := client.WriteJSON(msg)
			if err != nil {
				log.Printf("Error: %v", err)
				client.Close()
				delete(connectedClients, client)
			}
		}
	}
}
