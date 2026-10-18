# BrightPath CRM — Master Execution Plan & Context Tracker

> **Master Specification Reference**: `BrightPath_CRM_Full_Master_Build_Prompt.docx` / `BrightPath_CRM_Antigravity_Full_Build_Prompt.docx`  
> **Tech Stack**: React 19 + TypeScript + Vite • Supabase (PostgreSQL & Auth) • Git & GitHub • Vercel  
> **Target Audience**: BrightPath Academy (Coaching Institute Enquiry-to-Admission CRM)

---

## 1. Development & Delivery Lifecycle (Per Feature)

Every phase and individual feature follows this mandatory delivery loop:

$$\boxed{\text{Develop}} \longrightarrow \boxed{\text{Test Locally}} \longrightarrow \boxed{\text{Verify (E2E/RLS)}} \longrightarrow \boxed{\text{Deploy (Vercel)}} \longrightarrow \boxed{\text{Again Test (Live URL)}} \longrightarrow \boxed{\text{Next Phase Gate}}$$

1. **Develop**: Implement isolated components, services, and types.
2. **Test Locally**: Static checks (`npm run lint`, TypeScript compiler `tsc --noEmit`), and local dev testing.
3. **Verify**: Edge cases, business logic validation, and database security rules.
4. **Deploy**: Git commit, push to GitHub, and trigger a build on Vercel.
5. **Again Test (Live)**: Verify functionality on the live production Vercel URL to guarantee parity between local and hosted environments.
6. **Move to Next**: Document exact observed results (PASS / FAIL) and await user sign-off before proceeding.

---

## 2. Order-Wise Phase Roadmap & Status Checklist

| Phase | Title | Focus Area | Status |
| :---: | :--- | :--- | :---: |
| **Phase 0** | Project Hygiene & Git Baseline | Git init, `.gitignore` credential shield, `.env.example` | 🟢 Completed |
| **Phase 1** | TypeScript & UI Layout Shell | TypeScript setup, Router, Desktop Sidebar & Mobile Nav, Theme | 🟢 Completed |
| **Phase 2** | Supabase Client & Config Shield | Client singleton, environment validator, friendly diagnostics | 🟢 Completed |
| **Phase 3** | Database Schema, Migrations & RLS | PostgreSQL tables, constraints, indexes, RLS policies, seed data | 🟢 Completed (Schema & Seeds Authored) |
| **Phase 4** | Authentication & RBAC Lifecycle | Auth context, login/register, session persistence, role guards | 🟢 Completed |
| **Phase 5** | Lead Management Core Engine | Full CRUD, search, multi-filters, status pipeline, lost reason | 🟢 Completed |
| **Phase 6** | Follow-ups Engine & Audit Timeline | Scheduling, dynamic overdue logic, completion, activity logs | 🟢 Completed |
| **Phase 7** | Dashboard Analytics & Reports | Reconciled KPIs, funnel breakdown, source metrics, reports | 🟡 Ready to Begin |
| **Phase 8** | Accessibility & Responsive Polish | a11y audit, keyboard nav, mobile polish, error boundary, toasts | ⚪ Pending |
| **Phase 9** | Production Build & Handover Docs | Production bundling, Oxlint pass, exhaustive README guide | ⚪ Pending |
| **Phase 10** | Live Verification & Final Sign-Off | Full live URL testing checklist, regression sign-off | ⚪ Pending |

---

## 3. Granular Phase Breakdown

### Phase 0: Project Hygiene & Git Baseline
- [x] Initialize Git repository (`git init`, set branch `main`).
- [x] Protect credentials in `.gitignore` by explicitly ignoring `.env`, `.env.local`, `.env.*.local`.
- [x] Create `.env.example` template with placeholder variable names.
- [x] Audit untracked files to ensure zero secrets or build artifacts are committed.
- [x] **Test & Verification**: Run `git status` to verify `.env` is ignored.
- [x] **Deployment & Live Check**: Initial commit (`git commit -m "first commit: project baseline, plan.md, and gitignore safety"`).
- [x] **Exit Gate**: Repository cleanly initialized with zero credential exposure risks.

### Phase 1: TypeScript Migration, Routing & UI Layout Shell
- [x] Install dependencies: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `react-router-dom`, `lucide-react`.
- [x] Create `tsconfig.json` and `tsconfig.node.json`.
- [x] Convert `src/main.jsx` to `src/main.tsx`, and `src/App.jsx` to `src/App.tsx`.
- [x] Establish Navy SaaS Design System:
  - Custom navy & neutral color palette (`#0f172a`, `#1e293b`, `#3b82f6`, `#f8fafc`).
  - Professional typography, button variants, input fields, and status badges.
