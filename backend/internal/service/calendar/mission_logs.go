package calendar

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

func (c *CalendarService) AddMissionLog(
	ctx context.Context,
	missionID uuid.UUID,
	note string,
	logDate time.Time,
) (db.MissionLog, error) {
	return c.db.CreateMissionLog(ctx, db.CreateMissionLogParams{
		MissionID: missionID,
		Note:      note,
		LogDate:   logDate,
	})
}

func (c *CalendarService) GetMissionLogs(
	ctx context.Context,
	missionID uuid.UUID,
) ([]db.MissionLog, error) {
	return c.db.GetLogsByMission(ctx, missionID)
}

func (c *CalendarService) DeleteMissionLog(
	ctx context.Context,
	logID uuid.UUID,
) error {
	return c.db.DeleteMissionLog(ctx, logID)
}
