# Deployment & accounts

AgentLab runs in two modes:

- **Local mode (default, zero config):** no accounts, progress saved in the
  browser. Nothing below is required.
- **Cloud mode:** email/password accounts, with progress synced across devices
  via Supabase. Enable it by setting two environment variables and running one
  SQL script.

Everything below is done in **your own** accounts — the app never handles your
credentials; it only reads the public env vars you provide.

---

## 1. Create a Supabase project

1. Go to <https://supabase.com> → **New project** (free tier is fine).
2. Once it's ready, open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (Do **not** use the `service_role` key in this app.)

## 2. Create the database table

Open **SQL Editor → New query**, paste the contents of
[`supabase/schema.sql`](../supabase/schema.sql), and **Run**. This creates the
`user_state` table with row-level security so each user can only touch their own
data.

## 3. Configure email auth

In **Authentication → Providers → Email** (enabled by default): for a smoother
first run you may turn *off* "Confirm email" during development; keep it on for
production so new accounts verify their address (the confirmation link returns to
`/auth/callback`, which is already handled).

In **Authentication → URL Configuration**, set:

- **Site URL** to your app URL (e.g. `http://localhost:3000` for dev, your Vercel
  URL for prod).
- Add both `http://localhost:3000/**` and your production `https://.../**` to
  **Redirect URLs**.

## 4. Run locally

```bash
cp .env.example .env.local   # then fill in the two NEXT_PUBLIC_SUPABASE_* values
npm install
npm run dev
```

Visit `/login` and create an account with your email and a password. Any progress
you already had in local mode is migrated to your account on first sign-in.

## 5. Deploy to Vercel (ship it)

1. Push to GitHub (already done: `samarthmukhi/agentlab`).
2. At <https://vercel.com> → **Add New → Project → Import** the repo.
3. In the project's **Settings → Environment Variables**, add
   `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
4. **Deploy.** Then add the Vercel URL to Supabase **Site URL / Redirect URLs**
   (step 3).

That's it — a normal, shippable web app with email accounts and cloud-saved
progress.

---

## Adding social sign-in later (optional)

If you ever want Google/Apple sign-in, Supabase supports them as providers and
the app's `/auth/callback` route already handles the OAuth redirect. Enable a
provider in **Authentication → Providers**, then add a button that calls
`supabase.auth.signInWithOAuth({ provider, options: { redirectTo } })` in
[`app/login/page.tsx`](../app/login/page.tsx). (Apple additionally requires a paid
Apple Developer account.) Not needed for email/password.

---

## Security notes

- The **anon key is meant to be public**; data security comes from row-level
  security (`supabase/schema.sql`), not from hiding the key.
- The `service_role` key must never appear in this client app or the repo.
- `.env.local` is gitignored; only `.env.example` (no secrets) is committed.
