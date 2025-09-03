package api

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
	"github.com/ieeemumsb/Sinepsis/backend/internal/response"
)

func (s *Server) handleCreateMission(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	var req struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		MissionType string     `json:"mission_type"`
		Latitude    *float64   `json:"latitude"`
		Longitude   *float64   `json:"longitude"`
		StartTime   time.Time  `json:"start_time"`
		EndTime     *time.Time `json:"end_time"`
		ThreatLevel string     `json:"threat_level"`
		Success     *bool      `json:"success"`
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

	// Convert to sql.NullFloat64
	latitude := sql.NullFloat64{}
	if req.Latitude != nil {
		latitude.Float64 = *req.Latitude
		latitude.Valid = true
	}

	longitude := sql.NullFloat64{}
	if req.Longitude != nil {
		longitude.Float64 = *req.Longitude
		longitude.Valid = true
	}

	// Convert to db.NullMissionTypeEnum
	missionType := db.NullMissionTypeEnum{
		MissionTypeEnum: db.MissionTypeEnum(req.MissionType),
		Valid:           req.MissionType != "",
	}
	if req.MissionType != "" {
		missionType.MissionTypeEnum = db.MissionTypeEnum(req.MissionType)
		missionType.Valid = true
	}

	if req.MissionType != "" {
		missionType.MissionTypeEnum = missionType.MissionTypeEnum
		missionType.Valid = true
	}

	// Convert to db.NullThreatLevelEnum
	threatLevel := db.NullThreatLevelEnum{
		ThreatLevelEnum: db.ThreatLevelEnum(req.ThreatLevel), // cast string to enum type
		Valid:           req.ThreatLevel != "",
	}
	if req.ThreatLevel != "" {
		threatLevel.ThreatLevelEnum = threatLevel.ThreatLevelEnum
		threatLevel.Valid = true
	}

	// Convert to sql.NullTime for end time
	var endTime time.Time
	if req.EndTime != nil {
		endTime = *req.EndTime
	}

	// Convert to sql.NullBool for success
	success := sql.NullBool{}
	if req.Success != nil {
		success.Bool = *req.Success
		success.Valid = true
	}

	mission, err := s.calendarService.CreateMission(
		r.Context(),
		userID,
		req.Title,
		req.Description,
		missionType,
		latitude,
		longitude,
		req.StartTime,
		endTime,
		threatLevel,
		success,
	)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to create mission")
		return
	}

	response.RespondWithSuccess(w, "Mission created successfully", mission)
}

func (s *Server) handleGetMissions(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	missions, err := s.calendarService.GetMissionsByUser(r.Context(), userID)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to get missions")
		return
	}

	response.RespondWithSuccess(w, "Missions retrieved successfully", missions)
}

func (s *Server) handleGetMissionByID(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")

	fmt.Println(parts)

	if len(parts) < 4 {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid URL")
		return
	}

	missionIDStr := strings.TrimSpace(parts[4])
	missionID, err := uuid.Parse(missionIDStr)
	if err != nil {
		println(err.Error())
		response.RespondWithError(w, http.StatusBadRequest, "Invalid mission ID")
		return
	}

	mission, err := s.calendarService.GetMissionByID(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Mission not found")
		return
	}

	if mission.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to view this mission")
		return
	}

	response.RespondWithSuccess(w, "Mission retrieved successfully", mission)
}

func (s *Server) handleUpdateMission(w http.ResponseWriter, r *http.Request) {
	userID, err := s.getUserIDFromToken(r)
	if err != nil {
		response.RespondWithError(w, http.StatusUnauthorized, "Invalid token")
		return
	}

	parts := strings.Split(r.URL.Path, "/")
	if len(parts) < 5 { // note: 5 because the first element is empty string due to leading '/'
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
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to update this mission")
		return
	}

	var req struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		MissionType string     `json:"mission_type"`
		Latitude    *float64   `json:"latitude"`
		Longitude   *float64   `json:"longitude"`
		StartTime   time.Time  `json:"start_time"`
		EndTime     *time.Time `json:"end_time"`
		ThreatLevel string     `json:"threat_level"`
		Success     *bool      `json:"success"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.RespondWithError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Convert to sql.NullFloat64
	latitude := sql.NullFloat64{}
	if req.Latitude != nil {
		latitude.Float64 = *req.Latitude
		latitude.Valid = true
	}

	longitude := sql.NullFloat64{}
	if req.Longitude != nil {
		longitude.Float64 = *req.Longitude
		longitude.Valid = true
	}

	// Convert to db.NullMissionTypeEnum
	missionType := db.NullMissionTypeEnum{
		MissionTypeEnum: db.MissionTypeEnum(req.MissionType),
		Valid:           req.MissionType != "",
	}

	// Convert to db.NullThreatLevelEnum
	threatLevel := db.NullThreatLevelEnum{
		ThreatLevelEnum: db.ThreatLevelEnum(req.ThreatLevel),
		Valid:           req.ThreatLevel != "",
	}

	// Convert to sql.NullTime
	endTime := sql.NullTime{}
	if req.EndTime != nil {
		endTime.Time = *req.EndTime
		endTime.Valid = true
	}

	// Convert to sql.NullBool
	success := sql.NullBool{}
	if req.Success != nil {
		success.Bool = *req.Success
		success.Valid = true
	}

	params := db.UpdateMissionParams{
		ID:          missionID,
		Title:       req.Title,
		Description: sql.NullString{String: req.Description, Valid: req.Description != ""},
		MissionType: missionType,
		Latitude:    latitude,
		Longitude:   longitude,
		StartTime:   req.StartTime,
		EndTime:     endTime,
		ThreatLevel: threatLevel,
		Success:     success,
	}

	updatedMission, err := s.calendarService.UpdateMission(r.Context(), params)
	if err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to update mission")
		return
	}

	response.RespondWithSuccess(w, "Mission updated successfully", updatedMission)
}

func (s *Server) handleDeleteMission(w http.ResponseWriter, r *http.Request) {
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

	missionID, err := uuid.Parse(parts[4])
	if err != nil {
		fmt.Println(parts)
		println(err.Error())
		response.RespondWithError(w, http.StatusBadRequest, "Invalid mission ID")
		return
	}

	mission, err := s.calendarService.GetMissionByID(r.Context(), missionID)
	if err != nil {
		response.RespondWithError(w, http.StatusNotFound, "Mission not found")
		return
	}

	if mission.UserID != userID {
		response.RespondWithError(w, http.StatusForbidden, "You are not authorized to delete this mission")
		return
	}

	if err := s.calendarService.DeleteMission(r.Context(), missionID); err != nil {
		response.RespondWithError(w, http.StatusInternalServerError, "Failed to delete mission")
		return
	}

	response.RespondWithSuccess(w, "Mission deleted successfully", nil)
}
