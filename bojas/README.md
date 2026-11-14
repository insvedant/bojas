# BOJAS — website + player admin panel

Next.js 14 (App Router) football agency website with a built-in admin panel for managing players.
Data lives in MongoDB Atlas. Deploys to Netlify (or Vercel).

- Public site: home, about, 3 guides, services, coaching, players, the player form, contact, thank-you.
- Admin panel at `/admin/`:
  - **Players**: add / edit / delete players, photos, ratings, publish or hide (draft), display order.
  - **Site content**: edit every headline, paragraph, button label, contact detail, licence, social link, the 3 guide articles and every photo on the site. Each photo slot shows which page it appears on and the size to upload.

## 1. Set up

```bash
npm install
cp .env.example .env.local     # then fill in the 4 values
npm run seed                   # optional: adds the demo players John Smile and Chris Tucker
npm run dev                    # http://localhost:3000  ·  admin: http://localhost:3000/admin/
```

`.env.local` values:

| Variable | What it is |
| --- | --- |
| `MONGODB_URI` | MongoDB Atlas connection string (Atlas → Database → Connect → Drivers). Include a database name, e.g. `/bojas`. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | The admin login. Use a long password. |
| `AUTH_SECRET` | Random string (32+ chars) that signs the login cookie: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

In Atlas → **Network Access**, allow `0.0.0.0/0` (Netlify's servers don't have fixed IPs).

## 2. Deploy on Netlify

1. Push the repo to GitHub (`.env.local` is git-ignored, never commit it).
2. Netlify → **Add new site → Import from Git** → choose the repo. Build settings come from `netlify.toml`.
3. Netlify → **Site configuration → Environment variables**: add the same 4 variables.
4. Deploy. Then **Domain management** → add your domain and point DNS from GoDaddy (keep MX records for email).

## Troubleshooting

Signed in, open **`/api/admin/health/`** (also linked as *Connection check* in the admin menu). It shows whether the database is connected and which environment variables are set. Admin saves now stop after 25 seconds with a clear message instead of loading forever.

| Message | Fix |
| --- | --- |
| MongoDB Atlas did not respond | Atlas → Network Access → allow `0.0.0.0/0` |
| rejected the username or password | Atlas → Database Access: check the user, and that `<db_password>` was replaced in `MONGODB_URI` |
| MONGODB_URI looks wrong | Copy it again from Atlas → Connect → Drivers |
| MONGODB_URI is not set / AUTH_SECRET is missing | Add the variable in Vercel/Netlify, then **redeploy** |

**Vercel:** works the same as Netlify (ignore `netlify.toml`).

## Form submissions

The player form and contact messages are saved in MongoDB and shown in Admin → **Submissions**, for every login.

- Folders: Inbox, Player forms (entries), Contact messages, Archived, Spam. Search by name/email/phone, filter by form and status.
- Each entry shows every answer (with self-ratings as bars), plus **where it came from**: which form and page, the site the visitor arrived from (Google, Instagram…), campaign UTM tags, their first page, city/country (on Vercel), time taken to fill in, IP and browser.
- Statuses: New → Reviewed (automatic when someone opens it) → Contacted → Archived. Add internal notes; reply by email, call or WhatsApp in one click.
- **Download CSV** exports the current folder/filter for Excel or Google Sheets.
- Admins can delete entries and empty the spam folder. Every view, status change, note, export and delete is in the activity log.

**Spam protection** (no setup needed):
- hidden trap field that only bots fill in;
- signed form token: forms not loaded from this website are caught;
- minimum fill-in time (bots submit in under a second);
- link-count and spam-word checks;
- max 5 submissions per connection per 10 minutes, and double-click duplicates are ignored.

Caught entries go to the **Spam** folder (not deleted) and the sender still sees “thank you”, so bots learn nothing. If a real person lands there, open it and click **Not spam**.

Optional extra layer: **Cloudflare Turnstile** (free, usually invisible). Create a widget in the Cloudflare dashboard → Turnstile, then add `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY` in Vercel and redeploy.

## Agents and licence PDFs

The website shows **up to four agents**. Edit each in Admin → Site content → **Agent 1** to **Agent 4** (same fields for all four).

