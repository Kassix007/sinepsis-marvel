package api

import (
	"database/sql"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) handleAddMissionAttachment(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 6 || parts[5] != "attachments" {
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
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to add attachments to this mission")
		return
	}

	if err := r.ParseMultipartForm(10 << 20); err != nil { // 10 MB
		response.RespondWithError(w, http.StatusBadRequest, "Failed to parse form data")
		return
	}

	file, handler, err := r.FormFile("attachment")
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "attachment file is required")
		return
	}
	defer file.Close()

	// Generate a unique filename
	ext := filepath.Ext(handler.Filename)
	newFileName := fmt.Sprintf("%s%s", uuid.New().String(), ext)
	filePath := filepath.Join("uploads", "mission_attachments", newFileName)

	// Create the file
	dst, err := os.Create(filePath)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to save file")
		return
	}
	defer dst.Close()

	// Copy the uploaded file to the destination file
	if _, err := io.Copy(dst, file); err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to save file")
		return
	}

	fileURL := "/uploads/mission_attachments/" + newFileName
	fileType := handler.Header.Get("Content-Type")

	attachment, err := s.calendarService.AddMissionAttachment(r.Context(), missionID, fileURL, sql.NullString{String: fileType, Valid: fileType != ""})
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to create attachment record")
		return
	}

	response.RespondWithSuccess(w, "Attachment added successfully", attachment)
}

func (s *Server) handleGetMissionAttachments(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 6 || parts[5] != "attachments" {
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
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to view attachments for this mission")
		return
	}

	attachments, err := s.calendarService.GetAttachmentsByMission(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to get attachments")
		return
	}

	response.RespondWithSuccess(w, "Attachments retrieved successfully", attachments)
}

func (s *Server) handleDeleteMissionAttachment(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 6 || parts[4] != "attachments" {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}
	missionID, err := uuid.Parse(parts[3])
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
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to delete attachments from this mission")
		return
	}

	attachmentID, err := uuid.Parse(parts[5])
	if err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid attachment ID")
		return
	}

	attachment, err := s.calendarService.GetMissionAttachmentByID(r.Context(), attachmentID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Attachment not found")
		return
	}

	// Delete the file from storage
	if err := os.Remove(filepath.Join("uploads", "mission_attachments", filepath.Base(attachment.FileUrl))); err != nil {
		// Log the error but don't block deleting the DB record
		// log.Printf("Failed to delete attachment file: %v", err)
	}

	if err := s.calendarService.DeleteAttachment(r.Context(), attachmentID); err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to delete attachment")
		return
	}

	response.RespondWithSuccess(w, "Attachment deleted successfully", nil)
}
