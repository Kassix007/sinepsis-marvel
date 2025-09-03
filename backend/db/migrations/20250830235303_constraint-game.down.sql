BEGIN;

ALTER TABLE user_game_stats
DROP CONSTRAINT unique_user_id;

COMMIT;
