-- name: UpsertUserGameStats :exec
INSERT INTO user_game_stats (user_id, best_time, best_points, created_at, updated_at)
VALUES ($1, $2, $3, NOW(), NOW())
ON CONFLICT (user_id)
DO UPDATE SET
    best_time = EXCLUDED.best_time,
    best_points = EXCLUDED.best_points,
    updated_at = NOW();

-- name: GetUserGameStats :one
SELECT id, user_id, best_time, best_points, created_at, updated_at
FROM user_game_stats
WHERE user_id = $1;
