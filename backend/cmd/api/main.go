package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	"github.com/ieeemumsb/Sinepsis/backend/internal/api"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
	auth "github.com/ieeemumsb/Sinepsis/backend/internal/service"
	"github.com/ieeemumsb/Sinepsis/backend/internal/service/calendar"
	"github.com/ieeemumsb/Sinepsis/backend/internal/service/gamestats"
	"github.com/ieeemumsb/Sinepsis/backend/internal/service/mystic"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/rs/cors"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set in environment")
	}

	dbConn, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatal(err)
	}

	defer dbConn.Close()

	if err := dbConn.Ping(); err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	uploadsDir := "./uploads"
	if err := os.MkdirAll(uploadsDir, os.ModePerm); err != nil {
		log.Fatal("Failed to create uploads directory:", err)
	}

	queries := db.New(dbConn)

	authService := auth.New(queries)
	calendarService := calendar.New(queries)
	mysticService := mystic.New(queries)
	gameStatsService := gamestats.New(queries)

	server := api.NewServer(
		authService,
		calendarService,
		mysticService,
		gameStatsService,
	)

	log.Println("Server starting on port 8080")

	handler := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true, // required if using cookies or auth headers
	}).Handler(server)

	if err := http.ListenAndServe(":8080", handler); err != nil {
		log.Fatal(err)
	}
}
