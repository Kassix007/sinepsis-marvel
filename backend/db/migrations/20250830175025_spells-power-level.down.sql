BEGIN;

ALTER TABLE spells
    DROP COLUMN IF EXISTS origin,
    DROP COLUMN IF EXISTS power_class,
    DROP COLUMN IF EXISTS access_level,
    DROP COLUMN IF EXISTS restricted_reason,
    DROP COLUMN IF EXISTS alert_triggered_at,
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;
COMMIT;
