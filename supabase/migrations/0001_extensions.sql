-- 0001_extensions.sql
-- EDU LUZ — Postgres extensions
--
-- pgcrypto: gen_random_uuid() for primary keys
-- citext:   case-insensitive emails
-- btree_gist: exclusion constraints (np. unikalność slotu sala+czas)

create extension if not exists "pgcrypto";
create extension if not exists "citext";
create extension if not exists "btree_gist";
