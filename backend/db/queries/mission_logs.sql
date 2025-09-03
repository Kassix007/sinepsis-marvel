-- name: CreateMissionLog :one
INSERT INTO mission_logs (mission_id, log_date, note)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetMissionLogByID :one
SELECT * FROM mission_logs
WHERE id = $1
LIMIT 1;

-- name: GetLogsByMission :many
SELECT * FROM mission_logs
WHERE mission_id = $1
ORDER BY log_date ASC;

-- name: DeleteMissionLog :exec
DELETE FROM mission_logs
WHERE id = $1;
