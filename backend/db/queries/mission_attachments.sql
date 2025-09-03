-- name: CreateMissionAttachment :one
INSERT INTO mission_attachments (mission_id, file_url, file_type)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetMissionAttachmentByID :one
SELECT * FROM mission_attachments
WHERE id = $1
LIMIT 1;

-- name: GetAttachmentsByMission :many
SELECT * FROM mission_attachments
WHERE mission_id = $1;

-- name: DeleteMissionAttachment :exec
DELETE FROM mission_attachments
WHERE id = $1;
