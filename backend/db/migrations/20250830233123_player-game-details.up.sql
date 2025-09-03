BEGIN;

CREATE TABLE IF NOT EXISTS user_game_stats (
	id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
	best_time TEXT NOT NULL,
	best_points TEXT NOT NULL,
	created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
