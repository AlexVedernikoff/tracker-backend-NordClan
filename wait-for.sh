#!/bin/sh
# wait-for-postgres.sh

set -e

time="$1"
shift
cmd="$@"

sleep $time

exec $cmd