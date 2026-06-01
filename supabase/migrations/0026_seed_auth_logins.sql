-- 0026_seed_auth_logins.sql
-- EDU LUZ — kanoniczne konta testowe (logowanie email/hasło).
--
-- Zamiast tworzyć puste konta, POWIĄZUJEMY kanoniczne loginy z istniejącymi
-- profilami person z seeda (mają pełne dane: zajęcia, lekcje, płatności).
--   admin@edu-luz.com  / admin123   → profil …01 (admin)
--   tutor@edu-luz.com  / tutor123   → Tomasz Kowalski …10 (tutor)
--   rodzic@edu-luz.com / rodzic123  → Monika Nowak …20 (parent)
--   uczen@edu-luz.com  / uczen123   → Kacper Nowak …30 (student)
--
-- Ustawiamy hasło (bcrypt), potwierdzony email i ZERUJEMY tokeny (GoTrue
-- odrzuca login gdy pola tokenów są NULL). Tworzymy też wpis w auth.identities
-- dla providera 'email' — wymagany przez signInWithPassword.
--
-- ROLA idzie do raw_app_meta_data (niemodyfikowalne przez użytkownika), przez
-- merge `||` żeby zachować {provider, providers}. Imię/nazwisko zostają w
-- raw_user_meta_data (dane profilowe).

-- ── auth.users: email + hasło + tokeny + metadata roli ──
update auth.users set
  email = 'admin@edu-luz.com',
  encrypted_password = extensions.crypt('admin123', extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = '', recovery_token = '', email_change = '', email_change_token_new = '',
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'admin'),
  raw_user_meta_data = jsonb_build_object('first_name', 'Kacper', 'last_name', 'Luchowski'),
  updated_at = now()
where id = '99999999-0000-0000-0000-000000000001';

update auth.users set
  email = 'tutor@edu-luz.com',
  encrypted_password = extensions.crypt('tutor123', extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = '', recovery_token = '', email_change = '', email_change_token_new = '',
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'tutor'),
  raw_user_meta_data = jsonb_build_object('first_name', 'Tomasz', 'last_name', 'Kowalski'),
  updated_at = now()
where id = '99999999-0000-0000-0000-000000000010';

update auth.users set
  email = 'rodzic@edu-luz.com',
  encrypted_password = extensions.crypt('rodzic123', extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = '', recovery_token = '', email_change = '', email_change_token_new = '',
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'parent'),
  raw_user_meta_data = jsonb_build_object('first_name', 'Monika', 'last_name', 'Nowak'),
  updated_at = now()
where id = '99999999-0000-0000-0000-000000000020';

update auth.users set
  email = 'uczen@edu-luz.com',
  encrypted_password = extensions.crypt('uczen123', extensions.gen_salt('bf')),
  email_confirmed_at = coalesce(email_confirmed_at, now()),
  confirmation_token = '', recovery_token = '', email_change = '', email_change_token_new = '',
  raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', 'student'),
  raw_user_meta_data = jsonb_build_object('first_name', 'Kacper', 'last_name', 'Nowak'),
  updated_at = now()
where id = '99999999-0000-0000-0000-000000000030';

-- ── profiles.email zsynchronizowany z loginem ──
update profiles set email = 'admin@edu-luz.com'  where id = '99999999-0000-0000-0000-000000000001';
update profiles set email = 'tutor@edu-luz.com'  where id = '99999999-0000-0000-0000-000000000010';
update profiles set email = 'rodzic@edu-luz.com' where id = '99999999-0000-0000-0000-000000000020';
update profiles set email = 'uczen@edu-luz.com'  where id = '99999999-0000-0000-0000-000000000030';

-- ── auth.identities (provider 'email') — wymagane do logowania hasłem ──
insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
values
  (gen_random_uuid(), '99999999-0000-0000-0000-000000000001', '99999999-0000-0000-0000-000000000001', 'email',
   jsonb_build_object('sub', '99999999-0000-0000-0000-000000000001', 'email', 'admin@edu-luz.com', 'email_verified', true), now(), now(), now()),
  (gen_random_uuid(), '99999999-0000-0000-0000-000000000010', '99999999-0000-0000-0000-000000000010', 'email',
   jsonb_build_object('sub', '99999999-0000-0000-0000-000000000010', 'email', 'tutor@edu-luz.com', 'email_verified', true), now(), now(), now()),
  (gen_random_uuid(), '99999999-0000-0000-0000-000000000020', '99999999-0000-0000-0000-000000000020', 'email',
   jsonb_build_object('sub', '99999999-0000-0000-0000-000000000020', 'email', 'rodzic@edu-luz.com', 'email_verified', true), now(), now(), now()),
  (gen_random_uuid(), '99999999-0000-0000-0000-000000000030', '99999999-0000-0000-0000-000000000030', 'email',
   jsonb_build_object('sub', '99999999-0000-0000-0000-000000000030', 'email', 'uczen@edu-luz.com', 'email_verified', true), now(), now(), now())
on conflict do nothing;
