#!/bin/sh

mkdir -p ~/projects/simtrack_db

npm run docker
npm run docker:db
npm run compose:up
