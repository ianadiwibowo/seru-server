.PHONY: build test cov covline run clean

build:
	go build -o bin/seru-server cmd/main.go

test:
	go test -cover -coverprofile=coverage.out $$(go list ./... | grep -Ev "cmd|bin|db|doc|entity|mocks")

cov:
	go tool cover -func coverage.out

covline:
	go tool cover -html=coverage.out

run:
	go run cmd/main.go

clean:
	rm -rf bin
