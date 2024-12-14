#!/bin/bash

DB_CONTAINER_NAME="homemadefood-db.dev.postgres"
DB_NAME="hmfdb"
DB_USERNAME="hmfdbuser"
DB_PASSWORD="Td98vzeM82" # used only for local DB on dev machine

# get DB container up and running
docker compose --file docker-compose-db.yml up --detach

# create postgres user to create database later
docker exec -it $DB_CONTAINER_NAME createuser --username postgres --no-superuser --createdb --no-createrole $DB_USERNAME

# create database using new user
docker exec -it $DB_CONTAINER_NAME createdb --username $DB_USERNAME $DB_NAME

# access postgres shell to change postgres user password
docker exec -it $DB_CONTAINER_NAME psql --username postgres --command "ALTER USER $DB_USERNAME WITH ENCRYPTED PASSWORD '$DB_PASSWORD'"

# copy SQL files for setting up database / seeding data
docker cp app/.server/db/sql/ $DB_CONTAINER_NAME:/sql-files

# run seeding scripts
docker exec -it $DB_CONTAINER_NAME psql --username $DB_USERNAME --dbname $DB_NAME --file ./sql-files/schema.sql
docker exec -it $DB_CONTAINER_NAME psql --username $DB_USERNAME --dbname $DB_NAME --file ./sql-files/vietnamese-admin-units-data.sql

# remove SQL files
docker exec -it $DB_CONTAINER_NAME rm -rf /sql-files

# take down DB container
docker compose --file docker-compose-db.yml down