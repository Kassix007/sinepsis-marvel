package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/joho/godotenv"
)

func main() {
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run cmd/migrate/main.go <up|down|create|status> [args]")
		os.Exit(1)
	}

	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading .env file")
		os.Exit(1)
	}

	command := os.Args[1]
	migrationsPath := "file://db/migrations"

	if command == "create" {
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run cmd/migrate/main.go create <migration_name>")
			os.Exit(1)
		}
		name := os.Args[2]
		timestamp := time.Now().UTC().Format("20060102150405")
		migrationsDir := strings.TrimPrefix(migrationsPath, "file://")

		name = strings.ReplaceAll(name, " ", "_")

		upPath := filepath.Join(migrationsDir, fmt.Sprintf("%s_%s.up.sql", timestamp, name))
		downPath := filepath.Join(migrationsDir, fmt.Sprintf("%s_%s.down.sql", timestamp, name))

		if _, err := os.Create(upPath); err != nil {
			fmt.Println("Error creating up migration file:", err)
			os.Exit(1)
		}

		if _, err := os.Create(downPath); err != nil {
			fmt.Println("Error creating down migration file:", err)
			os.Exit(1)
		}

		fmt.Printf("Created migration files: - %s - %s\n", upPath, downPath)
		return
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		fmt.Println("DATABASE_URL is not set")
		os.Exit(1)
	}

	m, err := migrate.New(migrationsPath, dbURL)
	if err != nil {
		fmt.Println("Error creating migration instance:", err)
		os.Exit(1)
	}

	switch command {
	case "up":
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
			fmt.Println("Error applying migrations:", err)
			os.Exit(1)
		}
		fmt.Println("Migrations applied successfully")

	case "down":
		if err := m.Down(); err != nil && err != migrate.ErrNoChange {
			fmt.Println("Error rolling back migrations:", err)
			os.Exit(1)
		}
		fmt.Println("Migrations rolled back successfully")

	case "status":
		version, dirty, err := m.Version()
		if err != nil {
			fmt.Println("Error getting migration status:", err)
			os.Exit(1)
		}
		fmt.Printf("Version: %d, Dirty: %v", version, dirty)

	case "force":
		if len(os.Args) < 3 {
			fmt.Println("Usage: go run cmd/migrate/main.go force <version>")
			os.Exit(1)
		}
		version, err := strconv.Atoi(os.Args[2])
		if err != nil {
			fmt.Println("Invalid version:", os.Args[2])
			os.Exit(1)
		}
		if err := m.Force(version); err != nil {
			fmt.Println("Error forcing migration version:", err)
			os.Exit(1)
		}
		fmt.Printf("Forced migration version to %d successfully\n", version)

	default:
		fmt.Println("Unknown command:", command)
		os.Exit(1)
	}
}
