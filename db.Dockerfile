FROM postgres:17-alpine3.20

# Ref: https://hub.docker.com/_/postgres in section "Initialization scripts"
# Note: files are renamed to ensure they are executed in the correct order
COPY app/.server/db/sql/schema.sql /docker-entrypoint-initdb.d/1.sql
COPY app/.server/db/sql/vietnamese-admin-units-data.sql /docker-entrypoint-initdb.d/2.sql
