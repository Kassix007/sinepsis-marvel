package api

import (
	"net/http"
	"strings"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) handleGetNotifications(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	notifications, err := s.calendarService.GetNotificationsByUser(r.Context(), userID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to get notifications")
		return
	}

	response.RespondWithSuccess(w, "Notifications retrieved successfully", notifications)
}

func (s *Server) handleMarkNotificationRead(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 5 || parts[4] != "read" {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}
	notificationID, err := uuid.Parse(parts[3])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid notification ID")
		return
	}

	ownerID, err := s.calendarService.CheckNotificationOwner(r.Context(), notificationID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Notification not found")
		return
	}

	if ownerID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to perform this action")
		return
	}

	notification, err := s.calendarService.MarkNotificationRead(r.Context(), notificationID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to mark notification as read")
		return
	}

	response.RespondWithSuccess(w, "Notification marked as read successfully", notification)
}

func (s *Server) handleDeleteNotification(w http.ResponseWriter, r *http.Request) {
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
	notificationID, err := uuid.Parse(parts[3])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid notification ID")
		return
	}

	ownerID, err := s.calendarService.CheckNotificationOwner(r.Context(), notificationID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Notification not found")
		return
	}

	if ownerID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to perform this action")
		return
	}

	if err := s.calendarService.DeleteNotification(r.Context(), notificationID); err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to delete notification")
		return
	}

	response.RespondWithSuccess(w, "Notification deleted successfully", nil)
}
