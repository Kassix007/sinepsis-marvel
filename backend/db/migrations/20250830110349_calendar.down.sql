BEGIN; 

-- Drop tables
DROP TABLE IF EXISTS mission_attachments;
DROP TABLE IF EXISTS calendar_events;
DROP TABLE IF EXISTS mission_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS missions;

-- Drop enums
DROP TYPE IF EXISTS mission_type_enum;
DROP TYPE IF EXISTS threat_level_enum;
DROP TYPE IF EXISTS notification_type_enum;

-- Drop PostGIS 
DROP EXTENSION IF EXISTS postgis;

COMMIT;
