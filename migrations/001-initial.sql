--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE res (
    id INTEGER PRIMARY KEY,
    rid CHAR(32) NOT NULL,
    method VARCHAR(16) NOT NULL,
    host VARCHAR(128) NOT NULL,
    path VARCHAR(1024) NOT NULL,
    body BLOB,
    content_type VARCHAR(32) NOT NULL,
    response BLOB NOT NULL,
    is_entry BOOLEAN DEFAULT FALSE
);

CREATE INDEX res_ix_rid ON res(rid);


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP INDEX res_ix_rid;
DROP TABLE res;
