## Nordclan track backend

### Процесс создания МР
##### МР считается сразу же не пройденным, если данные условия не были выполнены:

- Название ветки начинается с типа задачи (**feat** или **bug**) и номера задачи через слэш, например: feat/TR-123 ` или bug/TR-123
- МР делается на ветку **develop**, после успешного прохождения тестирования на ветке **develop**, создается МР на ветку **staging**
- Каждый МР должен **содержать ссылку на задачу** в описании
- Каждый МР должен содержать только **ОДИН** коммит, касающийся задачи. Исправления по ревью должны объединятся с этим коммитом

### Запуск проекта в докере

#### Ошибка `data directory "/var/lib/postgresql/data" has wrong ownership`

В файле `docker-compose.dev.yml` добавить `environment: PGDATA ...` в раздел `db:`:

```
    ...
    env_file:
      - .docker-compose-dev.env
    restart: unless-stopped
    environment:
      PGDATA: /tmp
```

#### Ошибка `The image for the service youre trying to recreate has been removed`

В файле `docker-compose.dev.yml` закоментировать `image: back:t2` и раскоментировать `build: .`:

```
#    build: .
    image: back:t2

    build: .
#    image: back:t2
```

#### Ошибка `import(url.pathToFileURL(process.env.pm_exec_path))`

Изменить в файле Dockerfile версию node на 10.16 и в RUN  дописать npm install pm2 -g && \ pm2 update

#### Не запускается фронтенд (висит на `Database connection...`)

Раскоментировать в `docker-compose.dev.yml` весь раздел `web:` (просто убрать решётки).

#### Ошибка `502 Bad Gateway` при авторизации

Поменять `LDAP_URL` в файле `.docker-compose-dev.env`:

```
LDAP_URL=ldap://ldap-test.nordclan:389
```

на

```
LDAP_URL=ldap://ldap-test.nordclan:389/dc=nordclan
```

### Запуск проекта в докере - фронтенд собирается и хостится здесь же

### ВАЖНО
Необходимо установить на компьютер следующие зависимости:
- python 2
- node-gyp 3.8
- node js 13.0.0

```
$ docker-compose -f docker-compose.dev.yml  build 
$ docker-compose -f docker-compose.dev.yml  up
```

### Настройки 

#### Фронт и бек должны быть расположены в одной директории, например

~/projects/track-back
~/projects/track-front

#### Для изменения настроек сервера и подключения к базе отредактируйте:
./.docker-compose-dev.env

## Прочее:
### Настройки crontab

        # Скрипт синхронизации пользователей с пс
        0 12 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/sync/users/index.js >/dev/null 2>&1
        # Удаления драфтов
        30 0 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/cronjobs/deleteDrafts.js >/dev/null 2>&1
        # Скрипт создания драфтов на каждый день
        0 1 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/cronjobs/createDrafts/index.js >/dev/null 2>&1

Back up PostgreSQL databases using cron jobs https://www.a2hosting.com/kb/developer-corner/postgresql/postgresql-database-backups-using-cron-jobs

### Сделать ручной dump базы на проде
pg_dump -U postgres -F c -f dump.tar.gz 'sim-track' -W --host 127.0.0.1

### Зайти в базу на проде
psql -U postgres -W --host 127.0.0.1
