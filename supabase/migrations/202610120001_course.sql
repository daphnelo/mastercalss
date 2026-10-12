create table if not exists public.course_state (
 id integer primary key check (id = 1),
 revision integer not null default 1,
 data text not null
);
alter table public.course_state enable row level security;
revoke all on public.course_state from anon, authenticated;
grant all on public.course_state to service_role;
insert into storage.buckets (id,name,public,file_size_limit)
values ('reports','reports',false,20971520)
on conflict (id) do update set public=false,file_size_limit=20971520;
-- No public client policies: authenticated operations go through course-api,
-- which verifies identity and enforces teacher/student ownership.
