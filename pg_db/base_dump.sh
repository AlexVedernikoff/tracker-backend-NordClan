#!/bin/bash
#doing dump of db

set -e

DUMP_PATH=/pg/dump.tar.gz
DOCKER_CONTAINER=sim_db
DOCKER_SERVICE=db
DB_USER=postgres
DB_NAME=sim-track

docker-compose down
docker-compose up -d "${DOCKER_SERVICE}"
sleep 15
docker exec -i "${DOCKER_CONTAINER}" rm -rf "${DUMP_PATH}"
docker exec -i "${DOCKER_CONTAINER}" pg_dump -U "${DB_USER}" -F c -f "${DUMP_PATH}" "${DB_NAME}"

docker-compose stop "${DOCKER_SERVICE}"
