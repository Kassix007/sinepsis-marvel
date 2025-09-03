// Package api provides the entrypoint to services
package api

import (
	"net/http"

	auth "github.com/ieeemumsb/Sinepsis/backend/internal/service"
	"github.com/ieeemumsb/Sinepsis/backend/internal/service/calendar"
	"github.com/ieeemumsb/Sinepsis/backend/internal/service/gamestats"
	"github.com/ieeemumsb/Sinepsis/backend/internal/service/mystic"
)

type Server struct {
	router          *http.ServeMux
	authService     *auth.AuthService
	calendarService *calendar.CalendarService
	mysticService   *mystic.SearchService
	gameStatsService *gamestats.GameStatsService
}

func NewServer(
	authService *auth.AuthService,
	calendarService *calendar.CalendarService,
	mysticService *mystic.SearchService,
	gameStatsService *gamestats.GameStatsService,
) *Server {
	s := &Server{
		router:          http.NewServeMux(),
		authService:     authService,
		calendarService: calendarService,
		mysticService:   mysticService,
		gameStatsService: gameStatsService,
	}

	s.registerRoutes()
	return s
}

func (s *Server) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s.router.ServeHTTP(w, r)
}

func (s *Server) registerRoutes() {
	s.registerAuthRoutes()
	s.registerUploadsRoutes()
	s.registerCalendarRoutes()
	s.registerMysticRoutes()
	s.registerGameStatsRoutes()
}
