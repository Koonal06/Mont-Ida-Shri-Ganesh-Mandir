# Supabase Setup

This website now includes a simple Supabase-powered admin area so you can manage:

- events
- event images
- gallery photos
- occasion animations
- published or draft status
- scheduled publishing

The admin page is:

- `admin/login.html`

## Occasion animation upgrade

The admin portal now supports festival-specific website animations, custom motion blends, and mobile visibility controls.

If your Supabase project was created before this feature was added, also run:

- [supabase/occasion-animations-upgrade.sql](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/supabase/occasion-animations-upgrade.sql)

## Album upgrade

The gallery now supports one post with multiple photos.

If you already ran the older schema before this album feature was added, also run:

- [supabase/gallery-albums-upgrade.sql](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/supabase/gallery-albums-upgrade.sql)

If you are setting up from scratch, running the full [supabase/schema.sql](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/supabase/schema.sql) is enough.

## Scheduled publishing upgrade

The admin portal now supports:

- publish now
- schedule for later
- save as draft

If your Supabase project was created before scheduled publishing was added, also run:

- [supabase/scheduled-publishing-upgrade.sql](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/supabase/scheduled-publishing-upgrade.sql)

## 1. Create your Supabase project

Create a new project in Supabase, then keep these two values ready:

- Project URL
- Project API anon key

You will paste them into:

- `js/supabase-config.js`

## 2. Add your project keys

Open [js/supabase-config.js](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/js/supabase-config.js) and replace the empty values:

```js
window.siteSupabaseConfig = {
    url: "https://YOUR-PROJECT.supabase.co",
    anonKey: "YOUR_PUBLIC_ANON_KEY",
    bucket: "site-media"
};
```

Only use the public anon key here.
Do not paste your service role key into browser code.

## 3. Run the SQL schema

Open the Supabase SQL Editor and run:

- [supabase/schema.sql](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/supabase/schema.sql)

Before running it, replace this placeholder email inside the file:

```sql
replace-with-your-admin-email@example.com
```

Use the same email address you will use to sign in as admin.

That SQL file will create:

- `admin_users`
- `events`
- `gallery_items`
- the public `site-media` storage bucket
- row-level security policies

## 4. Create your admin login

In the Supabase dashboard:

1. Go to `Authentication`
2. Create a user with your admin email and password
3. Make sure it matches the email you placed in `admin_users`

Once that is done, you can sign in on:

- `admin/index.html`

## 5. Start managing content

From the admin page you can:

- add an event title, description, location, start time, end time, and image
- upload gallery photos with a title, description, and category
- publish immediately, schedule for later, or save as draft
- choose predefined festival animation themes or build a custom one
- delete existing events and gallery items

## 6. Gallery categories

To match the current gallery filter buttons, use category slugs like:

- `festival-decorations`
- `cultural-dance`
- `prayer-ceremony`
- `community-gathering`
- `diwali-lights`
- `youth-programs`

You can add new category values too, but the public filter buttons are currently designed around the list above.

## 7. How the website behaves

The public pages are now ready to read from Supabase:

- [index.html](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/index.html)
- [events/index.html](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/events/index.html)
- [gallery/index.html](/abs/path/c:/Users/koona/Desktop/Update%20Website/mont%20ida%20ganesh%20mandir/gallery/index.html)

Until you add your Supabase URL and anon key, the existing static content remains visible.
After you add the keys and data, the dynamic content will replace those fallback cards automatically.
