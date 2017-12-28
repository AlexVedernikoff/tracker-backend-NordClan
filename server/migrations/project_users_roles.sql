CREATE TABLE IF NOT EXISTS "project_users_roles" ("id"   SERIAL , "project_user_id" INTEGER NOT NULL REFERENCES "project_users" ("id") ON DELETE NO ACTION ON UPDATE CASCADE, "project_role_id" INTEGER NOT NULL REFERENCES "project_roles" ("id") ON DELETE NO ACTION ON UPDATE CASCADE, PRIMARY KEY ("id"));
ALTER TABLE "project_users" DROP COLUMN "roles_ids";