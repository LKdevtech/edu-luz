-- 0000_enable_extensions.sql
-- EDU LUZ — pgcrypto na Supabase Cloud
--
-- Na Supabase Cloud rozszerzenia żyją w schemacie `extensions` (nie `public`).
-- Migracja sortuje się przed 0001, żeby crypt()/gen_salt() były dostępne
-- jako extensions.crypt()/extensions.gen_salt() we wszystkich seedach.

create extension if not exists pgcrypto with schema extensions;
