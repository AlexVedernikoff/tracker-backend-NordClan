#!/bin/sh
set -e

docker-compose -f docker-compose.dev.yml up --abort-on-container-exit --no-build 
