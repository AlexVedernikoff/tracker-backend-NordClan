#!/bin/sh
set -e

docker-compose down
npm run compose:up
