-- 0022_class_level_goal.sql
-- EDU LUZ — poziom i cel zajęć (cecha ZAJĘĆ, nie ucznia).
--
-- Poziom ucznia to tylko etap szkoły (podstawowa / średnia). Natomiast konkretne
-- zajęcia mogą być na poziomie podstawowym albo rozszerzonym i mieć cel
-- egzaminacyjny (E8 / matura) lub być bieżącym wsparciem. Oba pola są OPCJONALNE
-- — nie każde zajęcia mają cel egzaminacyjny.

create type class_level_scope as enum ('basic', 'extended');   -- Podstawa / Rozszerzenie
create type class_goal as enum ('e8', 'matura', 'support');    -- Egzamin ósmoklasisty / Matura / Bieżące wsparcie

alter table classes
  add column level_scope class_level_scope,
  add column goal        class_goal;

comment on column classes.level_scope is 'Poziom zajęć: basic=Podstawa, extended=Rozszerzenie (opcjonalny).';
comment on column classes.goal is 'Cel zajęć: e8=Egzamin ósmoklasisty, matura=Matura, support=Bieżące wsparcie (opcjonalny).';
