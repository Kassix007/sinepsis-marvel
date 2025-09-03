-- name: CreateUser :one
INSERT INTO users (email, password_hash, name, avatar_url)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users
WHERE id = $1
LIMIT 1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1
LIMIT 1;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at DESC;

-- name: UpdateUser :one
UPDATE users
SET name = $2,
avatar_url = $3,
updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: SetUserPassword :one
UPDATE users
SET password_hash = $2,
updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeactivateUser :exec
UPDATE users
SET is_active = FALSE,
updated_at = NOW()
WHERE id = $1;

-- name: DeleteUser :exec
DELETE FROM users
WHERE id = $1;

-- name: SelectByEmail :many
SELECT * FROM users
WHERE email = $1;
