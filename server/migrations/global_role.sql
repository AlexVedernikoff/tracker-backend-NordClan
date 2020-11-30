CREATE TYPE global_role_type AS ENUM ('ADMIN', 'VISOR', 'USER');
ALTER TABLE users ADD COLUMN global_role global_role_type DEFAULT 'USER';