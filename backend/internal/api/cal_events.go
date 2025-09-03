package api

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) handleCreateEvent(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	var req struct {
		Title       string    `json:"title"`
		Description string    `json:"description"`
		StartTime   time.Time `json:"start_time"`
		EndTime     time.Time `json:"end_time"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Title == "" {
		response.RespondWithError(w, http.StatusBadRequest, "Title is required")
		return
	}

	if req.StartTime.IsZero() {
		response.RespondWithError(w, http.StatusBadRequest, "Start time is required")
		return
	}

	event, err := s.calendarService.CreateEvent(r.Context(), userID, req.Title, req.Description, req.StartTime, req.EndTime)
	if err != nil {
		println(err.Error())
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to create event")
		return
	}

	response.RespondWithSuccess(w, "Event created successfully", event)
}

func (s *Server) handleGetEvents(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	events, err := s.calendarService.GetEventsByUser(r.Context(), userID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to get events")
		return
	}

	response.RespondWithSuccess(w, "Events retrieved successfully", events)
}

func (s *Server) handleUpdateEvent(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}
	eventID, err := uuid.Parse(parts[4])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid event ID")
		return
	}

	event, err := s.calendarService.GetCalendarEventByID(r.Context(), eventID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Event not found")
		return
	}

	if event.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to update this event")
		return
	}

	var req struct {
		Title       *string    `json:"title"`
		Description *string    `json:"description"`
		StartTime   *time.Time `json:"start_time"`
		EndTime     *time.Time `json:"end_time"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	params := db.UpdateCalendarEventParams{
		ID: eventID,
	}

	params.Title = ""
	if req.Title != nil {
		params.Title = *req.Title
	}

	params.Description = sql.NullString{String: "", Valid: false} // default empty
	if req.Description != nil {
		params.Description = sql.NullString{
			String: *req.Description,
			Valid:  true,
		}
	}

	if req.Description != nil {
		params.Description = sql.NullString{String: *req.Description, Valid: true}
	}

	if req.EndTime != nil {
		params.EndTime = sql.NullTime{Time: *req.EndTime, Valid: true}
	}

	params.ID = eventID

	updatedEvent, err := s.calendarService.UpdateEvent(r.Context(), params)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to update event")
		return
	}

	response.RespondWithSuccess(w, "Event updated successfully", updatedEvent)
}

func (s *Server) handleDeleteEvent(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 4 {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}
	eventID, err := uuid.Parse(parts[3])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid event ID")
		return
	}

	event, err := s.calendarService.GetCalendarEventByID(r.Context(), eventID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Event not found")
		return
	}

	if event.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to delete this event")
		return
	}

	if err := s.calendarService.DeleteEvent(r.Context(), eventID); err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to delete event")
		return
	}

	response.RespondWithSuccess(w, "Event deleted successfully", nil)
}

func (s *Server) handleGetAllEvents(w http.ResponseWriter, r *http.Request) {
	events, err := s.calendarService.GetAllEvents(r.Context())
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to get all events")
		return
	}

	response.RespondWithSuccess(w, "All events retrieved successfully", events)
}
