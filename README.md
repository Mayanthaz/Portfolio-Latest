# Mayantha Udayanga Portfolio

## Deploying with Supabase

The public portfolio and protected content editor use Supabase.

### 1. Apply database migrations

Install the Supabase CLI, sign in, link the project, and push the migrations:

```bash
npx supabase login
npx supabase link --project-ref <your-project-reference>
npx supabase db push
```

The latest migration restores the permission required for the admin Save button.

### 2. Add hosting environment variables

Add these variables in the deployment provider's project settings:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=<Supabase publishable key>
```

Copy the publishable key from **Supabase Dashboard → Project Settings → API**. Never
expose a service-role or secret key as a `VITE_` variable.

### 3. Configure authentication URLs

In **Supabase Dashboard → Authentication → URL Configuration**:

- Set **Site URL** to `https://mayantha.dev`.
- Add `https://mayantha.dev/auth?recovery=1` to **Redirect URLs**.
- While the Lovable preview remains active, also add
  `https://aqua-mac-showcase.lovable.app/auth?recovery=1`.
- For local recovery testing, add `http://localhost:5173/auth?recovery=1`.

The production URL should be an exact match. If the requested recovery URL is
not in this allow list, Supabase can fall back to the Site URL and open the
portfolio homepage instead of the reset-password form.

In **Authentication → Providers → Email**, disable new-user sign-ups. The database
RLS policies enforce the approved administrator identity. The repository's Supabase
config has `enable_signup = false`, but confirm this setting in the hosted dashboard.

### 4. Configure branded recovery email delivery

The application only submits password recovery for the assigned administrator email.
Supabase should also contain only that administrator user because sign-ups are disabled.

For production delivery, open **Supabase Dashboard → Authentication → Emails → SMTP
Settings** and configure a custom transactional provider such as Resend, Postmark, AWS
SES, SendGrid, Brevo, or ZeptoMail:

- Sender name: `Mayantha Portfolio`
- From address: use an address on a domain you own, such as
  `no-reply@auth.your-domain.com`
- Verify SPF, DKIM, and DMARC records supplied by the provider
- Do not use the shared trial sender for production

The same settings can be supplied to the CLI without committing credentials:

```text
SMTP_HOST=<provider SMTP hostname>
SMTP_USER=<provider SMTP username>
SMTP_PASS=<provider SMTP password>
SMTP_FROM_EMAIL=<verified sender address>
```

The configured sender display name is `Mayantha Portfolio`. After custom SMTP is
active, Gmail will show:

```text
Mayantha Portfolio <your verified sender address>
```

The previous shared-sender identity will remain on already-received messages. Only
newly sent recovery messages use the new identity.

Then open **Authentication → Email Templates → Reset password** and use:

- Subject: `Reset your Mayantha Portfolio password`
- Body: the contents of `supabase/templates/recovery.html`

The repository increases sign-in capacity to 60 requests per five minutes per IP and
recovery delivery to 10 emails per hour. Apply hosted Auth settings with:

```bash
npx supabase config push
```

Custom SMTP and correct SPF/DKIM/DMARC significantly improve deliverability, but Gmail
ultimately decides inbox placement, so it cannot be guaranteed by application code.

### 5. Build

```bash
npm install
npm run build
```
