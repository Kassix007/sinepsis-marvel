// Package gamestats provides services for handling user game stats
package gamestats

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"github.com/ieeemumsb/Sinepsis/backend/internal/db"
)

type GameStatsService struct {
	db *db.Queries
}

func New(db *db.Queries) *GameStatsService {
	return &GameStatsService{db: db}
}

// SaveOrUpdateStats upserts the best score and time for a user
func (s *GameStatsService) SaveOrUpdateStats(ctx context.Context, userID uuid.UUID, bestTime string, bestPoints string) error {
	// Fetch current stats
	current, err := s.db.GetUserGameStats(ctx, uuid.NullUUID{UUID: userID, Valid: true})
	if err != nil && err != sql.ErrNoRows {
		return fmt.Errorf("could not get current game stats: %w", err)
	}

	// Determine if we should update
	shouldUpdate := false
	newBestTime := bestTime
	newBestPoints := bestPoints

	// Compare times if current exists
	if current.ID != uuid.Nil {
		// Compare bestTime: lower is better
		if current.BestTime != "" && bestTime != "" {
			// Convert times like "2:34" to seconds for comparison
			curSec := parseTimeToSeconds(current.BestTime)
			newSec := parseTimeToSeconds(bestTime)
			if newSec < curSec {
				shouldUpdate = true
			} else {
				newBestTime = current.BestTime
			}
		} else if current.BestTime == "" && bestTime != "" {
			shouldUpdate = true
		}

		// Compare points: higher is better
		curPoints := atoiSafe(current.BestPoints)
		newPoints := atoiSafe(bestPoints)
		if newPoints > curPoints {
			shouldUpdate = true
		} else {
			newBestPoints = current.BestPoints
		}
	} else {
		// No current stats, always insert
		shouldUpdate = true
	}

	if !shouldUpdate {
		// No update needed
		return nil
	}

	// Upsert with possibly updated values
	err = s.db.UpsertUserGameStats(ctx, db.UpsertUserGameStatsParams{
		UserID:     uuid.NullUUID{UUID: userID, Valid: true},
		BestTime:   newBestTime,
		BestPoints: newBestPoints,
	})
	if err != nil {
		return fmt.Errorf("could not upsert game stats: %w", err)
	}

	return nil
}

// helper to convert "MM:SS" to seconds
func parseTimeToSeconds(timeStr string) int {
	var m, s int
	fmt.Sscanf(timeStr, "%d:%d", &m, &s)
	return m*60 + s
}

// helper to safely convert string points to int
func atoiSafe(s string) int {
	var i int
	fmt.Sscanf(s, "%d", &i)
	return i
}

// GetStats retrieves stats for a given user
func (s *GameStatsService) GetStats(ctx context.Context, userID uuid.UUID) (*db.GetUserGameStatsRow, error) {
	stats, err := s.db.GetUserGameStats(ctx, uuid.NullUUID{UUID: userID, Valid: true})
	if err != nil {
		return nil, fmt.Errorf("could not get game stats: %w", err)
	}
	return &stats, nil
}
