create table if not exists public.occasion_animations (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(trim(title)) > 0),
    animation_type text not null check (animation_type in ('flower-petals', 'glowing-diyas', 'sparkles', 'floating-lights', 'confetti', 'snowflakes')),
    start_date date not null,
    end_date date not null check (end_date >= start_date),
    target_pages text[] not null default array['all']::text[]
        check (
            cardinality(target_pages) > 0
            and target_pages <@ array['all', 'home', 'about', 'events', 'gallery', 'members', 'contact']::text[]
        ),
    intensity text not null default 'medium' check (intensity in ('light', 'medium', 'heavy')),
    is_enabled boolean not null default true,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists occasion_animations_active_window_idx
on public.occasion_animations (is_enabled, start_date, end_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists set_occasion_animations_updated_at on public.occasion_animations;
create trigger set_occasion_animations_updated_at
before update on public.occasion_animations
for each row
execute function public.set_updated_at();

alter table public.occasion_animations enable row level security;

drop policy if exists "Public can view active occasion animations" on public.occasion_animations;
create policy "Public can view active occasion animations"
on public.occasion_animations
for select
using (
    is_enabled = true
    and start_date <= timezone('Indian/Mauritius', now())::date
    and end_date >= timezone('Indian/Mauritius', now())::date
);

drop policy if exists "Admins can manage occasion animations" on public.occasion_animations;
create policy "Admins can manage occasion animations"
on public.occasion_animations
for all
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());
