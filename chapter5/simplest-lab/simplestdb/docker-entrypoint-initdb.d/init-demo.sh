#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
    CREATE USER demo with PASSWORD 'd3m0' ;
    CREATE DATABASE demo owner demo;
    GRANT ALL PRIVILEGES ON DATABASE demo TO demo;
    \connect demo;

    CREATE TABLE IF NOT EXISTS hits
    (
      hitid serial,
      serverip varchar(15) NOT NULL,
      clientip varchar(15) NOT NULL,
      date timestamp without time zone,
      PRIMARY KEY (hitid)
    );
    ALTER TABLE hits OWNER TO demo;
EOSQL
