create extension if not exists pgcrypto;

create table if not exists public.admin_users (
    email text primary key check (position('@' in email) > 1),
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(trim(title)) > 0),
    description text not null check (char_length(trim(description)) > 0),
    location text not null check (char_length(trim(location)) > 0),
    start_at timestamptz not null,
    end_at timestamptz,
    image_path text not null check (char_length(trim(image_path)) > 0),
    published boolean not null default true,
    publish_at timestamptz,
    created_at timestamptz not null default timezone('utc', now()),
    updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_items (
    id uuid primary key default gen_random_uuid(),
    title text not null check (char_length(trim(title)) > 0),
    description text not null default '',
    category text not null check (char_length(trim(category)) > 0),
    image_path text not null check (char_length(trim(image_path)) > 0),
    published boolean not null default true,
    publish_at timestamptz,
    created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.gallery_item_photos (
    id uuid primary key default gen_random_uuid(),
    gallery_item_id uuid not null references public.gallery_items(id) on delete cascade,
    image_path text not null check (char_length(trim(image_path)) > 0),
    sort_order integer not null default 0,
    created_at timestamptz not null default timezone('utc', now())
);

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

create index if not exists events_start_at_idx on public.events (start_at);
create index if not exists events_published_start_at_idx on public.events (published, start_at);
create index if not exists events_published_publish_at_start_at_idx on public.events (published, publish_at, start_at);
create index if not exists gallery_items_created_at_idx on public.gallery_items (created_at desc);
create index if not exists gallery_items_published_created_at_idx on public.gallery_items (published, created_at desc);
create index if not exists gallery_items_published_publish_at_created_at_idx on public.gallery_items (published, publish_at, created_at desc);
create index if not exists gallery_item_photos_item_sort_idx on public.gallery_item_photos (gallery_item_id, sort_order, created_at);
create index if not exists occasion_animations_active_window_idx on public.occasion_animations (is_enabled, start_date, end_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = timezone('utc', now());
    return new;
end;
$$;

drop trigger if exists set_events_updated_at on public.events;
create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();

drop trigger if exists set_occasion_animations_updated_at on public.occasion_animations;
create trigger set_occasion_animations_updated_at
before update on public.occasion_animations
for each row
execute function public.set_updated_at();

create or replace function public.is_site_admin()
returns boolean
language sql
stable
as $$
    select exists (
        select 1
        from public.admin_users
        where email = coalesce(auth.jwt() ->> 'email', '')
    );
$$;

insert into storage.buckets (id, name, public)
values ('site-media', 'site-media', true)
on conflict (id) do update
set public = excluded.public;

alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.gallery_items enable row level security;
alter table public.gallery_item_photos enable row level security;
alter table public.occasion_animations enable row level security;

drop policy if exists "Admins can read their own admin row" on public.admin_users;
create policy "Admins can read their own admin row"
on public.admin_users
for select
to authenticated
using (email = coalesce(auth.jwt() ->> 'email', ''));

drop policy if exists "Public can view published events" on public.events;
create policy "Public can view published events"
on public.events
for select
using (published = true and (publish_at is null or publish_at <= timezone('utc', now())));

drop policy if exists "Admins can manage events" on public.events;
create policy "Admins can manage events"
on public.events
for all
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

drop policy if exists "Public can view published gallery items" on public.gallery_items;
create policy "Public can view published gallery items"
on public.gallery_items
for select
using (published = true and (publish_at is null or publish_at <= timezone('utc', now())));

drop policy if exists "Admins can manage gallery items" on public.gallery_items;
create policy "Admins can manage gallery items"
on public.gallery_items
for all
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

drop policy if exists "Public can view gallery item photos" on public.gallery_item_photos;
create policy "Public can view gallery item photos"
on public.gallery_item_photos
for select
using (
    exists (
        select 1
        from public.gallery_items
        where public.gallery_items.id = public.gallery_item_photos.gallery_item_id
          and public.gallery_items.published = true
          and (public.gallery_items.publish_at is null or public.gallery_items.publish_at <= timezone('utc', now()))
    )
);

drop policy if exists "Admins can manage gallery item photos" on public.gallery_item_photos;
create policy "Admins can manage gallery item photos"
on public.gallery_item_photos
for all
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());

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

drop policy if exists "Public can view site media" on storage.objects;
create policy "Public can view site media"
on storage.objects
for select
using (bucket_id = 'site-media');

drop policy if exists "Admins can upload site media" on storage.objects;
create policy "Admins can upload site media"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'site-media' and public.is_site_admin());

drop policy if exists "Admins can update site media" on storage.objects;
create policy "Admins can update site media"
on storage.objects
for update
to authenticated
using (bucket_id = 'site-media' and public.is_site_admin())
with check (bucket_id = 'site-media' and public.is_site_admin());

drop policy if exists "Admins can delete site media" on storage.objects;
create policy "Admins can delete site media"
on storage.objects
for delete
to authenticated
using (bucket_id = 'site-media' and public.is_site_admin());

insert into public.admin_users (email)
values ('replace-with-your-admin-email@example.com')
on conflict (email) do nothing;
