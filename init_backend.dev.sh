#!/bin/sh
set -e

npm i

docker-compose down
mkdir -p ~/projects/simtrack_db

npm run docker
npm run docker:db
npm run compose:dev
