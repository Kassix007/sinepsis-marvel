package api

import (
	"encoding/json"
	"net/http"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) registerGameStatsRoutes() {
	s.router.HandleFunc("POST /api/gamestats", s.handleUpsertGameStats)
	s.router.HandleFunc("GET /api/gamestats", s.handleGetGameStats)
}

// handleUpsertGameStats creates or updates the user’s game stats
func (s *Server) handleUpsertGameStats(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	var req struct {
		BestTime   string `json:"best_time"`
		BestPoints string `json:"best_points"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.BestTime == "" || req.BestPoints == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Best time and best points are required")
		return
	}

	err = s.gameStatsService.SaveOrUpdateStats(r.Context(), userID, req.BestTime, req.BestPoints)
	if err != nil {
		println(err.Error())
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to save game stats")
		return
	}

	response.RespondWithSuccess(w, "Game stats saved successfully", nil)
}

// handleGetGameStats fetches the user’s stats
func (s *Server) handleGetGameStats(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	stats, err := s.gameStatsService.GetStats(r.Context(), userID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to fetch game stats")
		return
	}

	// If no stats exist, return empty response gracefully
	if stats.ID == uuid.Nil {
		response.RespondWithSuccess(w, "No stats found", nil)
		return
	}

	response.RespondWithSuccess(w, "Game stats retrieved successfully", stats)
}
