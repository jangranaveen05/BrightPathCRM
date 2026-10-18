# BrightPath CRM — Supabase Database Setup & Migration Guide

This directory contains the PostgreSQL database migrations and seed data for **BrightPath CRM**.

---

## 📁 File Structure

- **`migrations/001_initial_schema.sql`**: Core DDL creating tables (`profiles`, `leads`, `follow_ups`, `activities`), indexes, triggers, role recursion prevention helpers, and Row Level Security (RLS) policies.
- **`migrations/002_seed_data.sql`**: Fictional realistic BrightPath Academy enquiry records (12 leads, 6 follow-ups, 6 activity logs) for testing pipelines, overdue logic, and reporting.

---

## 🚀 How to Apply Migrations in Supabase (1-Minute Guide)

When you are ready to set up your Supabase project:

### Step 1: Create Your Supabase Project
1. Log in to [supabase.com](https://supabase.com).
2. Click **New Project**, choose your organization, name it `brightpath-crm`, and set your database password.
3. Wait ~1 minute for the project to finish initializing.

### Step 2: Run `001_initial_schema.sql`
1. In your Supabase project dashboard, click on the **SQL Editor** tab (terminal icon `>_` on the left sidebar).
2. Click **New query**.
3. Open [`migrations/001_initial_schema.sql`](./migrations/001_initial_schema.sql), copy the entire SQL script, and paste it into the editor.
4. Click **Run** (or press `Ctrl + Enter` / `Cmd + Enter`).
5. Confirm output shows `Success. No rows returned`.

### Step 3: Run `002_seed_data.sql` (Optional Demo Data)
1. Open a new query in the **SQL Editor**.
2. Copy the contents of [`migrations/002_seed_data.sql`](./migrations/002_seed_data.sql) and paste it.
3. Click **Run**.
4. Confirm 12 demo coaching leads, follow-ups, and activity logs are populated.

### Step 4: Turn OFF "Confirm email" for Local Testing (Recommended)
By default, Supabase requires users to click a confirmation link sent to their email before signing in. For local development:
1. In your Supabase Dashboard, navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. Toggle **OFF** the switch for **"Confirm email"**.
3. Click **Save**.
*(If any users are already registered and unconfirmed, run `UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;` in the SQL Editor).*

### Step 5: Configure Local `.env`
1. Navigate to **Project Settings** (gear icon in Supabase) $\rightarrow$ **API**.
2. Copy the **Project URL** and the **anon / public** key (or publishable key `sb_publishable_...`).
3. Ensure your `.env` file in the project root has:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_......
   ```
4. Start your local dev server:
   ```bash
   npm run dev
   ```
   The configuration status indicator in the top header will switch to **Connected**.

---

## 🛡️ Admin Account Bootstrap Procedure

When you register your account in the CRM:
1. By default, self-registered users are assigned the role `counsellor`.
2. First, register your account at `http://localhost:5173/login` under the **Register Staff** tab.
3. To elevate your account to `admin` and auto-confirm your email, navigate to the Supabase **SQL Editor** and run:
   ```sql
   SELECT public.promote_user_to_admin('your-registered-email@domain.com');
   ```
4. In the application header, click your user pill $\rightarrow$ **Refresh Role / Permissions** (or refresh the page). Your role badge will now display as **Admin** with full permissions across all leads and reports.
