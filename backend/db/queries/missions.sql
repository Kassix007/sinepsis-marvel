-- name: CreateMission :one
INSERT INTO missions (user_id, title, description, mission_type, latitude, longitude, start_time, end_time, threat_level, success)
VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
RETURNING *;

-- name: GetMissionByID :one
SELECT * FROM missions
WHERE id = $1
LIMIT 1;

-- name: GetMissionsByUser :many
SELECT * FROM missions
WHERE user_id = $1
ORDER BY start_time DESC;

-- name: UpdateMission :one
UPDATE missions
SET title = $2, description = $3, mission_type = $4,
    latitude = $5, longitude = $6,
    start_time = $7, end_time = $8,
    threat_level = $9, success = $10,
    updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteMission :exec
DELETE FROM missions
WHERE id = $1;
