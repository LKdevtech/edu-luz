-- 0007_groups.sql
-- EDU LUZ — grupy (sekcja 3.9)

create table groups (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                       -- "Grupa A"
  subject_id    uuid not null references subjects(id) on delete restrict,
  level         student_level not null,
  tutor_id      uuid not null references tutors(profile_id) on delete restrict,
  max_size      smallint not null check (max_size between 2 and 10),
  -- monthly fee per uczeń w grupie (np. 180 zł/msc dla Oli w Grupie A).
  monthly_fee_per_student numeric(8,2) not null check (monthly_fee_per_student >= 0),
  -- Status grupy. 'dissolved' = rozwiązana (sekcja 3.9 — nieodwracalne).
  status        text not null default 'active'
                check (status in ('active', 'dissolved')),
  dissolved_at  timestamptz,
  dissolved_reason text,
  created_at    timestamptz not null default now(),
  created_by    uuid references profiles(id)
);

create index groups_status_idx on groups (status) where status = 'active';
create index groups_tutor_idx on groups (tutor_id);

create table group_members (
  group_id    uuid not null references groups(id) on delete cascade,
  student_id  uuid not null references students(profile_id) on delete restrict,
  joined_at   timestamptz not null default now(),
  left_at     timestamptz,
  primary key (group_id, student_id)
);

create index group_members_student_idx on group_members (student_id) where left_at is null;
