# First-client deployment checklist

## Supabase
- [ ] Run `supabase/schema.sql`
- [ ] Confirm RLS is enabled on `assessments`
- [ ] Confirm public INSERT works
- [ ] Confirm authenticated SELECT works
- [ ] Confirm authenticated UPDATE/DELETE works
- [ ] Create the single admin Auth account
- [ ] Add `http://localhost:3000/admin/reset-password` to Auth redirect URLs for local testing
- [ ] Add the production `/admin/reset-password` URL to Auth redirect URLs before production password reset testing

## Local app
- [ ] Copy `.env.example` to `.env.local` and add your public Supabase URL/anon key
- [ ] `npm run dev`
- [ ] Complete a full test assessment
- [ ] Test every `Other` field
- [ ] Refresh while partway through and confirm progress returns
- [ ] Submit and confirm the success screen
- [ ] Confirm the assessment row appears in Supabase
- [ ] Sign into `/admin`
- [ ] Open the submitted business
- [ ] Confirm `Other: custom response` is visible
- [ ] Mark the assessment reviewed
- [ ] Open System Blueprint
- [ ] Copy build spec
- [ ] Download build spec
- [ ] Print / Save PDF report
- [ ] Test password reset

## Mobile
- [ ] Test iPhone-sized viewport around 390×844
- [ ] Test 430×932
- [ ] Verify no horizontal scrolling
- [ ] Verify keyboard does not hide fields/buttons
- [ ] Verify sticky navigation remains usable

## Vercel
- [ ] Push the current project to GitHub
- [ ] Confirm `.env.local` is not committed
- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Set `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Deploy
- [ ] Test production `/`
- [ ] Test production `/admin`
- [ ] Test one real assessment end-to-end before sending the link

## Before adding more admins
- [ ] Replace broad `authenticated` assessment policies with an explicit admin role/allowlist
