#!/bin/bash

# get postgres image container up and running
pnpm run db:up -d

# create postgres user to create database later
docker exec -it homemadefood-db.dev.postgres createuser --username postgres --no-superuser --createdb --no-createrole hmfdbuser

# create database using new user
docker exec -it homemadefood-db.dev.postgres createdb --username hmfdbuser hmfdb

# access postgres shell to change postgres user password
docker exec -it homemadefood-db.dev.postgres psql --username postgres -c "ALTER USER hmfdbuser WITH ENCRYPTED PASSWORD 'Td98vzeM82'"