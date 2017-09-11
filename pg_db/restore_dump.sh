#!/bin/bash
#restore db from dump

docker exec -i sim_db pg_restore -d "$POSTGRES_DB" -U $POSTGRES_USER /pg/dump.tar.gz
