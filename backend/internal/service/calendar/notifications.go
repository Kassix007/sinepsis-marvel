package calendar

import (
	"context"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

func (c *CalendarService) CreateNotification(
	ctx context.Context,
	userID uuid.UUID,
	missionID uuid.NullUUID,
	notifType db.NotificationTypeEnum,
	message string,
) (db.Notification, error) {
	return c.db.CreateNotification(ctx, db.CreateNotificationParams{
		UserID:    userID,
		MissionID: missionID,
		Type:      notifType,
		Message:   message,
		IsRead:    false,
	})
}

func (c *CalendarService) GetNotificationsByUser(
	ctx context.Context,
	userID uuid.UUID,
) ([]db.Notification, error) {
	return c.db.GetNotificationsByUser(ctx, userID)
}

func (c *CalendarService) MarkNotificationRead(
	ctx context.Context,
	notificationID uuid.UUID,
) (db.Notification, error) {
	return c.db.MarkNotificationRead(ctx, notificationID)
}

func (c *CalendarService) DeleteNotification(
	ctx context.Context,
	notificationID uuid.UUID,
) error {
	return c.db.DeleteNotification(ctx, notificationID)
}

func (c *CalendarService) CheckNotificationOwner(
	ctx context.Context,
	notificationID uuid.UUID,
) (uuid.UUID, error) {
	return c.db.CheckNotificationOwner(ctx, notificationID)
}
