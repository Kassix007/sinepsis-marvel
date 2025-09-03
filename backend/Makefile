.DEFAULT_GOAL := server

build:
	go build -o $(BINARY_NAME) cmd/api/main.go

server:
	go run cmd/api/main.go

migrate-up:
	go run cmd/migrate/main.go up

migrate-down:
	go run cmd/migrate/main.go down

migrate-status:
	go run cmd/migrate/main.go status

migrate-create:
	@if [ -z "$(name)" ]; then \
		echo "Usage: make migrate-create name=<migration_name>"; \
		exit 1; \
	fi
	go run cmd/migrate/main.go create $(name)

migrate-force:
	@if [ -z "$(version)" ]; then \
		echo "Usage: make migrate-force version=<version_number>"; \
		exit 1; \
	fi
	go run cmd/migrate/main.go force $(version)

sqlc:
	sqlc generate
