### Запуск проект с docker

Для запуска полного стека:

#### !ВНИМАНИЕ описанные шаги обязательны  и требуют точного соблюдения

1. Используйте баш (GITBASH или  CYGWIN на виндовс) и поставьте Node.js LTS ( 8.6 на момент написания) и Python 2.7(идет в поставке линукс автоматом обычно)
2. положите фронт рядом с беком (пример /projects/sim-track и /projects/sim-track-back, если названия папок другие проверьте правильность в docker-compose.yml раздел web volumes, он отвечает за хотрелоад)э
3. дайте sh скриптам права на выполнение
        
        find ./ -type f -iname "*.sh" -exec chmod +x {} \;

4. поставьте менеджер зависимостей pip - менеджером пакетов Python https://pip.pypa.io/en/stable/installing/ - он служит для установки питоновских зависимостей. npm НЕ МОЖЕТ заменить pip
5. установить docker и docker-compose. проще всего сделать это с 
        
        pip install 'docker<3.0'
        pip install 'docker-compose'
        # возможно потребуются админские привелегии - sudo !!

6. потребуется папка ~/projects/simtrack_db и (возможно)дамп. как стянуть дамп написано в доп.инструкциях

        mkdir -p ~/projects/simtrack_db

7. старт приложения

        npm run compose:up
        #(стартует продакшен версию приложения)
        npm run compose:dev
        #(стартует dev версию проекта, предварительно билдит образ, создает контейнер, с автоматическим перезапусом фронта и бека при изменениях)
        npm run restart:dev
        #(стартует dev версию проекта без билда образа, с автоматическим перезапусом фронта и бека при изменениях)


8. как раскатить миграции при 504 и других ошибках(неизвестное поле, таблица и т.д.). Не помогло - стяните и замените дамп

        sudo docker-compose -f docker-compose.dev.yml exec app bash
        #подключиться к контейнеру

        npm run migrate
        #Выполнить миграции
        
 - на localhost:8080 будет фронт
 - на 8000 - бек
 - на 5432 - база

##### дополнительные инструкции (не обязательны)
- Если нужно обновить локальный файл дампа бд с сервера simtrack-test.simbirsoft

        npm run dump:test

        далее выполнить шаги из пункта "- Если нужно обновить бд из дампа"

        обновленный файл simtrack.sql исключать из коммитов

- Если нужно обновить локальный файл дампа бд с сервера simtrack-dev.simbirsoft

        npm run dump:dev

        далее выполнить шаги из пункта "- Если нужно обновить бд из дампа"

        обновленный файл simtrack.sql исключать из коммитов

- Если нужно обновить бд из дампа

        rm -rf simtrack_db (нужно выполнить в директории ~/projects/ , чтобы удалить старую директорию с базой)

        npm run compose:dev


- restart трех контейнеров

        npm run restart:dev


##### МАЛЕНЬКИЙ РЕФЕРЕНС

старт(build - обязательно собрать образы перед стартом, -d - запустить как демон)

        docker-compose up [--build] [-d]

стоп

        docker-compose stop

удаление сети и контейнеров после up

        docker-compose down

после stop(сеть не удалится)

        docker-compose rm

посмотреть поднятые контейнеры

        docker ps

посмотреть все образы

        docker images

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
