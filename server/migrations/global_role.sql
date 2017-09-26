CREATE TYPE enum_type AS ENUM ('admin', 'visor', 'user');
ALTER TABLE users ADD COLUMN global_role enum_type DEFAULT 'user';