package calendar

import (
	"context"

	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

type CalendarService struct {
	db *db.Queries
}

func New(db *db.Queries) *CalendarService {
	return &CalendarService{
		db: db,
	}
}

// Context wrapper for easy usage
type ServiceContext struct {
	context.Context
}