- Home: a tile per agent (portrait, name, titles) linking to their profile. About: a full profile per agent. Guides: "By Agent 1, Agent 2, Agent 3 & Agent 4" (names of the agents shown).
- The gold licence strip and licence box on Home combine all agents' licences, without repeats.
- **Licence PDF (optional):** upload a PDF per agent. The About page then shows a "View licence" button (the text is editable). **If no PDF is uploaded, nothing is shown on the website.** Remove or replace it any time; old files are deleted.
- PDFs are limited to 4 MB (Vercel's upload limit) and are checked to be real PDFs. They are stored in MongoDB.
- Agents 2 to 4 show `[bracketed]` placeholders until you fill them in. To remove an agent from the website, clear their name.

## Logins, roles and the activity log

- **Owner**: the `ADMIN_EMAIL` / `ADMIN_PASSWORD` login from the environment variables. Always works (even before MongoDB is connected). Change its password in the hosting dashboard and redeploy.
- **Up to 5 more logins**, created in Admin → **Logins** (needs MongoDB):
  - **Agent**: edits players and site content.
  - **Admin**: also creates/deactivates/deletes logins, resets passwords and sees the activity log.
- Everyone can change their own password by clicking their name in the top bar.
- Deactivating a login, resetting its password or changing its role signs that person out immediately.
- After 8 wrong passwords for one email within 15 minutes, that email is locked for 15 minutes.

**Activity log** (Admin → Activity log): every sign-in, failed sign-in, player add/edit/delete, site content edit, submission action and login change, with who did it, when, and the exact before → after values for each field. Filter by person or type. The Players list and each Site content page also show who saved last.

## Admin panel

- `/admin/` — all players (published and drafts), with Edit / View / Delete.
- `/admin/players/new/` — add a player.
- Photos are resized in the browser (max 1200 px) and stored in MongoDB, so no extra storage service is needed.
- Changes appear on the website immediately.
- Unchecking **Show on the website** keeps the player as a draft (hidden from the public site).

Security: every admin page and API route checks the signed, httpOnly session cookie (in middleware and again inside each route). There is one admin login set by environment variables. Change the password by updating `ADMIN_PASSWORD` in Netlify and redeploying.

## Editing the website text and photos

Admin → **Site content**:

| Section | What you edit |
| --- | --- |
| Business info & contact | Address, email, phone, top-bar tagline, header button, footer text, social links, Google title & description, link-preview image |
| Agent 1 to Agent 4 | Name, role label, titles, portrait, biography, quote, licences & badges, optional licence PDF, optional email/phone/languages |
| Home, About, Services, Coaching | Every headline, paragraph, card, list and button on that page |
| Players page, Player form, Contact, Thank-you | Page text, privacy notice, Google Maps embed |
| Guide 1–3 | Headline, Google description, cover photo, intro, quote and all sections |

The bottom of the Site content page lists **every photo on the website**, where it appears and its recommended size:

| Photo | Appears on | Upload size |
| --- | --- | --- |
| Agent portrait | Home "About us" block + About profile | 1200 × 1100 px |
| Link preview image | WhatsApp / Facebook / LinkedIn shares | 1200 × 630 px |
| Scouting card photo | Home hero card | 1000 × 600 px |
| Coaching header photo (optional) | Coaching header, replaces the tactics drawing | 1200 × 800 px |
| Guide cover photos | Top of each guide | 1600 × 600 px |
| Player photos | Player cards + profile | 1200 × 1020 px |

Uploaded photos are cropped from the centre to the right shape and resized in the browser, so any reasonable photo works. If a photo is smaller than recommended, the editor warns you. Changes go live when you click **Save changes**. A field left empty is hidden on the site.

Developers: every editable field is defined in `lib/contentSchema.js` (with its default text). To make something new editable, add a field there and read it in the page with `getPageContent('<page>')`.

## Where things live

| What | Where |
| --- | --- |
| Editable content definitions + default text | `lib/contentSchema.js` |
| Domain (for SEO links) and menu | `lib/site.js` |
| Colours and fonts | top of `app/globals.css` |
| Logo (monogram + wordmark) | `components/Logo.js`, favicon `app/icon.svg` |
| Player form fields | `lib/formSchema.mjs` |
| Database models | `models/Player.js`, `models/Photo.js`, `models/SiteContent.js` |
| Admin pages | `app/admin/` |
| Admin API | `app/api/admin/` |

## Before launch

In Admin → Site content, fill in **Agent 1** to **Agent 4** (name, titles, portrait, licences, optional licence PDF) and **Business info & contact** (office address, email, social links), replacing every `[bracketed]` placeholder. Then create the agent logins under **Logins**. Then upload the photos listed above, fill in the 3 guides, and set coaching durations and prices. In `lib/site.js`, set `url` to your real domain.
