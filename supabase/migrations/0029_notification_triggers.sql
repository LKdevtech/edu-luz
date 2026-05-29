-- 0029_notification_triggers.sql
-- EDU LUZ — powiadomienia tworzone po stronie bazy (triggery).
--
-- DLACZEGO TRIGGERY: RLS (0027) pozwala wstawiać do `notifications` tylko
-- adminowi. Korepetytor zgłaszający nieobecność lub publikujący wpis NIE może
-- z poziomu klienta wstawić powiadomienia dla admina/rodzica/ucznia. Triggery
-- SECURITY DEFINER omijają RLS i tworzą powiadomienia atomowo z zapisem danych.
--
-- Umieszczone PO migracjach seedowych (0015–0024), więc seed nie generuje
-- powiadomień (trigger jeszcze nie istnieje gdy seed wstawia dane).

-- ════════════════════════════════════════════════════════════════════════════
-- 1. Nowa nieobecność korepetytora → powiadomienie dla wszystkich adminów
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.notify_admins_new_absence()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tutor_name text;
  v_date_label text;
begin
  -- tutor_absences.tutor_id = tutors.profile_id = profiles.id
  select p.first_name || ' ' || p.last_name
    into v_tutor_name
  from profiles p
  where p.id = new.tutor_id;

  v_date_label := to_char(new.start_date, 'DD.MM.YYYY');
  if new.end_date <> new.start_date then
    v_date_label := v_date_label || ' – ' || to_char(new.end_date, 'DD.MM.YYYY');
  end if;

  insert into notifications (user_id, type, title, message)
  select
    pr.id,
    'absence',
    'Nowa nieobecność korepetytora',
    coalesce(v_tutor_name, 'Korepetytor') || ' zgłosił nieobecność (' || v_date_label || ').'
      || case
           when new.reason is not null and new.reason <> '' then ' Powód: ' || new.reason || '.'
           else ''
         end
  from profiles pr
  where pr.role = 'admin';

  return new;
end;
$$;

drop trigger if exists on_tutor_absence_created on tutor_absences;
create trigger on_tutor_absence_created
  after insert on tutor_absences
  for each row execute function public.notify_admins_new_absence();

-- ════════════════════════════════════════════════════════════════════════════
-- 2. Publikacja wpisu → powiadomienie dla ucznia (uczniów) i rodzica (rodziców)
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.notify_entry_published()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lesson_date date;
  v_student_id uuid;
  v_group_id uuid;
  v_subject text;
  v_date_label text;
  v_msg text;
begin
  -- tylko przy PRZEJŚCIU do 'published'
  if new.status <> 'published' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    if old.status = 'published' then
      return new; -- już opublikowane wcześniej — nie duplikuj
    end if;
  end if;

  select l.lesson_date, c.student_id, c.group_id, s.name
    into v_lesson_date, v_student_id, v_group_id, v_subject
  from lessons l
  join classes c on c.id = l.class_id
  join subjects s on s.id = l.subject_id
  where l.id = new.lesson_id;

  if not found then
    return new;
  end if;

  v_subject := coalesce(v_subject, 'Zajęcia');
  v_date_label := to_char(v_lesson_date, 'DD.MM.YYYY');
  v_msg := 'Korepetytor dodał wpis z lekcji: ' || v_subject || ' (' || v_date_label || ').';

  with target_students as (
    select stu.profile_id, stu.parent_id
    from students stu
    where (v_student_id is not null and stu.profile_id = v_student_id)
       or (v_group_id is not null and exists (
             select 1 from group_members gm
             where gm.group_id = v_group_id
               and gm.student_id = stu.profile_id
               and gm.left_at is null
           ))
  )
  insert into notifications (user_id, type, title, message)
  select uid, 'entry_added', 'Nowy wpis z lekcji', v_msg
  from (
    select profile_id as uid from target_students
    union
    select parent_id as uid from target_students
  ) recipients;

  return new;
end;
$$;

drop trigger if exists on_entry_published on entries;
create trigger on_entry_published
  after insert or update on entries
  for each row execute function public.notify_entry_published();
