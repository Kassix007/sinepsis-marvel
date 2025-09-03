package calendar

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

func (c *CalendarService) CreateEvent(
	ctx context.Context,
	userID uuid.UUID,
	title string,
	description string,
	startTime time.Time,
	endTime time.Time,
) (db.CalendarEvent, error) {
	return c.db.CreateCalendarEvent(ctx, db.CreateCalendarEventParams{
		UserID:      userID,
		Title:       title,
		Description: sql.NullString{String: description, Valid: description != ""},
		StartTime:   startTime,
		EndTime:     sql.NullTime{Time: endTime, Valid: !endTime.IsZero()},
	})
}

func (c *CalendarService) GetEventsByUser(
	ctx context.Context,
	userID uuid.UUID,
) ([]db.CalendarEvent, error) {
	return c.db.GetEventsByUser(ctx, userID)
}

func (c *CalendarService) UpdateEvent(
	ctx context.Context,
	params db.UpdateCalendarEventParams,
) (db.CalendarEvent, error) {
	return c.db.UpdateCalendarEvent(ctx, params)
}

func (c *CalendarService) DeleteEvent(
	ctx context.Context,
	eventID uuid.UUID,
) error {
	return c.db.DeleteCalendarEvent(ctx, eventID)
}

func (c *CalendarService) GetCalendarEventByID(
	ctx context.Context,
	eventID uuid.UUID,
) (db.CalendarEvent, error) {
	return c.db.GetCalendarEventByID(ctx, eventID)
}

func (c *CalendarService) GetAllEvents(ctx context.Context) ([]db.CalendarEvent, error) {
	return c.db.GetAllCalendarEvents(ctx)
}
