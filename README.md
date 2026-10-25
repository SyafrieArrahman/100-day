# 100-day

A 100-day fitness challenge tracker that runs in the browser.

## Project structure

- `index.html` — page shell and asset references.
- `styles.css` — application styles and theme rules.
- `app.js` — challenge data, UI rendering, and browser storage.
- `auth.js` — Supabase email/password and Google authentication.
- `auth-config.js` — public Supabase project URL and browser key.

## Authentication setup

1. Create a Supabase project and copy its project URL and publishable (or legacy anon) key into `auth-config.js`.
2. In Supabase Authentication, enable Email and Google providers. Google also needs OAuth client credentials from Google Cloud.
3. Add the deployed site URL to Supabase's allowed redirect URLs. For local development, serve this folder over HTTP and add that local URL too.
4. Publish the site over HTTPS, then use the email sign-up or Google sign-in buttons.

The browser key in `auth-config.js` is public; never put a Supabase service-role key there. Authentication identifies the user, while challenge progress still stays in that browser's local storage. Cross-device data sync is not included yet.

## Run locally

Open `index.html` in a browser for guest mode. Authentication requires serving the folder over HTTP so Supabase can redirect back to the site.
