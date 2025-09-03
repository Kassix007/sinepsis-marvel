package api

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) handleAddMissionLog(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 6 || parts[5] != "logs" {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}
	missionID, err := uuid.Parse(parts[4])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid mission ID")
		return
	}

	mission, err := s.calendarService.GetMissionByID(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Mission not found")
		return
	}

	if mission.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to add logs to this mission")
		return
	}

	var req struct {
		Note    string    `json:"note"`
		LogDate time.Time `json:"log_date"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Note == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Note is required")
		return
	}

	if req.LogDate.IsZero() {
		req.LogDate = time.Now()
	}

	log, err := s.calendarService.AddMissionLog(r.Context(), missionID, req.Note, req.LogDate)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to add mission log")
		return
	}

	response.RespondWithSuccess(w, "Mission log added successfully", log)
}

func (s *Server) handleGetMissionLogs(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 6 || parts[5] != "logs" {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	missionID, err := uuid.Parse(parts[4])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid mission ID")
		return
	}

	mission, err := s.calendarService.GetMissionByID(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Mission not found")
		return
	}

	if mission.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to view logs for this mission")
		return
	}

	logs, err := s.calendarService.GetMissionLogs(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to get mission logs")
		return
	}

	response.RespondWithSuccess(w, "Mission logs retrieved successfully", logs)
}

func (s *Server) handleDeleteMissionLog(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	// Expecting URL: /api/calendar/missions/{missionID}/logs/{logID}
	if len(parts) < 7 || parts[5] != "logs" {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	missionID, err := uuid.Parse(parts[4])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid mission ID")
		return
	}

	mission, err := s.calendarService.GetMissionByID(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Mission not found")
		return
	}

	if mission.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to delete logs from this mission")
		return
	}

	logID, err := uuid.Parse(parts[6])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid log ID")
		return
	}

	if err := s.calendarService.DeleteMissionLog(r.Context(), logID); err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to delete mission log")
		return
	}

	response.RespondWithSuccess(w, "Mission log deleted successfully", nil)
}
