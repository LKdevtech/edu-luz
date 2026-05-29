-- 0025_auth_profile_trigger.sql
-- EDU LUZ — automatyczne tworzenie profilu po rejestracji w auth.users.
--
-- Przy rejestracji (Supabase Auth) rola + imię/nazwisko są przekazywane w
-- raw_user_meta_data (np. { "role": "parent", "first_name": "...", "last_name": "..." }).
-- Trigger tworzy odpowiadający rekord w public.profiles.
--
-- UWAGA: ta migracja jest PO wszystkich migracjach seedowych (0015–0024), więc
-- ręczne inserty profili w seedach NIE kolidują (trigger jeszcze nie istniał gdy
-- seed wstawiał auth.users). Trigger dotyczy realnych rejestracji w runtime.
-- Gdy brak 'role' w metadanych — trigger nic nie robi (profil zakłada się ręcznie).

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ? 'role' then
    insert into public.profiles (id, role, first_name, last_name, email, phone)
    values (
      new.id,
      (new.raw_user_meta_data ->> 'role')::user_role,
      coalesce(nullif(new.raw_user_meta_data ->> 'first_name', ''), 'Użytkownik'),
      coalesce(new.raw_user_meta_data ->> 'last_name', ''),
      new.email,
      new.raw_user_meta_data ->> 'phone'
    )
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
