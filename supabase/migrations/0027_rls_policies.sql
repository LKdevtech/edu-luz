-- 0027_rls_policies.sql
-- EDU LUZ — Row Level Security na wszystkich tabelach + polityki per rola.
--
-- Model:
--   • Rola czytana z JWT: auth.jwt() -> 'app_metadata' ->> 'role'  (bez zapytań
--     do profiles → brak rekurencji w politykach).
--   • auth.uid() = profiles.id = {tutors,parents,students}.profile_id.
--   • Admin → pełen dostęp do wszystkiego (catch-all is_admin()).
--   • Tutor/Parent/Student → wiersze powiązane z nimi (helpery security definer
--     liczą przynależność OMIJAJĄC RLS, więc nie ma rekurencji).
--   • Seed i trigger handle_new_user() działają jako rola postgres/owner podczas
--     migracji → omijają RLS. Klient aplikacji używa klucza anon + sesji JWT
--     (rola `authenticated`) → podlega politykom.
--
-- Rola w app_metadata jest ustawiana wyłącznie po stronie serwera (admin API /
-- SQL) — użytkownik NIE może jej zmienić przez auth.updateUser (to dotyczy tylko
-- user_metadata). Dzięki temu autoryzacja oparta na app_metadata.role jest twarda.

-- ════════════════════════════════════════════════════════════════════════════
-- 1. Helpery
-- ════════════════════════════════════════════════════════════════════════════

-- Rola z JWT (app_metadata). STABLE, nie odpytuje tabel.
create or replace function public.auth_role()
returns text language sql stable as $$
  select nullif(auth.jwt() -> 'app_metadata' ->> 'role', '')
$$;

create or replace function public.is_admin()
returns boolean language sql stable as $$
  select public.auth_role() = 'admin'
$$;

-- Czy zalogowany jest rodzicem danego ucznia.
create or replace function public.is_my_child(p_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from students s
    where s.profile_id = p_student and s.parent_id = auth.uid()
  )
$$;

-- Czy dane zajęcia (class) należą do zalogowanego rodzica.
create or replace function public.parent_owns_class(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from classes c
    where c.id = p_class and (
      (c.student_id is not null and exists (
        select 1 from students s
        where s.profile_id = c.student_id and s.parent_id = auth.uid()
      ))
      or (c.group_id is not null and exists (
        select 1 from group_members gm
        join students s on s.profile_id = gm.student_id
        where gm.group_id = c.group_id and gm.left_at is null and s.parent_id = auth.uid()
      ))
    )
  )
$$;

-- Czy dane zajęcia należą do zalogowanego ucznia.
create or replace function public.student_owns_class(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from classes c
    where c.id = p_class and (
      c.student_id = auth.uid()
      or (c.group_id is not null and exists (
        select 1 from group_members gm
        where gm.group_id = c.group_id and gm.student_id = auth.uid() and gm.left_at is null
      ))
    )
  )
$$;

-- Czy dane zajęcia prowadzi zalogowany korepetytor.
create or replace function public.tutor_owns_class(p_class uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from classes c where c.id = p_class and c.tutor_id = auth.uid())
$$;

-- Czy zalogowany korepetytor uczy danego ucznia (dowolne jego zajęcia).
create or replace function public.tutor_teaches_student(p_student uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from classes c
    where c.tutor_id = auth.uid() and (
      c.student_id = p_student
      or (c.group_id is not null and exists (
        select 1 from group_members gm
        where gm.group_id = c.group_id and gm.student_id = p_student and gm.left_at is null
      ))
    )
  )
$$;

-- Czy grupę prowadzi zalogowany korepetytor.
create or replace function public.tutor_owns_group(p_group uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from groups g where g.id = p_group and g.tutor_id = auth.uid())
$$;

