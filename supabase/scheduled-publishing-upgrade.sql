alter table public.events
add column if not exists publish_at timestamptz;

alter table public.gallery_items
add column if not exists publish_at timestamptz;

create index if not exists events_published_publish_at_start_at_idx
on public.events (published, publish_at, start_at);

create index if not exists gallery_items_published_publish_at_created_at_idx
on public.gallery_items (published, publish_at, created_at desc);

drop policy if exists "Public can view published events" on public.events;
create policy "Public can view published events"
on public.events
for select
using (published = true and (publish_at is null or publish_at <= timezone('utc', now())));

drop policy if exists "Public can view published gallery items" on public.gallery_items;
create policy "Public can view published gallery items"
on public.gallery_items
for select
using (published = true and (publish_at is null or publish_at <= timezone('utc', now())));

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
