# First Client Launch — Do This Once

## 1. Local safety
- Keep `.env.local` on your computer only.
- Do not upload or commit `.env.local`.
- Do not use a Supabase service-role key in the browser.

## 2. Supabase
Run `supabase/schema.sql` in the Supabase SQL editor. It creates/migrates the `assessments` table and the policies needed by the public questionnaire and authenticated admin.

For the first release, keep only your own admin account in Supabase Auth.

## 3. Password reset URL
In Supabase Auth → URL Configuration, add both:
- `http://localhost:3000/admin/reset-password`
- `https://YOUR-VERCEL-DOMAIN/admin/reset-password`

Replace the second value with the real production domain.

## 4. Local test
```bash
npm install
npm run dev
```

Open `/` and complete the questionnaire.

Test:
- every `Other` option
- typing custom text
- Back/Continue
- browser refresh partway through
- final submission

Then open `/admin` and verify:
- the business appears
- custom Other text is visible
- readiness and opportunity data appear
- Mark reviewed works
- System Blueprint opens for the selected business
- Copy build spec works
- Download spec works
- Reports → Print / Save PDF works

## 5. Production deployment
Push the project to GitHub and deploy through Vercel.

Add these Vercel environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Do not add the Supabase service-role key to this application.

## 6. Production test
Before sending the link to the first real user, submit one complete assessment from the production URL using test information.

Verify it appears in the production Admin dashboard.

## 7. Send the questionnaire
Once the production test passes, send the public URL to the business owner.

Do not send them `/admin`.

## 8. After the first assessment
Use this sequence:
1. Review Business Detail.
2. Review top opportunities.
3. Mark assessment reviewed.
4. Open System Blueprint.
5. Review each workflow stage.
6. Copy/download the build specification.
7. Open Reports and save the assessment as PDF.
8. Use the report and blueprint as the basis for the discovery conversation.

## Important security follow-up
The first-client release uses authenticated Supabase access for the admin. Before creating additional admin accounts, replace the broad authenticated assessment policies with an explicit admin allowlist or role-based policy.