- [x] Build Core Layout Shell:
  - `src/components/layout/Sidebar.tsx`: Desktop sidebar with icon navigation.
  - `src/components/layout/MobileNav.tsx`: Responsive drawer with hamburger menu.
  - `src/components/layout/Header.tsx`: Breadcrumb title and user profile menu pill.
  - `src/components/layout/PageShell.tsx`: Container for content padding, action buttons, and loading states.
- [x] Set up Client-Side Routing:
  - `/` (Dashboard)
  - `/leads` (Leads List & Management)
  - `/leads/:id` (Lead Detail View)
  - `/followups` (Follow-up Tasks)
  - `/reports` (Conversion & Pipeline Analytics)
  - `/login` (Authentication)
  - `*` (404 Not Found Page)
- [x] **Test & Verification**: `npm run build` passes with zero TypeScript errors; `npm run lint` passes. Test responsiveness at 375px and 1440px.
- [x] **Deployment & Live Check**: Push to GitHub, import to Vercel, verify responsive navigation on live preview URL.
- [x] **Exit Gate**: Clean responsive shell deployed and navigating smoothly on live URL.

### Phase 2: Supabase Client, Diagnostics & Configuration Shield
- [x] Install `@supabase/supabase-js`.
- [x] Create `src/lib/supabaseClient.ts` as a typed singleton.
- [x] Implement environment variable validation:
  - Check presence of `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - Validate URL format and key structure.
- [x] Create `src/components/common/EnvWarningBanner.tsx` / `src/components/common/ConfigShield.tsx` & `ConnectionStatusPill.tsx`:
  - Displays user-friendly diagnostics if keys are missing or invalid.
  - Provides clear instructions without crashing the app or pretending mock data is real.
- [x] **Test & Verification**: Verify app shows setup guidance when `.env` is missing; verify client connects when valid format is provided.
- [x] **Deployment & Live Check**: Push to GitHub, build on Vercel, verify live preview handles missing env gracefully.
- [x] **Exit Gate**: Singleton Supabase client ready; zero silent mock fallbacks.

### Phase 3: PostgreSQL Database Schema, Migrations & RLS Security
- [x] Author `supabase/migrations/001_initial_schema.sql`:
  - `public.profiles`: `id` (FK `auth.users`), `full_name`, `role` (`admin`, `manager`, `counsellor`), timestamps.
  - `public.leads`: `id`, `full_name`, `email`, `phone`, `course_interest`, `source`, `status`, `lost_reason`, `assigned_to`, `created_by`, `notes`, timestamps.
  - `public.follow_ups`: `id`, `lead_id`, `assigned_to`, `due_at`, `note`, `status` (`pending`, `completed`, `cancelled`), `completed_at`, `created_by`, timestamps.
  - `public.activities`: `id`, `lead_id`, `actor_id`, `activity_type`, `description`, `metadata`, `created_at`.
  - Trigger function on `auth.users` (`handle_new_user`) to automatically insert a `public.profiles` row with default role `counsellor`.
  - Role recursion prevention helper `get_current_user_role()` and role escalation check trigger.
  - Performance indexes on `leads(status, assigned_to)`, `follow_ups(due_at, status)`, and foreign keys.
  - Row Level Security (RLS) policies:
    - `profiles`: Authenticated read; users update self; admins update any; role escalation locked.
    - `leads`: Counsellors read/update assigned/created; managers/admins full access; delete restricted to manager/admin.
    - `follow_ups` & `activities`: Access mirrors lead accessibility.
  - Realistic fictional demo seed data (`supabase/migrations/002_seed_data.sql` with 12 coaching enquiry records).
  - Admin bootstrap SQL procedure (`promote_user_to_admin`).
- [x] Author `src/types/database.ts` with strict TypeScript types, DTOs, and constants.
- [x] Type Supabase client singleton with `Database` generic in `src/lib/supabaseClient.ts`.
- [x] Author `supabase/README.md` execution guide for 1-minute setup in Supabase SQL Editor.
- [x] **Test & Verification**: `npm run build` and `npx tsc --noEmit` pass with zero errors.
- [x] **Exit Gate**: All SQL migrations, seed fixtures, and TypeScript domain types authored and verified. Ready to apply on Supabase dashboard once project is created.

### Phase 4: Authentication, Profile Lifecycle & RBAC
- [x] Create `src/services/authService.ts`: sign in, sign up, sign out, get session, onAuthStateChange.
- [x] Create `src/features/auth/AuthContext.tsx`: exposes `user`, `profile`, `role`, `loading`, `signIn`, `signUp`, `signOut`, `refreshProfile`.
- [x] Build Authentication UI:
  - `src/pages/LoginPage.tsx`: Tabbed Sign In and Staff Registration, loading spinners, actionable error alerts, and admin elevation instructions.
  - `src/features/auth/ProtectedRoute.tsx`: Route gate redirecting unauthenticated users to `/login`.
  - `src/features/auth/RoleGuard.tsx`: Component-level visibility control based on user role.
- [x] Build User Profile & Logout UI in Header: User initials avatar, display name, dynamic role badges (`admin`, `manager`, `counsellor`), profile refresh, and Sign Out action.
- [x] Wrap application routes with `<AuthProvider>` and protect workspace routes with `<ProtectedRoute>`.
- [x] **Test & Verification**: `npx tsc --noEmit` and `npm run build` pass with zero errors.
- [x] **Exit Gate**: Authentication fully operational and role-scoping integrated into UI shell.

### Phase 5: Lead Management Core Engine (P0 Workflows)
- [x] Create `src/services/leadsService.ts`: list leads, create lead, update lead, delete lead, staff profiles, audit activity auto-logging.
- [x] Build Lead Management UI:
  - `src/pages/LeadsPage.tsx`: Primary pipeline management workspace with multi-filter bar, "Add Lead" trigger, and responsive table.
  - `src/features/leads/LeadTable.tsx`: Tabular view with student avatar, phone link, course interest, source badge, status badge with inline transition select, assignee, and action buttons.
  - `src/features/leads/LeadModal.tsx`: Accessible dialog for creating and editing leads with form validation and course presets.
  - `src/features/leads/LeadFilters.tsx`: Search across student name, phone, email, and course; filter by Status, Source, and Assignee; "Reset Filters" action and count pill.
  - `src/features/leads/LostReasonModal.tsx`: Mandatory popup requiring explanation before setting status to `Lost` with common preset chips.
  - `src/pages/LeadDetailPage.tsx`: Deep-dive view of individual lead with profile information, quick status stepper, and highlighted lost reason.
- [x] Prevent duplicate submissions by disabling buttons while saving with inline loading spinners.
- [x] **Test & Verification**: `npx tsc --noEmit` and `npm run build` pass with zero errors; Oxlint passes with 0 warnings.
- [x] **Exit Gate**: Full lead lifecycle verified with database persistence and RLS isolation.

### Phase 6: Follow-ups Engine, Overdue Logic & Activity Timeline
- [x] Create `src/services/followUpsService.ts` and `src/services/activitiesService.ts`.
- [x] Build Follow-up UI:
  - `src/pages/FollowUpsPage.tsx`: Tabs for "Overdue", "Today", "Upcoming", and "Completed".
  - `src/features/followups/FollowUpModal.tsx`: Schedule follow-up with due date/time, assignee, and notes.
  - `src/features/followups/FollowUpCard.tsx`: Task card with lead name jump-link, due date indicator, and completion action.
  - Dynamic Overdue Calculation: $\text{status} = \text{'pending'} \land \text{due\_at} < \text{NOW()}$.
  - Mark Completed flow: updates status, records `completed_at`, and immediately clears overdue state.
- [x] Build Activity Timeline:
  - `src/features/activities/ActivityTimeline.tsx`: Chronological feed on Lead Detail page.
  - Automatic logging for lead creation, status changes, follow-up scheduled, and follow-up completed.
- [x] **Test & Verification**: Schedule follow-up past due $\rightarrow$ verify overdue alert appears; complete follow-up $\rightarrow$ verify overdue clears and activity log item is created.
- [x] **Deployment & Live Check**: Verified against live database; git pushed to origin main.
- [x] **Exit Gate**: Overdue logic and activity audit trail working seamlessly on live site.

### Phase 7: Dashboard Analytics & Truthful Metric Reports
- [x] Create `src/services/reportsService.ts`: Aggregates metrics strictly from accessible database rows.
- [x] Build Dashboard UI (`src/pages/DashboardPage.tsx`):
  - Metric Card 1: **Total Leads** (all accessible records).
  - Metric Card 2: **New Enquiries** (`status = 'New'`).
  - Metric Card 3: **Converted Admissions** (`status = 'Converted'`).
  - Metric Card 4: **Conversion Rate %** ($\frac{\text{Converted}}{\text{Total}} \times 100$, zero-division safe).
  - Metric Card 5: **Overdue Follow-ups** (pending follow-ups past due).
  - `src/features/dashboard/PipelineFunnel.tsx`: Visual status distribution horizontal bars.
  - `src/features/dashboard/SourceDistribution.tsx`: Visual acquisition channel breakdown.
  - `src/features/dashboard/UrgentFollowupsWidget.tsx`: Quick-action widget for next urgent follow-ups with 1-click completion.
- [x] Build Reports View (`src/pages/ReportsPage.tsx`):
  - Date range filters (`7d`, `30d`, `90d`, `year`, `all`), source filter, conversion summaries, counsellor performance table, and CSV export.
- [x] Reconcile metrics: Ensure every number on dashboard exactly reconciles with Lead and Follow-up lists.
- [x] **Test & Verification**: Cross-checked KPI counts against database rows via `test_phase_7.cjs`; tested zero-division safety; 0 lint errors, 0 tsc errors, production build verified.
- [x] **Exit Gate**: Accurate, truthful metrics deployed live with zero mocked values. Ready for Phase 8.

### Phase 8: Accessibility, Responsive Polish & Micro-interactions
- [ ] Responsive Layout Polish:
  - Test and refine mobile drawer navigation on viewports $\le 375\text{px}$.
  - Responsive table-to-card transformation on mobile.
  - Ensure all touch targets $\ge 44\text{px} \times 44\text{px}$.
- [ ] Accessibility (a11y) Pass:
  - Proper heading hierarchy (`h1` $\rightarrow$ `h2` $\rightarrow$ `h3`).
  - Form field labels with explicit `htmlFor` bindings.
  - Keyboard focus rings (`focus-visible:ring-2`) and keyboard traversal.
  - Color contrast ratio compliance ($\ge 4.5:1$).
- [ ] Error Boundary & Feedback:
  - `src/components/common/ErrorBoundary.tsx`: Catches uncaught UI exceptions with a safe reset button.
  - Toast notification system for async operations (saving, deleting, network errors).
- [ ] **Test & Verification**: Tab-only keyboard navigation test; screen reader labels test; mobile viewport emulator test.
- [ ] **Deployment & Live Check**: Deploy to Vercel; test on physical mobile device or responsive mode.
- [ ] **Exit Gate**: Fully responsive, accessible, and crash-resilient UI verified live.

### Phase 9: Production Build Hardening & Handover Documentation
- [ ] Run strict production build verification: `npm run build`.
- [ ] Run linter verification: `npm run lint` / Oxlint check.
- [ ] Author comprehensive `README.md`:
  - Project summary & architecture diagram.
  - Tech stack & dependencies explanation.
  - Local setup & prerequisites.
  - Environment variables documentation.
  - Database schema & migration execution guide.
  - Admin bootstrap instructions.
  - Verification checklist (PASS / FAIL table).
  - Production limitations and future roadmap.
- [ ] **Test & Verification**: Fresh clone / clean directory test; documentation link validation.
- [ ] **Deployment & Live Check**: Deploy to Vercel; ensure zero build warnings.
- [ ] **Exit Gate**: Production bundle optimized; documentation complete and fully aligned with code.

### Phase 10: Final End-to-End Live Verification & Sign-Off
- [ ] Comprehensive Live Acceptance Test on Vercel:
  1. Login with Counsellor account $\rightarrow$ verify lead isolation.
  2. Login with Manager/Admin account $\rightarrow$ verify full pipeline visibility.
  3. Create lead $\rightarrow$ verify persistence across page refresh.
  4. Move status to `Lost` $\rightarrow$ verify lost reason is enforced.
  5. Schedule overdue follow-up $\rightarrow$ verify overdue pill appears.
  6. Mark follow-up completed $\rightarrow$ verify activity logged on timeline.
  7. Check Dashboard KPIs $\rightarrow$ verify numbers reconcile 100% with list view.
  8. Test responsive mobile drawer and form modals on mobile device.
- [ ] Record final PASS/FAIL status for all test cases.
- [ ] Final sign-off and student handover.

---

## 4. Database Schema Reference

```sql
-- Core Relational Tables
public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role text not null default 'counsellor' check (role in ('admin', 'manager', 'counsellor')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

public.leads (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text not null,
  course_interest text not null,
  source text not null check (source in ('Website', 'Walk-in', 'Referral', 'Call', 'Social Media', 'Other')),
  status text not null default 'New' check (status in ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')),
  lost_reason text,
  assigned_to uuid references public.profiles(id) on delete set null,
  created_by uuid references public.profiles(id) on delete set null,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  assigned_to uuid references public.profiles(id) on delete set null,
  due_at timestamptz not null,
  note text not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'cancelled')),
  completed_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz default now()
);

public.activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  activity_type text not null,
  description text not null,
  metadata jsonb,
  created_at timestamptz default now()
);
```
