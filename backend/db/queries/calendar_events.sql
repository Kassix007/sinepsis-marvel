-- name: CreateCalendarEvent :one
INSERT INTO calendar_events (user_id, title, description, start_time, end_time)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetCalendarEventByID :one
SELECT * FROM calendar_events
WHERE id = $1
LIMIT 1;

-- name: GetEventsByUser :many
SELECT * FROM calendar_events
WHERE user_id = $1
ORDER BY start_time ASC;

-- name: UpdateCalendarEvent :one
UPDATE calendar_events
SET title = $2, description = $3, start_time = $4, end_time = $5, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteCalendarEvent :exec
DELETE FROM calendar_events
WHERE id = $1;

-- name: GetAllCalendarEvents :many
SELECT *
FROM calendar_events
ORDER BY start_time ASC;
