CREATE TABLE IF NOT EXISTS "project_users_subscriptions" ("id"   SERIAL , "project_user_id" INTEGER NOT NULL REFERENCES "project_users" ("id") ON DELETE CASCADE ON UPDATE CASCADE, "project_event_id" INTEGER NOT NULL REFERENCES "project_events" ("id") ON DELETE NO ACTION ON UPDATE CASCADE, PRIMARY KEY ("id"));

CREATE TABLE IF NOT EXISTS "project_events" ("id" INTEGER NOT NULL , "name" VARCHAR(255) NOT NULL, PRIMARY KEY ("id"));
INSERT INTO project_events VALUES (1, 'Новая задача в проекте');
INSERT INTO project_events VALUES (2, 'Присвоена новая задача');
INSERT INTO project_events VALUES (3, 'Новый комментарий к задаче');
INSERT INTO project_events VALUES (4, 'Изменен статус задачи');
INSERT INTO project_events VALUES (5, 'Новое упоминание в комментарии к задаче');

- create project users subscriptions
- add subscriptions_ids column to project users
- create project events dictionary and fill it 


- create subscriptions for existing users ?
- fill subscriptions_ids column to project users ?

1991
97
INSERT INTO project_users_subscriptions VALUES (1, 97, 1);
INSERT INTO project_users_subscriptions VALUES (2, 97, 2);
INSERT INTO project_users_subscriptions VALUES (3, 97, 3);
INSERT INTO project_users_subscriptions VALUES (4, 97, 4);
INSERT INTO project_users_subscriptions VALUES (5, 97, 5);