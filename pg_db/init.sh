#!/bin/bash
set -e

ls /pg/dump.tar.gz  && \
    pg_restore -d "$POSTGRES_DB" /pg/dump.tar.gz
