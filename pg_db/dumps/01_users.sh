#!/bin/bash

echo "CREATE ROLE simtrack WITH LOGIN SUPERUSER INHERIT NOCREATEDB NOCREATEROLE NOREPLICATION ENCRYPTED PASSWORD '123456'" | psql -a -f -
