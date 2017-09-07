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


