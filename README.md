# Renovation Business Discovery — First Client Release

This application turns a business-operations questionnaire into a practical discovery assessment, operational findings, system blueprint and software build specification.

## Stack
- Next.js + React
- Vercel
- Supabase Postgres + Auth

## Public flow
1. User opens `/` and completes the 15-section questionnaire.
2. Progress is saved locally while the user works.
3. `Other` selections support a custom response stored as `<question_id>_other`.
4. Submission creates one row in `public.assessments`.
5. Local progress is cleared after successful submission.

## Admin flow
1. Open `/admin`.
2. Sign in with the Supabase Auth admin account.
3. Review businesses, findings, workflows, automation opportunities and the System Blueprint.
4. Mark an assessment reviewed.
5. Open the blueprint to copy or download a software build specification.
6. Use Reports → Print / Save PDF for a client-ready assessment report.

## Environment
Create `.env.local` from `.env.example`. Never commit `.env.local`, service-role keys, passwords or other secrets.

## Supabase
Run `supabase/schema.sql` in the Supabase SQL editor. The script is safe to re-run and includes the public INSERT policy plus authenticated SELECT/UPDATE/DELETE policies needed by the admin.

### Security note
The first-client release assumes a single trusted admin account. Authenticated users currently have access to assessment rows because there is no admin-role table yet. Before adding additional authenticated users, replace those policies with an explicit admin allowlist/role.

## Local development
```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Production
Set the same two public Supabase environment variables in Vercel, deploy, and test both `/` and `/admin` in production.
