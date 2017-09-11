#!/bin/bash
#doing dump of db

docker exec -i sim_db rm -rf /pg/dump.tar.gz
docker exec -i sim_db pg_dump -U $POSTGRES_USER -F c -f /pg/dump.tar.gz "$POSTGRES_DB"