#!/bin/bash
timestamp=$(date +%Y-%m-%d_%H:%M:%S)

PGPASSWORD='la4eeH2m' pg_dump --username='simtrack' --host='simtrack-test.simbirsoft' --port=33233 --format=p --file=$(pwd)/pg_db/dump_${timestamp}\.sql 'simtrack'
rm -rf $(pwd)/pg_db/dumps/simtrack\.sql\.old ||:
mv $(pwd)/pg_db/dumps/simtrack\.sql $(pwd)/pg_db/dumps/simtrack\.sql\.old
cp $(pwd)/pg_db/dump_${timestamp}\.sql $(pwd)/pg_db/dumps/simtrack\.sql
