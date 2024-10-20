#!/usr/bin/dumb-init /bin/sh

# This is to be used with the Docker Container only!
# The script loads the PSQL certificate and starts the server.

echo $PG_CERT > ./prisma/postgres.crt

node server.js