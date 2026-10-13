# AssignmentWriters.com Coupon Website

A starter website for your feedback coupon workflow:
- Customer enters a code at `/`
- Only approved coupons unlock the 5% OFF reward screen
- Reward screen shows an `AW-000001` style customer ID, not the coupon code
- Owner-only dashboard at `/admin`
- Generate printable `PRSH-XXXXXX` codes, save feedback details, approve codes, deactivate codes, and mark rewards redeemed
- No expiry date and no automatic order discount application

## Important before using with real customers
This is a starter project. Configure Supabase and deploy it before sharing the link. The discount is manually applied by you to the customer's next order. Do not mark a coupon redeemed until you actually apply that discount.

## Free setup checklist
1. Create a Supabase project at https://supabase.com/ (choose the free plan).
2. In Supabase, open SQL Editor and run `supabase/schema.sql`.
3. In Supabase Authentication, create one owner user with your email and a strong password. Disable public signups in Auth settings.
4. Copy `.env.example` to `.env.local` and fill in values from Supabase Project Settings > API:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (sometimes labelled publishable/anon key)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret; server-side only, never put it in a `NEXT_PUBLIC_` variable)
   - `ADMIN_EMAIL` (the exact owner email)
5. Install Node.js LTS, then in this folder run:
   - `npm install`
   - `npm run dev`
   - Open http://localhost:3000
6. Test the full workflow using a test coupon before giving any link to customers.
7. Deploy to a host whose current terms permit business/commercial use, and set the same environment variables in its project settings. Review free-tier limits/terms before selecting a host.

## Workflow
1. Generate one or more coupon codes from `/admin`. Print them on your cards.
2. Customer fills the feedback card and sends a photo to you.
3. Review the photo yourself. In `/admin`, enter the exact coupon code, name, place and feedback, then click “Save details & approve”.
4. Send the common website URL to the customer.
5. Customer enters the approved code and sees their personalized reward screen.
6. When the customer places their next order, verify the customer ID/screenshot, manually apply the 5% discount, then click “Mark redeemed”.

## Code and customer ID formats
- Coupon code: `PRSH-` + six random-looking characters (example: `PRSH-7K9Q2M`; examples are illustrative)
- Customer ID: `AW-` + six digits (example: `AW-000001`; examples are illustrative)
- Customer ID is assigned when feedback details are approved and saved.

## Notes
- This app uses the Supabase service-role key on the server. Keep it secret.
- The admin API checks the signed-in Supabase user against `ADMIN_EMAIL`.
- Generated coupons are inactive until approved.
- No coupon expiry is configured.
- This starter should be tested and reviewed before production use. Keep regular database backups and do not share admin credentials.
