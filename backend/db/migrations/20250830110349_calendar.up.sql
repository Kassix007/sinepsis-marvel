BEGIN;

-- Enum for mission types
CREATE TYPE mission_type_enum AS ENUM ('recon', 'rescue', 'patrol');

-- Enum for threat levels
CREATE TYPE threat_level_enum AS ENUM ('low', 'medium', 'high', 'critical');

-- Enum for notification types
CREATE TYPE notification_type_enum AS ENUM ('mission_update', 'high_threat_alert');

-- Missions table
CREATE TABLE missions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  mission_type   mission_type_enum,
  latitude       DOUBLE PRECISION,
  longitude      DOUBLE PRECISION,
  start_time     TIMESTAMPTZ NOT NULL,
  end_time       TIMESTAMPTZ,
  threat_level   threat_level_enum,
  success        BOOLEAN,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mission_id   UUID REFERENCES missions(id) ON DELETE SET NULL,
  type         notification_type_enum NOT NULL,
  message      TEXT NOT NULL,
  is_read      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mission logs
CREATE TABLE mission_logs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id   UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  log_date     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  note         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Calendar events
CREATE TABLE calendar_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  start_time   TIMESTAMPTZ NOT NULL,
  end_time     TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Mission attachments
CREATE TABLE mission_attachments (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id   UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  file_url     TEXT NOT NULL,
  file_type    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMIT;
