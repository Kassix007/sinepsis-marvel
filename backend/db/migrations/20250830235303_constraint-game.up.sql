BEGIN;

ALTER TABLE user_game_stats
ADD CONSTRAINT unique_user_id UNIQUE (user_id);

COMMIT;
