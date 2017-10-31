***Инструкция по развертыванию системы на windows

1. Нужно установить вагрант https://www.vagrantup.com/

2. Для винды еще нужен hyperv или virtual box. На других осях не знаю.

3. Скопирвоать этот вагрант файл в отдельную папку
Не знаю на каокй оси ты разврачеваешь, у меня винда.
config.vm.box = "tvinhas/ubuntu-16.04-hyperv" - настройка где указываешь образ виртуальной системы
У тебя он возможно будет отличаться в зависимости от ос. Можно нагуглить и найти свой образ
config.vm.synced_folder "../sim-track-back", "/vagrant" - указать папку которая будет сихранизироваться с вируалкой
config.vm.provider "hyperv" - средство виртуализации в моем случае это hyperv

4. vagrant up - эту команду нужно выполнить в дирректории где находится вагрант файл
vagrant halt выключить
vagrant reload
vagrant ssh

5. Установка postgres sudo apt-get install postgresql
Хорошая статья по установке http://help.ubuntu.ru/wiki/%D1%80%D1%83%D0%BA%D0%BE%D0%B2%D0%BE%D0%B4%D1%81%D1%82%D0%B2%D0%BE_%D0%BF%D0%BE_ubuntu_server/%D0%B1%D0%B0%D0%B7%D1%8B_%D0%B4%D0%B0%D0%BD%D0%BD%D1%8B%D1%85/postgresql
Кроме того
apt-get install build-essential
apt-get install graphicsmagick

6. Создание базы данных. По умолчанию создается пользователь postgres для базы данных
Выполнить команду под root
sudo -u postgres psql
И выполнить
CREATE DATABASE "sim-track"
  WITH OWNER "postgres"
  ENCODING 'UTF8'
  LC_COLLATE = 'ru_RU.utf8'
  LC_CTYPE = 'ru_RU.utf8'
  TEMPLATE = template0;

Может не оказаться установленной русской локали, тут не помню точно по какой статье я делал, что-то типо этой:
http://asyncee.github.io/2016/04/17/ustanovka-postgresql-v-ubuntu-linut-mint/

7. server\configs\indes.js - настройки подключения к бд и прочие
8. Чтобы загрузить все эти таблицы в бд выполнить, нужно раскомменировать все модели и словари в файле sync/resetDb.js и выполнить node sync/resetDb
9. Выполнить node sunc/users/index для наполнения базы пользователями с ldap
10. node server или pm2 start processes.json что бы запустить бек

## ОТДЕЛЬНАЯ ИНСТРУКЦИЯ !!! НЕ СВЯЗАНА С ВАГРАНТОМ. ЕЩЕ 1 способ быстрого разворота
### DOCKER
##### Обязательно
Для запуска полного стека:


1. Используйте баш и поставьте Node.js LTS ( 6.11.3 на момент написания)

2. положите фронт рядом с беком (пример /projects/sim-track-front и /projects/sim-track-back, если названия папок другие проверьте правильность в docker-compose.yml раздел web volumes, он отвечает за хотрелоад)

3. установить docker и docker-compose

4. в папке фронтенда

        npm run docker

5. в папке бекенда для накатки дампа положите свежий дамп dump.tar.gz в папку ./pg_db

        npm run db:restore

5. старт приложения с 0

        npm run init:app

- на localhost:8080 будет фронт
- на 8000 - бек
- на 5432 - база

##### дополнительные инструкции (не обязательны)


- чтобы создать дамп из контейнера

        npm run db:dump

- restart трех контейнеров

        npm run restart

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
### Настройки crontab на текущий момент
Настройка синхронизации пользователей с LDAP и PS
Настройка резервного копирования бд

        0 12 * * * cd /var/www/back && /usr/local/bin/node /var/www/back/sync/users/index.js >/dev/null 2>&1
        0 6 * * * pg_dump --no-password -U postgres -h localhost -F c -f /var/www/backupDb/backup-`date +\%d-\%m-\%y--\%H-\%M-\%S`.pgsql sim-track

Back up PostgreSQL databases using cron jobs https://www.a2hosting.com/kb/developer-corner/postgresql/postgresql-database-backups-using-cron-jobs

### Запуск тестов
`npm test`
