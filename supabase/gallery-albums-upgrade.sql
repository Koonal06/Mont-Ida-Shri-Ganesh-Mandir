create table if not exists public.gallery_item_photos (
    id uuid primary key default gen_random_uuid(),
    gallery_item_id uuid not null references public.gallery_items(id) on delete cascade,
    image_path text not null check (char_length(trim(image_path)) > 0),
    sort_order integer not null default 0,
    created_at timestamptz not null default timezone('utc', now())
);

create index if not exists gallery_item_photos_item_sort_idx
on public.gallery_item_photos (gallery_item_id, sort_order, created_at);

alter table public.gallery_item_photos enable row level security;

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
    )
);

drop policy if exists "Admins can manage gallery item photos" on public.gallery_item_photos;
create policy "Admins can manage gallery item photos"
on public.gallery_item_photos
for all
to authenticated
using (public.is_site_admin())
with check (public.is_site_admin());
