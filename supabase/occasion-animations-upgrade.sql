create table if not exists public.occasion_animations (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(trim(title)) > 0),
    festival_name text not null default 'custom',
    animation_type text not null default 'floating-lights',
    theme_settings jsonb not null default '{}'::jsonb,
    start_date date not null,
    end_date date not null check (end_date >= start_date),
    target_pages text[] not null default array['all']::text[],
    intensity text not null default 'medium',
    is_enabled boolean not null default true,
    disable_on_mobile boolean not null default false,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

alter table public.occasion_animations
    add column if not exists festival_name text,
    add column if not exists theme_settings jsonb default '{}'::jsonb,
    add column if not exists disable_on_mobile boolean default false;

update public.occasion_animations
set festival_name = 'custom'
where festival_name is null
   or char_length(trim(festival_name)) = 0;

update public.occasion_animations
set theme_settings = '{}'::jsonb
where theme_settings is null;

update public.occasion_animations
set disable_on_mobile = false
where disable_on_mobile is null;

alter table public.occasion_animations
    alter column festival_name set default 'custom',
    alter column festival_name set not null,
    alter column animation_type set default 'floating-lights',
    alter column theme_settings set default '{}'::jsonb,
    alter column theme_settings set not null,
    alter column intensity set default 'medium',
    alter column disable_on_mobile set default false,
    alter column disable_on_mobile set not null;

alter table public.occasion_animations
    drop constraint if exists occasion_animations_animation_type_check,
    drop constraint if exists occasion_animations_end_date_check,
    drop constraint if exists occasion_animations_target_pages_check,
    drop constraint if exists occasion_animations_intensity_check,
    drop constraint if exists occasion_animations_festival_name_check,
    drop constraint if exists occasion_animations_theme_settings_check;

alter table public.occasion_animations
    add constraint occasion_animations_animation_type_check
        check (animation_type in ('flower-petals', 'glowing-diyas', 'sparkles', 'floating-lights', 'confetti', 'snowflakes')),
    add constraint occasion_animations_end_date_check
        check (end_date >= start_date),
    add constraint occasion_animations_target_pages_check
        check (
            cardinality(target_pages) > 0
            and target_pages <@ array['all', 'home', 'about', 'events', 'gallery', 'members', 'contact']::text[]
        ),
    add constraint occasion_animations_intensity_check
        check (intensity in ('light', 'medium', 'heavy')),
    add constraint occasion_animations_festival_name_check
        check (festival_name in (
            'ganesh-chaturthi',
            'sankashti',
            'durga-pooja-navratri',
            'hanuman-jayanti',
            'maharashtra-day',
            'mauritius-independence-day',
            'christmas',
            'custom'
        )),
    add constraint occasion_animations_theme_settings_check
        check (jsonb_typeof(theme_settings) = 'object');

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
