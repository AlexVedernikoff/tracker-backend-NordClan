#!/bin/bash
#assumes db service for postgres
#assumes local storage for db data is ~/projects/simtrack_db/
# see docker-compose.yml
#assumes dump is /pg/dump.tar.gz
#assumes db name sim-track, db user postges
#see nearest Dockerfile

set -e

PG_DATA=~/projects/simtrack_db/
DOCKER_CONTAINER_NAME=sim_db
DB_NAME=sim-track
DB_USER=postgres
LOCAL_DUMP_PATH="/pg/dump.tar.gz"
DOCKER_SERVICE=db

#kill old and create new db
docker-compose down
sudo rm -rf "${PG_DATA}"
mkdir -p "${PG_DATA}"
npm run docker:db

docker-compose up -d "${DOCKER_SERVICE}"
sleep 15
docker exec -i "${DOCKER_CONTAINER_NAME}" pg_restore -U "${DB_USER}" -d "${DB_NAME}" "${LOCAL_DUMP_PATH}"
docker-compose stop "${DOCKER_SERVICE}"