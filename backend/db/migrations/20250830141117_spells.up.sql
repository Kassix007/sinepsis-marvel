BEGIN; 

CREATE TABLE IF NOT EXISTS spells (
    pageid                  INTEGER PRIMARY KEY,
    title                   TEXT NOT NULL,
    url                     TEXT NOT NULL,
    summary                 TEXT,
    used_by_doctor_strange  BOOLEAN NOT NULL DEFAULT FALSE,
    last_fetched_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
