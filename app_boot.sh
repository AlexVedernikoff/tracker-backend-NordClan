#!/bin/sh

if [ ! -d "node_modules" ]; then
  npm install
  npm rebuild
  node sync/resetDb.js
fi

npm run migrate
pm2-runtime start --env development processes-debug.json
