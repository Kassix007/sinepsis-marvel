-- name: CreateNotification :one
INSERT INTO notifications (user_id, mission_id, type, message, is_read)
VALUES ($1, $2, $3, $4, $5)
RETURNING *;

-- name: GetNotificationByID :one
SELECT * FROM notifications
WHERE id = $1
LIMIT 1;

-- name: GetNotificationsByUser :many
SELECT * FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: MarkNotificationRead :one
UPDATE notifications
SET is_read = TRUE
WHERE id = $1
RETURNING *;

-- name: DeleteNotification :exec
DELETE FROM notifications
WHERE id = $1;

-- name: CheckNotificationOwner :one
SELECT user_id FROM notifications WHERE id = $1;