-- Denormalizacje przez lekcję / wpis / pracę domową / makeup / płatność.
create or replace function public.lesson_class(p_lesson uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select class_id from lessons where id = p_lesson
$$;

create or replace function public.lesson_tutor(p_lesson uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select tutor_id from lessons where id = p_lesson
$$;

create or replace function public.entry_lesson(p_entry uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select lesson_id from entries where id = p_entry
$$;

create or replace function public.homework_lesson(p_homework uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select e.lesson_id from homework h join entries e on e.id = h.entry_id where h.id = p_homework
$$;

create or replace function public.makeup_request_lesson(p_request uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select original_lesson_id from makeup_requests where id = p_request
$$;

create or replace function public.payment_parent(p_payment uuid)
returns uuid language sql stable security definer set search_path = public as $$
  select parent_id from payments where id = p_payment
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- 2. Enable RLS na wszystkich tabelach
-- ════════════════════════════════════════════════════════════════════════════

alter table profiles                     enable row level security;
alter table subjects                     enable row level security;
alter table rooms                        enable row level security;
alter table center_settings              enable row level security;
alter table working_hours                enable row level security;
alter table contract_terms               enable row level security;
alter table parents                      enable row level security;
alter table students                     enable row level security;
alter table tutors                       enable row level security;
alter table tutor_subjects               enable row level security;
alter table tutor_rates                  enable row level security;
alter table availability_blocks          enable row level security;
alter table extra_slots                  enable row level security;
alter table groups                       enable row level security;
alter table group_members                enable row level security;
alter table classes                      enable row level security;
alter table weekly_slots                 enable row level security;
alter table lessons                      enable row level security;
alter table attendance                   enable row level security;
alter table schedule_exceptions          enable row level security;
alter table entries                      enable row level security;
alter table entry_parent_notes           enable row level security;
alter table homework                     enable row level security;
alter table homework_completions         enable row level security;
alter table payments                     enable row level security;
alter table payment_lines                enable row level security;
alter table payment_reminder_templates   enable row level security;
alter table payment_reminders_sent       enable row level security;
alter table notification_preferences     enable row level security;
alter table makeup_requests              enable row level security;
alter table makeup_proposals             enable row level security;
alter table tutor_absences               enable row level security;
alter table admin_announcements          enable row level security;
alter table direct_messages              enable row level security;
alter table lesson_cancel_requests       enable row level security;
alter table tutor_penalty_points         enable row level security;
alter table notifications                enable row level security;

-- ════════════════════════════════════════════════════════════════════════════
-- 3. Admin — pełen dostęp (catch-all na każdej tabeli)
-- ════════════════════════════════════════════════════════════════════════════

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','subjects','rooms','center_settings','working_hours','contract_terms',
    'parents','students','tutors','tutor_subjects','tutor_rates','availability_blocks',
    'extra_slots','groups','group_members','classes','weekly_slots','lessons','attendance',
    'schedule_exceptions','entries','entry_parent_notes','homework','homework_completions',
    'payments','payment_lines','payment_reminder_templates','payment_reminders_sent',
    'notification_preferences','makeup_requests','makeup_proposals','tutor_absences',
    'admin_announcements','direct_messages','lesson_cancel_requests','tutor_penalty_points',
    'notifications'
  ]
  loop
    execute format(
      'create policy %1$I_admin_all on public.%1$I for all to authenticated '
      'using (public.is_admin()) with check (public.is_admin());', t);
  end loop;
end $$;

-- ════════════════════════════════════════════════════════════════════════════
-- 4. Tabele słownikowe / referencyjne — SELECT dla każdego zalogowanego
--    (zapis tylko admin — przez catch-all wyżej)
-- ════════════════════════════════════════════════════════════════════════════

create policy subjects_read_auth   on subjects   for select to authenticated using (true);
create policy rooms_read_auth      on rooms      for select to authenticated using (true);
create policy center_read_auth     on center_settings for select to authenticated using (true);
create policy working_read_auth    on working_hours   for select to authenticated using (true);
create policy contract_read_auth   on contract_terms  for select to authenticated using (true);
create policy reminder_tpl_read_auth on payment_reminder_templates for select to authenticated using (true);
-- Korepetytorzy/grupy/przedmioty są widoczne wszędzie (nazwy w joinach UI).
create policy tutors_read_auth     on tutors        for select to authenticated using (true);
create policy tutor_subj_read_auth on tutor_subjects for select to authenticated using (true);
create policy groups_read_auth     on groups        for select to authenticated using (true);
-- Wolne terminy korepetytora (propozycje odrabiania) — niewrażliwe.
create policy extra_slots_read_auth on extra_slots  for select to authenticated using (true);

-- ════════════════════════════════════════════════════════════════════════════
-- 5. profiles — SELECT każdy zalogowany (nazwy w joinach), UPDATE własny
-- ════════════════════════════════════════════════════════════════════════════

create policy profiles_read_auth   on profiles for select to authenticated using (true);
create policy profiles_update_self on profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- 6. Tożsamości: students / parents
-- ════════════════════════════════════════════════════════════════════════════

-- students: widoczny dla siebie, swojego rodzica, korepetytora który go uczy.
create policy students_select_self    on students for select to authenticated
  using (profile_id = auth.uid());
create policy students_select_parent  on students for select to authenticated
  using (parent_id = auth.uid());
create policy students_select_tutor   on students for select to authenticated
  using (public.tutor_teaches_student(profile_id));

-- parents: widoczny dla siebie + dla swojego dziecka.
create policy parents_select_self     on parents for select to authenticated
  using (profile_id = auth.uid());
create policy parents_select_child    on parents for select to authenticated
  using (exists (
    select 1 from students s where s.parent_id = parents.profile_id and s.profile_id = auth.uid()
  ));

-- ════════════════════════════════════════════════════════════════════════════
-- 7. Dane korepetytora powiązane z nim
-- ════════════════════════════════════════════════════════════════════════════

create policy tutor_rates_select_self on tutor_rates for select to authenticated
  using (tutor_id = auth.uid());

create policy penalty_select_self on tutor_penalty_points for select to authenticated
  using (tutor_id = auth.uid());
create policy penalty_insert_self on tutor_penalty_points for insert to authenticated
  with check (tutor_id = auth.uid());

create policy absences_select_self on tutor_absences for select to authenticated
  using (tutor_id = auth.uid());
create policy absences_insert_self on tutor_absences for insert to authenticated
  with check (tutor_id = auth.uid());

-- availability_blocks — pełna kontrola własna korepetytora.
create policy avail_select_self on availability_blocks for select to authenticated
  using (tutor_id = auth.uid());
create policy avail_insert_self on availability_blocks for insert to authenticated
  with check (tutor_id = auth.uid());
create policy avail_update_self on availability_blocks for update to authenticated
  using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy avail_delete_self on availability_blocks for delete to authenticated
  using (tutor_id = auth.uid());

-- extra_slots — zapis własny korepetytora (SELECT publiczny ustawiony wyżej).
create policy extra_slots_insert_self on extra_slots for insert to authenticated
  with check (tutor_id = auth.uid());
create policy extra_slots_update_self on extra_slots for update to authenticated
  using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy extra_slots_delete_self on extra_slots for delete to authenticated
  using (tutor_id = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- 8. classes / group_members / weekly_slots / schedule_exceptions
-- ════════════════════════════════════════════════════════════════════════════

create policy classes_select_tutor   on classes for select to authenticated
  using (tutor_id = auth.uid());
create policy classes_select_parent  on classes for select to authenticated
  using (public.parent_owns_class(id));
create policy classes_select_student on classes for select to authenticated
  using (public.student_owns_class(id));

create policy gm_select_student on group_members for select to authenticated
  using (student_id = auth.uid());
create policy gm_select_parent  on group_members for select to authenticated
  using (public.is_my_child(student_id));
create policy gm_select_tutor   on group_members for select to authenticated
  using (public.tutor_owns_group(group_id));

create policy ws_select_tutor   on weekly_slots for select to authenticated
  using (public.tutor_owns_class(class_id));
create policy ws_select_parent  on weekly_slots for select to authenticated
  using (public.parent_owns_class(class_id));
create policy ws_select_student on weekly_slots for select to authenticated
  using (public.student_owns_class(class_id));

create policy se_select_tutor   on schedule_exceptions for select to authenticated
  using (public.tutor_owns_class(class_id));
create policy se_select_parent  on schedule_exceptions for select to authenticated
  using (public.parent_owns_class(class_id));
create policy se_select_student on schedule_exceptions for select to authenticated
  using (public.student_owns_class(class_id));

-- ════════════════════════════════════════════════════════════════════════════
-- 9. lessons — SELECT wg roli; UPDATE tutor (własne) + parent (odwołanie dziecka)
-- ════════════════════════════════════════════════════════════════════════════

create policy lessons_select_tutor   on lessons for select to authenticated
  using (tutor_id = auth.uid());
create policy lessons_select_parent  on lessons for select to authenticated
  using (public.parent_owns_class(class_id));
create policy lessons_select_student on lessons for select to authenticated
  using (public.student_owns_class(class_id));

create policy lessons_update_tutor  on lessons for update to authenticated
  using (tutor_id = auth.uid()) with check (tutor_id = auth.uid());
create policy lessons_update_parent on lessons for update to authenticated
  using (public.parent_owns_class(class_id)) with check (public.parent_owns_class(class_id));

-- ════════════════════════════════════════════════════════════════════════════
-- 10. attendance — SELECT wg roli; zapis korepetytora prowadzącego lekcję
-- ════════════════════════════════════════════════════════════════════════════

create policy att_select_tutor   on attendance for select to authenticated
  using (public.lesson_tutor(lesson_id) = auth.uid());
create policy att_select_parent  on attendance for select to authenticated
  using (public.is_my_child(student_id));
create policy att_select_student on attendance for select to authenticated
  using (student_id = auth.uid());
create policy att_insert_tutor   on attendance for insert to authenticated
  with check (public.lesson_tutor(lesson_id) = auth.uid());
create policy att_update_tutor   on attendance for update to authenticated
  using (public.lesson_tutor(lesson_id) = auth.uid())
  with check (public.lesson_tutor(lesson_id) = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- 11. entries / entry_parent_notes / homework / homework_completions
-- ════════════════════════════════════════════════════════════════════════════

-- entries
create policy entries_select_tutor   on entries for select to authenticated
  using (public.lesson_tutor(lesson_id) = auth.uid());
create policy entries_select_parent  on entries for select to authenticated
  using (public.parent_owns_class(public.lesson_class(lesson_id)));
create policy entries_select_student on entries for select to authenticated
  using (public.student_owns_class(public.lesson_class(lesson_id)));
create policy entries_insert_tutor   on entries for insert to authenticated
  with check (public.lesson_tutor(lesson_id) = auth.uid());
create policy entries_update_tutor   on entries for update to authenticated
  using (public.lesson_tutor(lesson_id) = auth.uid())
  with check (public.lesson_tutor(lesson_id) = auth.uid());

-- entry_parent_notes — uwagi indywidualne dla rodzica (rodzic NIE widzi cudzych).
create policy epn_select_parent on entry_parent_notes for select to authenticated
  using (public.is_my_child(student_id));
create policy epn_select_tutor  on entry_parent_notes for select to authenticated
  using (public.lesson_tutor(public.entry_lesson(entry_id)) = auth.uid());
create policy epn_insert_tutor  on entry_parent_notes for insert to authenticated
  with check (public.lesson_tutor(public.entry_lesson(entry_id)) = auth.uid());
create policy epn_update_tutor  on entry_parent_notes for update to authenticated
  using (public.lesson_tutor(public.entry_lesson(entry_id)) = auth.uid())
  with check (public.lesson_tutor(public.entry_lesson(entry_id)) = auth.uid());
create policy epn_delete_tutor  on entry_parent_notes for delete to authenticated
  using (public.lesson_tutor(public.entry_lesson(entry_id)) = auth.uid());

-- homework (wspólna dla grupy, treść akademicka)
create policy hw_select_tutor   on homework for select to authenticated
  using (public.lesson_tutor(public.homework_lesson(id)) = auth.uid());
create policy hw_select_parent  on homework for select to authenticated
  using (public.parent_owns_class(public.lesson_class(public.homework_lesson(id))));
create policy hw_select_student on homework for select to authenticated
  using (public.student_owns_class(public.lesson_class(public.homework_lesson(id))));
create policy hw_insert_tutor   on homework for insert to authenticated
  with check (public.lesson_tutor(public.homework_lesson(id)) = auth.uid());
create policy hw_update_tutor   on homework for update to authenticated
  using (public.lesson_tutor(public.homework_lesson(id)) = auth.uid())
  with check (public.lesson_tutor(public.homework_lesson(id)) = auth.uid());

-- homework_completions — checkbox ucznia (własny) + weryfikacja korepetytora.
create policy hwc_select_student on homework_completions for select to authenticated
  using (student_id = auth.uid());
create policy hwc_select_parent  on homework_completions for select to authenticated
  using (public.is_my_child(student_id));
create policy hwc_select_tutor   on homework_completions for select to authenticated
  using (public.tutor_teaches_student(student_id));
create policy hwc_insert_student on homework_completions for insert to authenticated
  with check (student_id = auth.uid());
create policy hwc_update_student on homework_completions for update to authenticated
  using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy hwc_insert_tutor   on homework_completions for insert to authenticated
  with check (public.tutor_teaches_student(student_id));
create policy hwc_update_tutor   on homework_completions for update to authenticated
  using (public.tutor_teaches_student(student_id))
  with check (public.tutor_teaches_student(student_id));

-- ════════════════════════════════════════════════════════════════════════════
-- 12. payments / payment_lines / payment_reminders_sent — tylko rodzic (SELECT)
-- ════════════════════════════════════════════════════════════════════════════

create policy payments_select_parent on payments for select to authenticated
  using (parent_id = auth.uid());
create policy plines_select_parent   on payment_lines for select to authenticated
  using (public.is_my_child(student_id));
create policy prem_select_parent     on payment_reminders_sent for select to authenticated
  using (public.payment_parent(payment_id) = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- 13. makeup_requests / makeup_proposals — tutor + rodzic (ping-pong)
-- ════════════════════════════════════════════════════════════════════════════

create policy mr_select_tutor   on makeup_requests for select to authenticated
  using (public.lesson_tutor(original_lesson_id) = auth.uid());
create policy mr_select_parent  on makeup_requests for select to authenticated
  using (public.parent_owns_class(public.lesson_class(original_lesson_id)));
create policy mr_select_student on makeup_requests for select to authenticated
  using (public.student_owns_class(public.lesson_class(original_lesson_id)));
create policy mr_insert_tutor   on makeup_requests for insert to authenticated
  with check (public.lesson_tutor(original_lesson_id) = auth.uid());
create policy mr_insert_parent  on makeup_requests for insert to authenticated
  with check (public.parent_owns_class(public.lesson_class(original_lesson_id)));
create policy mr_update_tutor   on makeup_requests for update to authenticated
  using (public.lesson_tutor(original_lesson_id) = auth.uid())
  with check (public.lesson_tutor(original_lesson_id) = auth.uid());
create policy mr_update_parent  on makeup_requests for update to authenticated
  using (public.parent_owns_class(public.lesson_class(original_lesson_id)))
  with check (public.parent_owns_class(public.lesson_class(original_lesson_id)));

create policy mp_select_tutor   on makeup_proposals for select to authenticated
  using (public.lesson_tutor(public.makeup_request_lesson(request_id)) = auth.uid());
create policy mp_select_parent  on makeup_proposals for select to authenticated
  using (public.parent_owns_class(public.lesson_class(public.makeup_request_lesson(request_id))));
create policy mp_select_student on makeup_proposals for select to authenticated
  using (public.student_owns_class(public.lesson_class(public.makeup_request_lesson(request_id))));
create policy mp_insert_tutor   on makeup_proposals for insert to authenticated
  with check (
    proposed_by_id = auth.uid()
    and public.lesson_tutor(public.makeup_request_lesson(request_id)) = auth.uid()
  );
create policy mp_insert_parent  on makeup_proposals for insert to authenticated
  with check (
    proposed_by_id = auth.uid()
    and public.parent_owns_class(public.lesson_class(public.makeup_request_lesson(request_id)))
  );

-- ════════════════════════════════════════════════════════════════════════════
-- 14. lesson_cancel_requests — uczeń tworzy, rodzic rozstrzyga, tutor widzi
-- ════════════════════════════════════════════════════════════════════════════

create policy lcr_select_student on lesson_cancel_requests for select to authenticated
  using (student_id = auth.uid());
create policy lcr_select_parent  on lesson_cancel_requests for select to authenticated
  using (public.is_my_child(student_id));
create policy lcr_select_tutor   on lesson_cancel_requests for select to authenticated
  using (public.lesson_tutor(lesson_id) = auth.uid());
create policy lcr_insert_student on lesson_cancel_requests for insert to authenticated
  with check (student_id = auth.uid());
create policy lcr_update_parent  on lesson_cancel_requests for update to authenticated
  using (public.is_my_child(student_id)) with check (public.is_my_child(student_id));

-- ════════════════════════════════════════════════════════════════════════════
-- 15. direct_messages / admin_announcements — komunikacja
-- ════════════════════════════════════════════════════════════════════════════

create policy dm_select_party on direct_messages for select to authenticated
  using (sender_id = auth.uid() or recipient_id = auth.uid());
create policy dm_insert_sender on direct_messages for insert to authenticated
  with check (sender_id = auth.uid());
create policy dm_update_recipient on direct_messages for update to authenticated
  using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());

create policy ann_select_recipient on admin_announcements for select to authenticated
  using (recipient_id = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- 16. notifications / notification_preferences — własne profilu
-- ════════════════════════════════════════════════════════════════════════════

create policy notif_select_self on notifications for select to authenticated
  using (user_id = auth.uid());
create policy notif_update_self on notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy np_select_self on notification_preferences for select to authenticated
  using (profile_id = auth.uid());
create policy np_insert_self on notification_preferences for insert to authenticated
  with check (profile_id = auth.uid());
create policy np_update_self on notification_preferences for update to authenticated
  using (profile_id = auth.uid()) with check (profile_id = auth.uid());
