package calendar

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

func (c *CalendarService) AddMissionAttachment(
	ctx context.Context, 
	missionID uuid.UUID, 
	fileURL string, 
	fileType sql.NullString,
) (db.MissionAttachment, error) {
	return c.db.CreateMissionAttachment(ctx, db.CreateMissionAttachmentParams{
		MissionID: missionID,
		FileUrl:   fileURL,
		FileType:  fileType,
	})
}

func (c *CalendarService) GetAttachmentsByMission(
	ctx context.Context, 
	missionID uuid.UUID,
) ([]db.MissionAttachment, error) {
	return c.db.GetAttachmentsByMission(ctx, missionID)
}

func (c *CalendarService) DeleteAttachment(
	ctx context.Context, 
	attachmentID uuid.UUID,
) error {
	return c.db.DeleteMissionAttachment(ctx, attachmentID)
}

func (c *CalendarService) GetMissionAttachmentByID(
	ctx context.Context,
	attachmentID uuid.UUID,
) (db.MissionAttachment, error) {
	return c.db.GetMissionAttachmentByID(ctx, attachmentID)
}
