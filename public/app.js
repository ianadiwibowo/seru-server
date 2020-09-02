new Vue({
  el: '#app',

  data: {
    ws: null, // Our websocket
    newMessage: '', // Holds new messages to be sent to the server
    chatContent: '', // A running list of chat messages displayed on the screen
    email: null, // Email address used for grabbing an avatar
    username: null, // Our username
    joined: false // True if email and username have been filled in
  },
  created: function () {
    var self = this;
    this.ws = new WebSocket('ws://' + window.location.host + '/ws');
    this.ws.addEventListener('message', function (e) {
      var msg = JSON.parse(e.data);
      self.chatContent += '<div class="chip">'
        + msg.username
        + '</div>'
        + emojione.toImage(msg.message) + '<br/>'; // Parse emojis
      var element = document.getElementById('chat-messages');
      element.scrollTop = element.scrollHeight; // Auto scroll to the bottom
    });
    M.toast({ html: 'Welcome to Seru!' })
  },
  methods: {
    send: function () {
      if (this.newMessage != '') {
        this.ws.send(
          JSON.stringify({
            email: this.email,
            username: this.username,
            message: $('<p>').html(this.newMessage).text() // Strip out html
          }
          ));
        this.newMessage = ''; // Reset newMessage
      }
    },
    join: function () {
      if (!this.email) {
        M.toast({ html: 'You must enter an email' });
        return
      }
      if (!this.username) {
        M.toast({ html: 'You must choose a username' });
        return
      }
      this.email = $('<p>').html(this.email).text();
      this.username = $('<p>').html(this.username).text();
      this.joined = true;
    },
  }
});
