# 100-day

A 100-day fitness challenge tracker that runs in the browser.

## Project structure

- `index.html` — page shell and asset references.
- `styles.css` — application styles and theme rules.
- `app.js` — challenge data, UI rendering, and browser storage.
- `auth.js` — Supabase email/password and Google authentication.
- `auth-config.js` — public Supabase project URL and browser key.
- `supabase/user_progress.sql` — private per-user progress table and Row Level Security policies.

## Authentication setup

1. Create a Supabase project and copy its project URL and publishable (or legacy anon) key into `auth-config.js`.
2. In Supabase Authentication, enable Email and Google providers. Google also needs OAuth client credentials from Google Cloud.
3. Add the deployed site URL to Supabase's allowed redirect URLs. For local development, serve this folder over HTTP and add that local URL too.
4. Publish the site over HTTPS, then use the email sign-up or Google sign-in buttons.

The browser key in `auth-config.js` is public; never put a Supabase service-role key there. Authentication identifies the user; signed-in progress syncs to Supabase after the account-sync SQL is installed. Guest progress stays in that browser's local storage.

## Enable account sync

1. In the Supabase Dashboard, open **SQL Editor → New query**.
2. Paste and run the SQL in `supabase/user_progress.sql`.
3. Commit and push the app changes. After signing in, existing browser progress is uploaded when the account has no cloud copy. Otherwise the cloud copy is used, unless a newer copy is already saved on that device.

The table uses Row Level Security so each signed-in user can access only their own progress. Guests continue to save data only in their current browser.

## Run locally

Open `index.html` in a browser for guest mode. Authentication requires serving the folder over HTTP so Supabase can redirect back to the site.
