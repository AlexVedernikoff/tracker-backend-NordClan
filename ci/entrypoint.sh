#!/usr/bin/env sh
set -e

wait_for() {
    local _host=$1
    local _port=$2
    echo "*** $(date +"%F %T (%Z)") [Entrypoint] start wait for $_host:$_port";
    while ! nc -w 10 -zv $_host $_port;
    do
        echo "$_host:$_port unavailable, waiting";
    done
}

if [ -z ${WAIT_FOR_HOST} ]; then
    echo "*** $(date +"%F %T (%Z)") [Entrypoint] skip waiting";
    else
        wait_for $WAIT_FOR_HOST ${WAIT_FOR_PORT:-80}
fi

if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
    echo "*** $(date +"%F %T (%Z)") [Entrypoint] start DB migrate";
    node_modules/.bin/sequelize db:migrate; 

    ec=$?;
    if [ "$ec" -ne 0 ]; then
        echo "*** $(date +"%F %T (%Z)") [Entrypoint] DB migration failed (exit code != 0)";
        exit 1;
    fi
fi
if [ -f sync/users/index.js ]; then
    echo "*** $(date +"%F %T (%Z)") [Entrypoint] start sync";
    node sync/users/index.js;
    else 
      echo "*** $(date +"%F %T (%Z)") [Entrypoint]  sync skipped";
fi

echo "*** $(date +"%F %T (%Z)") [Entrypoint] starting $*";
exec "$@"
