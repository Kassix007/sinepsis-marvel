package api

import (
	"encoding/json"
	"net/http"

	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) registerMysticRoutes() {
	s.router.HandleFunc("/api/mystic/query", s.handleQuerySpells)
	s.router.HandleFunc("/api/mystic/spells", s.handleListSpells)
}

func (s *Server) handleQuerySpells(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		response.RespondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	// Parse JSON body
	var req struct {
		Query string `json:"query"`
		Limit int    `json:"limit"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Query == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Query is required")
		return
	}
	if req.Limit <= 0 {
		req.Limit = 5
	}


	ragResp, err := s.mysticService.QuerySpells(r.Context(), req.Query, req.Limit)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.RespondWithSuccess(w, "RAG query successful", ragResp)
}

func (s *Server) handleListSpells(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		response.RespondWithError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}

	spells, err := s.mysticService.ListSpells(r.Context())
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, err.Error())
		return
	}

	response.RespondWithSuccess(w, "Spells retrieved successfully", spells)
}
