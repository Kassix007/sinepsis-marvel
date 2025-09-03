package calendar

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

func (c *CalendarService) CreateMission(
	ctx context.Context,
	userID uuid.UUID,
	title string,
	description string,
	missionType db.NullMissionTypeEnum,
	latitude sql.NullFloat64,
	longitude sql.NullFloat64,
	startTime time.Time,
	endTime time.Time,
	threatLevel db.NullThreatLevelEnum,
	success sql.NullBool,
) (db.Mission, error) {
	return c.db.CreateMission(ctx, db.CreateMissionParams{
		UserID:      userID,
		Title:       title,
		Description: sql.NullString{String: description, Valid: description != ""},
		MissionType: missionType,
		Latitude:    latitude,
		Longitude:   longitude,
		StartTime:   startTime,
		EndTime:     sql.NullTime{Time: endTime, Valid: !endTime.IsZero()},
		ThreatLevel: threatLevel,
		Success:     success,
	})
}

func (c *CalendarService) GetMissionByID(
	ctx context.Context,
	missionID uuid.UUID,
) (db.Mission, error) {
	return c.db.GetMissionByID(ctx, missionID)
}

func (c *CalendarService) GetMissionsByUser(
	ctx context.Context,
	userID uuid.UUID,
) ([]db.Mission, error) {
	return c.db.GetMissionsByUser(ctx, userID)
}

func (c *CalendarService) UpdateMission(
	ctx context.Context,
	params db.UpdateMissionParams,
) (db.Mission, error) {
	return c.db.UpdateMission(ctx, params)
}

func (c *CalendarService) DeleteMission(
	ctx context.Context,
	missionID uuid.UUID,
) error {
	return c.db.DeleteMission(ctx, missionID)
}
