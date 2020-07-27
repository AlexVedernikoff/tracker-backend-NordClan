## Nordclan track backend

### Запуск проекта в докере

Может понадобиться раскомментировать строчку `build: .` в `docker-compose.dev.yml` если есть проблемы с `docker-compose`.

```
$ docker-compose -f docker-compose.dev.yml  build 
$ docker-compose -f docker-compose.dev.yml  up
```

В убунте вызывать с `sudo`.

### Настройки 

#### Фронт и бек должны быть расположены в одной директории, например

~/projects/track-back
~/projects/track-front

#### Для изменения настроек сервера и подключения к базе отредактируйте:
./.docker-compose-dev.env

### Заметки

Используется ldap, Вы должны быть в сетке Nordclan 

## Прочее:
### Настройки crontab

        # Скрипт синхронизации пользователей с пс
        0 12 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/sync/users/index.js >/dev/null 2>&1
        # Удаления драфтов
        30 0 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/cronjobs/deleteDrafts.js >/dev/null 2>&1
        # Скрипт создания драфтов на каждый день
        0 1 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/cronjobs/createDrafts/index.js >/dev/null 2>&1

Back up PostgreSQL databases using cron jobs https://www.a2hosting.com/kb/developer-corner/postgresql/postgresql-database-backups-using-cron-jobs

### Запуск тестов
`npm test`

### Сделать ручной dump базы на проде
pg_dump -U postgres -F c -f dump.tar.gz 'sim-track' -W --host 127.0.0.1

### Зайти в базу на проде
psql -U postgres -W --host 127.0.0.1
