# FODEL: launch-readiness round

You are working on FODEL (fodel.eu), a site that advertises Hungarian property to buyers in Western Europe. Your job is the last round of changes before launch. Everything you need is below, including exact file paths, so you should not have to explore the codebase broadly. Read a file before you change it, and stop to ask only where this brief says to.

Build it the way a senior product engineer at a top design-led company would: simple to use, beautiful, accessible, industry-standard, with no clever hacks. Small, readable changes that match the surrounding code style (it uses rich doc-comments explaining *why*; keep that density).

---

## 0. Hard rules (non-negotiable)

1. **Never read, print or grep `.env`.** Use `.env.example` to learn the keys. Add every new key to `.env.example` with a comment.
2. **The local `.env` points at the LIVE Supabase database.**
   - Never write to it.
   - Never submit a form against the local dev server.
   - Never run `scripts/verify-workflow.mjs`, `scripts/verify-rls.mjs` or `seed:*` against it.
   - Never run migrations: the user runs migrations by hand.
   - All new SQL goes in **one** new idempotent migration, `supabase/migrations/0020_launch_readiness.sql` (`if not exists`, `create or replace`). Mention it in the handover.
3. **Don't kill the user's dev server on port 4321.** The repo lives on OneDrive. Reading `node_modules` there times out, and Vite misses edits. So do all `npm install`, `astro check`, builds, previews and tests in a clone outside OneDrive:
   - copy with `rsync -a --exclude node_modules --exclude dist --exclude .env <repo>/ <scratchpad>/build/`, then `npm ci` there;
   - re-sync after edits;
   - use a free port (e.g. 4400) for the preview.
4. **Never invent business facts.** That covers prices, phone numbers, deadlines, legal wording and statistics.
   - Prices come only from `listingCatalog()` in `src/lib/listing-packages.ts`.
   - Company facts come from `getCompany()` in `src/lib/runtime-config.ts` and `src/config/company.ts`.
   - If something is missing, leave a clearly marked TODO and list it in the handover.
5. **Admin (portal, admin-role) UI text stays Hungarian.** Owner/seller-facing portal screens added in this round must be in the seller's language (`profiles.locale`, `hu` or `nl`).
6. **Design system: FODEL 2.0.** See `src/styles/tokens.css`, `src/components/Button.astro`, `ArrowChip.astro` and `src/styles/global.css`.
   - Use slabs, the radius scale tokens, pill buttons with ArrowChip, sentence case, upright quiet-ink `<em>` in headings.
   - **No** split-colour, outlined, gradient-text or italic text effects.
   - Check HU and NL at 320, 375, 390, 768, 1024, 1280, 1440 and 1920 px, with no horizontal overflow.
7. Commit in small logical commits only when the user asks. Push only when the user asks. At the end, offer to push.

### Stack and facts

- **Stack:** Astro 5 SSR on Vercel (region fra1), Supabase (RLS is the security boundary), Resend (email), Stripe (card payments, off unless `STRIPE_ENABLED=true`).
- **Repo:** `omarci16/Fodel`, branch `main`.
- **Live site:** https://fodel.vercel.app.
- **Deploy status:** `gh api repos/omarci16/Fodel/commits/<sha>/status --jq .state`.
- **Locales:**
  - `hu` and `nl` are full sites. Each page passes `alternates` to `Base.astro` and `Nav.astro`.
  - `en`, `de` and `fr` are bridge pages: `src/layouts/Bridge.astro` and `src/components/pages/LocaleBridgePage.astro`.
  - Strings live in `src/i18n/ui.ts`, `src/data/*.ts`, the inline `t = hu ? {...} : {...}` objects inside `src/components/pages/*.astro`, and `src/lib/email/copy/{hu,nl}.ts`.
- **Existing checks:** `npm run check`, `npm run build`, `npm run test:rules`, `npm run verify:ssg`, `npm run verify:contrast`.

---

## Order of work

Work in this order. Each phase ends with check, build, the relevant tests, and screenshots at the widths above:

1. Test harness.
2. Browser fixes.
3. Nav.
4. Registration-first flow.
5. Forms.
6. Admin ordering.
7. Language polish (last, because phases 3–5 add copy).
8. Full end-to-end pass, plus Resend and Stripe readiness.
9. Handover.

---

## 1. Test harness (set up first, use throughout)

- Add Playwright as a devDependency, with config in `playwright.config.ts` and tests in `tests/e2e/`.
- Projects: `chromium`, `firefox`, `webkit` (the Safari engine, which matters most here), `mobile-safari` (iPhone 15 device) and `mobile-chrome` (Pixel 7).
- **Database for tests: never live.** Tests load env from `.env.test` only. Add `.env.test.example` and gitignore `.env.test`.
- **Guard:** the test setup refuses to run unless `E2E_ALLOW_WRITES=1` is set and `SUPABASE_URL` is either localhost or matches `E2E_SUPABASE_REF`.
- **Ask the user**, before phase 8 rather than now, to provide one of these:
  - Docker Desktop, so you can run `supabase start` (the CLI is installed at `/opt/homebrew/bin/supabase`; Docker is not installed yet);
  - or a separate free Supabase project, "fodel-test", with migrations 0001–0020 applied by them.
- **Read-only public tests can run against the clone's preview** from the start. Those are navigation, language switching, layout and form validation without submitting.
- **Email capture:** add `EMAIL_TRANSPORT=capture` to `src/lib/email/send.ts`.
  - In capture mode, `sendEmail` writes each message as JSON to `.e2e/outbox/` and sends nothing. Gitignore that folder.
  - Tests read invite and reset links from there.
  - Default behaviour is unchanged.
- **Stripe in tests:** use Stripe test mode keys if the user provides them; otherwise use `stripe-mock` (`brew install stripe/stripe-mock/stripe-mock`).
  - Sign webhook payloads with `stripe.webhooks.generateTestHeaderString` and post them to `/api/stripe/webhook`.
  - The Stripe CLI is not installed; don't depend on it.

---

## 2. Browser compatibility: Safari first

### Reported bug

In Safari, you can't switch language at all, and you can't switch back.

### Root causes to fix (verified by reading the code)

1. **The switcher closes before the click lands** (`src/components/LanguageSwitcher.astro`).
   - Safari does not focus links or buttons on mouse click. Clicking a menu row therefore fires `focusout` with `relatedTarget = null` and `document.activeElement = body`.
   - The rAF handler then calls `setOpen(false)`, which sets `menu.inert = true` and `pointer-events: none` between mousedown and click, so the click never reaches the `<a>`.
   - **Fix:**
     - Close on outside `pointerdown`, on `Escape`, and on `focusout` only when `relatedTarget` is a real element outside the root.
     - Never close because focus went to `null` or `body`.
     - Keep the rows as real `<a href>`, so switching works with JS disabled too.
   - The same `focusout` + rAF pattern is used for the nav pill in `src/components/Nav.astro`. Check it for the same issue.
2. **There is no way back from en, de and fr.** `Bridge.astro` and `LocaleBridgePage.astro` have no language switcher.
   - Add the same `LanguageSwitcher` there. hu and nl point to `/hu/` and `/nl/` (or to the matching alternate when one exists).
   - `LanguageSwitcher` already handles `en`, `de` and `fr`. Type its `locale` prop to accept the bridge locales.
3. **The site doesn't remember the visitor's choice.** `src/pages/index.astro` redirects by `navigator.languages`, so a Hungarian who picked NL is sent back to `/hu/`.
   - When someone picks a language in the switcher, set a `fodel_lang` cookie (1 year, `SameSite=Lax`, `path=/`).
   - The root page's inline script prefers that cookie, then `navigator.languages`, then `nl`.
4. **The portal sign-in screens are Hungarian-only** (`src/pages/portal/login/index.astro`, `forgot/`, `reset/[token].astro`).
   - Nav links pass `?lang=<locale>`, and those pages read `lang` (falling back to the cookie, then `hu`).
   - Render the text in hu or nl through the `AuthPanel` `lang` prop, which already exists.
   - Keep the `next` param working.
5. **Cross-document view transitions** (`@view-transition` in `Base.astro`, rules in `src/styles/global.css`, and `src/styles/portal.css` around line 337).
   - Test navigation in WebKit with them on and off.
   - If they break or stall anything in Safari (black flash, stuck old page, broken back/forward), keep them as progressive enhancement and make sure they can never block navigation.

### Full compatibility pass

Check and fix each of these across all Playwright projects and the existing pages:

- **Back/forward cache:** on `pageshow` with `event.persisted`, reset open menus, the mobile drawer (`#nav-drawer`, `inert`), dialogs and scroll locks.
- **iOS viewport:** use `100dvh` with a fallback; respect `env(safe-area-inset-*)` on the fixed nav and drawer.
- **iOS input zoom:** the input font-size must be at least 16px.
- **Hover on touch:** gate hover-only effects behind `@media (hover: hover)`.
- **Tap highlight** colour.
- **Blur:** `-webkit-backdrop-filter` is present everywhere `backdrop-filter` is used.
- **Feature support:** `inert`, `:has()`, `<dialog>` (the portal "pf" dialogs) and `scrollbar-gutter`. Each needs a fallback where support is shaky.
- **Native controls:** date and number inputs, autofill styling, and `type="search"` styling in WebKit.
- **Maps:** MapLibre (`src/components/Map.astro`, `/hu/terkep`, `/nl/kaart`) in WebKit and mobile.
- **Uploads:** file upload and drag-and-drop in the portal editor, in Safari.
- **Fonts:** font loading and the `document.fonts.ready` nav pill measurement.
- **Motion:** `prefers-reduced-motion` respected everywhere.
- **Lighthouse budget:** mobile scores of performance ≥ 90 and accessibility ≥ 95 on home, listings, a property, the submit page and the price list (hu and nl).

### Language-switch e2e test

Write one e2e test that, in every project:

1. opens `/hu/`;
2. switches to NL, then EN, back to HU, to DE, back to NL;
3. uses both mouse and keyboard, on desktop and in the mobile drawer;
4. asserts the URL and `<html lang>` after each step.

---

## 3. Nav: "Belépés / Regisztráció" and an eye-catching "Hirdetés feladása"

File: `src/components/Nav.astro`. Labels go in `src/i18n/ui.ts` (`cta.*`).

Today, `nav-end` holds the switcher, a "Bejelentkezés" icon link and a dark "Kapcsolat" button. The mobile drawer foot has "Visszahívást kérek" and "Bejelentkezés". No "Hirdetés feladása" exists in the nav; it only appears on the sellers page (`SellersPage.astro`).

### Account control

- **Desktop:** one quiet pill (user icon + label), linking to `/portal/login?lang=<locale>`.
  - Labels: HU "Belépés / Regisztráció", NL "Inloggen / Registreren".
  - The slash is a thin, quiet divider in the same ink colour. No two-tone text.
- **Narrow desktop (below about 1200px)**, or wherever the row would not fit: collapse it to icon-only, keeping the full label in `aria-label`.
- **Mobile drawer:** two equal buttons, "Belépés" and "Regisztráció".
- **The auth screen** gets a segmented control at the top, "Bejelentkezés | Regisztráció".
  - Each tab is its own URL: `/portal/login` and a new `/portal/register`. Both are public paths, so add `/portal/register` to `PUBLIC_PORTAL_PATHS` in `src/middleware.ts`.
  - Deep links and the back button must work.
  - The Register tab renders the same `RegisterForm` component as the submit page (section 4).
  - Signed-in visitors are redirected to the dashboard, as login already does.

### "Hirdetés feladása" CTA

- It becomes the dark primary pill in `nav-end`. HU "Hirdetés feladása", NL "Advertentie plaatsen", linking to `path(locale, 'submitAd')`.
- "Kapcsolat" moves into the nav links row as the last link. It is already in the drawer.
- Check that the row fits at 1024, 1280 and 1440 in HU, which has the longer words.
- In the drawer foot, add it as the first, primary button.

### The CTA effect

The effect should draw the eye but stay elegant and calm, never flashy. Spec:

1. **Sheen:** a soft diagonal light sweep crosses the pill about every 7 s.
   - Build it as a `::after` pseudo-element moved with `transform` only, clipped by the pill radius, in a low-opacity warm white.
2. **Halo:** a faint brass/gold ring "breathes" twice shortly after load, then rests.
   - Animate the opacity of a pseudo-element with a pre-set shadow. Do not animate `box-shadow` itself.
   - Use the existing gold token from `tokens.css` and `GoldRule.astro`.
3. **Hover/focus:** the ArrowChip nudges forward and the sheen plays once immediately.
4. **Motion rules:** compositor-only properties (transform, opacity). `prefers-reduced-motion` means a static pill. No layout shift. Keep the existing `focus-visible` ring.

Apply the same CTA treatment (sheen and hover only, no halo) to the hero CTA on `SellersPage.astro`.

---

## 4. Registration first, property details after

### Problem

Today `/hu/hirdetes-feladasa` and `/nl/advertentie-plaatsen` (`src/components/pages/SubmitAdPage.astro`, 914 lines, posting to `src/pages/api/listing-order.ts`) ask for everything up front: package radio cards, extras, a live total, property data, description and billing.

The endpoint creates only an `invites` row with that data as `payload`. A draft listing appears only when the emailed link is accepted (`src/pages/api/portal/invite/accept.ts`, which calls `createDraft` and `applyIntake` from `src/lib/portal/properties.ts`). Until then the admin sees nothing, which is why the user's own test submission "wasn't in the admin".

Also:

- if the email already has an account, the endpoint silently sends nothing;
- if an invite is already open, it silently sends nothing.

### New flow

1. **Step 1, public page.** Name, email, phone, plus the consents the current form requires (keep their wording; find them in `SubmitAdPage.astro`).
2. **Step 2, email.** "Check your inbox."
3. **Step 3, set password** at `/portal/invite/[token]`.
4. **Step 4, guided listing setup** in the portal, in the seller's language.
5. **Then the existing flow:** submit → review → approve → pay → publish.

### 4a. Public submit page (`SubmitAdPage.astro`)

**Keep:**

- the hero;
- the process steps, rewritten for the new order: 01 Regisztráció → 02 E-mail és jelszó → 03 Hirdetés összeállítása (csomag, adatok, fotók) → 04 Ellenőrzés → 05 Megjelenés → 06 Díjrendezés;
- `PhotoTips`, the FAQ and the refund policy text.

**Packages and extras become information only:**

- `PackageCard` gets a non-interactive mode: no radio, no selected state, no live total.
- Mark the recommended package with the existing "Ajánlott" badge.
- Add the note: "A csomagot és a kiegészítőket a regisztráció után, a hirdetés összeállításakor választja ki." with a natural NL equivalent.
- Prices still come from `packageCard()` and the catalogue.

**The form** is a new `src/components/forms/RegisterForm.astro`, reused on `/portal/register`. Its fields:

- full name;
- email;
- phone (the international phone field from section 5);
- the required consents;
- hidden `locale` and `referralCode` (read from `?ref=`, as today);
- the honeypot and rate limit that `handleForm` already provides.

**After submit,** replace the form in place, without a page change, with a calm "Nézze meg a postafiókját" panel showing:

- the address it was sent to;
- the sender (from `senderAddress()` in `src/lib/email/routing.ts`);
- the subject line;
- that the link is valid for 7 days;
- "check your spam folder";
- a "Resend email" button, disabled with a visible countdown for 60 s;
- a "Wrong address? Change it" link back to the form, which keeps the values.

**Delete the dead code** this removes: the extras and total-calculator scripts, the package radio logic and unused copy.

### 4b. Endpoint

Slim down `src/pages/api/listing-order.ts`. Keep the route so old links and forms don't 404.

**Fields:** `name`, `email`, `phone`, consents, `locale`, `referralCode`.

**Account enumeration safe.** The UI always shows the same success panel. Server-side, by case:

| Case | What happens |
|---|---|
| New email | Create the invite (role `owner`, 7 days, hashed token) with `payload {locale, name, phone, referralId}`, then send `templates.registrationConfirm`. |
| Open invite already exists | Rotate the token: update `token_hash` and `expires_at` on that row and send a fresh email. This is what powers "Resend". |
| Account already exists | Send a short "Már van fiókja" email with sign-in and reset-password links. Add the template in hu and nl in `src/lib/email/copy/*.ts` and `templates.ts`. |

- Keep the referral resolution exactly as it is now.
- Keep the office notification email, with subject changed to "ÚJ REGISZTRÁCIÓ / Nieuwe registratie".
- On-site service requests (`createServiceRequest`) move to the wizard (4d), because the service is chosen there now.

**Make it visible in admin right away.** In `src/pages/portal/inbox/index.astro`, add a first column, "Regisztrált — még nem állított be jelszót" (registered, password not set yet). It lists open, unaccepted, unexpired self-registration invites with:

- name, email, phone;
- relative time ("12 perce") with the absolute time on hover;
- an "Újraküldés" (resend) action, which uses the same rotation;
- a "Törlés" (delete) action, behind a confirm dialog.

Expired ones show in a collapsed "Lejárt" (expired) group. Reuse the existing invite-revoke endpoint (`src/pages/api/portal/users/invites/[inviteId].ts`) where possible.

**Backward compatibility:** invites already sent with the old big payload must still accept and pre-fill a draft. `accept.ts` and `applyIntake` keep handling that shape.

**Email copy:** rewrite `registrationConfirm` (hu and nl) for the new flow.

- One clear button: "Jelszó beállítása" / "Wachtwoord instellen".
- Then one line on what comes next.
- Check the rendering in `src/pages/dev/emails.ts`.

### 4c. Set password (`src/pages/portal/invite/[token].astro` and `accept.ts`)

- Show the name pre-filled from the payload (editable) and the email read-only.
- One password field with a show/hide toggle, `autocomplete="new-password"`, and the live requirement visible ("Legalább 8 karakter" / "Minimaal 8 tekens").
- No confirm field.
- Clear, localised states for expired, used and invalid links. Each offers "Új link kérése" (request a new link), which posts to the same rotation.
- On success:
  1. create the profile with `locale` and `phone` from the payload;
  2. create a draft listing for every new self-registration, using the existing `createDraft`;
  3. redirect to the setup wizard (4d) for that draft.
- Admin-sent invites without a listing payload keep going to the dashboard as today.

### 4d. Guided listing setup (new)

**Where:** a new page, `src/pages/portal/properties/[id]/setup.astro`. Owner of the draft or admin only. Bilingual hu/nl by `profiles.locale`.

**Layout:** a calm stepper, with a progress bar and "2 / 6", on one page. Steps are sections revealed one at a time:

- each step has a Back and a Continue button;
- the URL hash tracks the step;
- autosave on Continue and on blur, using the existing update endpoint `src/pages/api/portal/properties/[id]/update.ts` (extend it rather than adding a parallel one);
- you can leave and resume.

**The steps:**

1. **Csomag / Pakket.**
   - The interactive `PackageCard` radios and extras with the live estimated total, moved here from the public page.
   - Same catalogue: `listingCatalog`, `packageCard`, `buildOrderLines` and `suggestSelection` in `src/lib/orders.ts`.
   - The higher-tier price is still decided server-side from the listing price (`isAboveThreshold`), so show "a végleges díjat az ár alapján számoljuk" (the final fee is calculated from the price).
   - The optional on-site service choice goes here too (`OnsiteServiceChoice.astro`), which creates the service request through `createServiceRequest`.
2. **Az ingatlan / De woning.** Type, settlement (autocomplete from `/data/telepulesek.json`), county, asking price in HUF, floor area, plot area, wall material, condition and heating (taxonomy), and map precision.
3. **Leírás és elérhetőség / Beschrijving en contact.**
   - Description, with a character counter and a short "what makes a good description" hint.
   - Languages spoken.
   - Whether contact details may be shown. Only offer the phone option if the chosen package allows it (`pkg.phone`).
4. **Fotók / Foto's.** The existing uploader and its rules, including the package photo limit, the photo meter and the `photo-limit` error, with `PhotoTips`. Extract the uploader from `src/pages/portal/properties/[id].astro` into a component so both pages share it.
5. **Számlázás / Facturering.** `BillingForm.astro`.
6. **Áttekintés / Overzicht.**
   - A read-only summary with an "Edit" link per section.
   - The estimated cost.
   - Submit for review, using the existing status action. After submitting, show a short "what happens now" message.

**Wiring:**

- The dashboard (`src/pages/portal/dashboard/index.astro`) shows a "Folytassa a hirdetés összeállítását" (continue setting up your listing) card for drafts that haven't been submitted.
- `src/pages/portal/properties/new.astro` sends owners into `setup` instead of the full editor.
- The full editor `/portal/properties/[id]` stays for admins and for later edits.

**Data:**

- Store the chosen package and extras where the current intake stores them: `properties.package`, plus whatever `src/lib/portal/requested-extras.ts` and `applyIntake` use today.
- Only add columns if something has no home. If you do, it goes in migration 0020.
- Keep RLS intact: owners edit only their own drafts.

**What doesn't change:** nothing publishes without admin approval, and payment still comes after approval.

---

## 5. Forms: clear, country-aware validation everywhere

Base it on `src/components/forms/Field.astro` and `FormShell.astro`, plus `src/lib/form-handler.ts` on the server.

### International phone field

Build a new `PhoneField.astro`:

- a country picker (flag + dial code, searchable) and the number input;
- default country from the locale (hu → HU +36, nl → NL +31);
- a common list first (HU, NL, BE, DE, AT, GB, FR, CH, SK, RO, HR, SI), then all countries;
- the placeholder and hint show that country's example format (for example "+36 30 123 4567" or "+31 6 12345678");
- format as you type, without fighting the cursor.

**Validation:** use `libphonenumber-js` (the `min` metadata). Validate on blur and on submit, client and server alike, and store E.164.

Use it in every form that asks for a phone: registration, the contact/enquiry/callback forms (`src/pages/api/enquiry.ts`, `callback.ts`), search request, valuation, wizard contact, profile settings and billing.

### Field conventions

- Every field shows required or optional consistently. `Field.astro` already renders "(kötelező)" / "(nem kötelező)"; make every form use it.
- Every field has a format hint wherever there is a format: phone, postcode per country, tax number, price, area, URL. For example:
  - Hungarian adószám: `12345678-1-23`;
  - EU VAT: country prefix;
  - postcodes: HU 4 digits, NL `1234 AB`, BE and AT 4 digits, DE 5 digits.
- Use the right `autocomplete`, `inputmode` and `enterkeyhint` on every field.
- Validate inline on blur. Never show errors while the person is still typing a field for the first time.
- Errors are specific and localised ("Adjon meg egy érvényes holland mobilszámot, pl. +31 6 12345678", not "Invalid").
- Use `aria-invalid` and `aria-describedby`.
- On a failed submit, show an error summary at the top that focuses the first invalid field.
- Inputs are at least 16px (iOS).
- Server-side rules mirror the client ones, and server errors re-render in place, keeping the values.

### Tests

- Unit tests for the validators (add them to `scripts/test-rules.mjs` or a small test file).
- Playwright tests that run every public form's validation without submitting to live.

---

## 6. Admin: newest first, everywhere

The rule: **every list of records shows the newest first.** Sort by the timestamp the admin cares about (`created_at`, or `submitted_at` for review queues), with `id` as the tie-breaker. Each row shows a relative time with the absolute time on hover.

### Known places to flip or fix

- `src/pages/portal/inbox/index.astro`: `byStatus` sorts oldest first. Flip it.
- `src/pages/portal/dashboard/index.astro`, line ~103: the review queue sorts oldest first. Flip it.
- Then audit every list for newest-first and make it consistent:
  - `src/pages/portal/enquiries/index.astro` (leads and callbacks);
  - services, users and invites, payments, invoices, valuations, newsletter;
  - database and people, the blog list;
  - `src/lib/portal/properties.ts` (line ~120);
  - `src/lib/portal/payments.ts`;
  - the CRM and activity feeds.
  - Grep `.order(` and `.sort(` under `src/pages/portal` and `src/lib/portal`. Check any client-side sort too.
- Timelines inside one record (payment events, review notes, activity) are newest first too.

### Deliberate exceptions (leave them, and add a one-line comment)

- photo `sort_order`;
- taxonomy `sort_order`;
- Top-10 / editor's-pick order;
- invoice line order;
- invoice counters;
- the "Hamarosan lejár" list (properties index ~line 48, dashboard ~line 116), which stays soonest-first because it's a deadline list. Label it so ("legközelebbi lejárat elöl").

---

## 7. Language polish: natural, native, not machine-sounding

### Scope

Every visitor-facing string in hu and nl, the en/de/fr bridge pages, and emails:

- `src/i18n/ui.ts`;
- `src/data/copy.ts`, `pages-content.ts`, `faq.ts`, `features.ts`, `photo-tips.ts`, `valuation-questions.ts`, `invite-letter.ts`;
- the inline `t` objects in `src/components/pages/*.astro`;
- `src/components/*.astro`;
- `src/layouts/Bridge.astro` and `LocaleBridgePage.astro`;
- `src/lib/email/copy/{hu,nl}.ts`;
- `src/lib/form-handler.ts` acknowledgements;
- the new copy from phases 3–5;
- meta titles and descriptions.

### Register and style

**Register:**

- Hungarian: formal "Ön".
- Dutch: "u".
- German: "Sie".
- French: "vous".
- English: plain British English.

**Write like a good local copywriter at a premium estate agency:**

- short sentences and concrete words;
- no marketing filler ("zökkenőmentes", "naadloos", "seamless", "elevate", "unlock");
- no rule-of-three padding;
- no rhetorical questions;
- far fewer em-dashes, since the current copy leans on "—" heavily (a typical machine-writing tell). Use commas, colons or full stops.

**Hungarian typography:**

- „…" quotes;
- space as the thousands separator (`1 200 000 Ft`);
- `120 m²`;
- correct "a/az";
- correct suffixes on numbers and names ("2026-ban", "a FODEL-nél").

**Dutch:** correct "de/het", compound words written as one, and `€ 1.200`.

### Constraints

- Don't change facts, numbers, prices or promises.
- `src/data/pages-legal.ts` (ÁSZF, privacy, cookies, impresszum): fix only grammar, typos and typography, never meaning. List anything substantive you'd change for the client instead.
- Keep keys and URLs (slugs in `ui.ts` `PATHS`) unchanged. SEO depends on them.

### Deliverable

A short Hungarian list of notable wording changes for the client in the handover. The before/after of the 10–15 most visible strings is enough.

---

## 8. End-to-end pass, Resend and Stripe readiness

Run against the test environment from section 1 only, in `chromium`, `webkit` and `mobile-safari`, with `firefox` for the public pages. Every workflow below must pass. Fix what fails.

### Public

- Every page returns 200 in hu and nl.
- No console errors.
- Language switching from every template, including the bridges, and back.
- Root redirect honours the cookie.
- Map browse.
- Property detail.
- Contact, enquiry, callback, search request.
- Newsletter double opt-in (`src/pages/newsletter/[action].astro`).
- Valuation: free, and paid through `/api/stripe/valuation-checkout`.
- Referral `?ref=` carried through registration.

### Seller lifecycle

1. Register.
2. Read the email from the outbox.
3. Set password.
4. Complete the wizard, including uploading photos up to the package limit and getting the `photo-limit` error past it.
5. Submit.
6. Admin sees it at the top of Inbox.
7. Admin requests changes, the owner edits, the owner resubmits.
8. Admin approves. The order is built from the catalogue, and the díjbekérő (payment request) and approval email are sent.
9. Payment, both ways:
   - card through Stripe Checkout, with a signed webhook marking it paid and an invoice being created;
   - or admin marking a bank transfer paid.
10. The listing is live on `/hu/` and `/nl/` in the right package and duration.
11. The expiry reminder cron runs (`/api/cron/daily`, authorised with `CRON_SECRET`).
12. Archive, reactivate, mark sold.
13. The owner renewal link works (`src/pages/listing/[action].astro`).

### Edge cases

- Registering with an existing account's email.
- Pressing Resend twice.
- An expired invite.
- A used invite.
- An old big-payload invite still pre-fills.
- Login with a wrong password, and the rate limit.
- Forgot and reset password.
- Logout.
- An owner can't open another owner's draft. RLS is checked with `scripts/verify-rls.mjs`, on the test DB only.

### Admin

- Save the packages editor (`/portal/settings/packages`) and confirm the public price list and the wizard show the new price.
- Services settings.
- Templates.
- Invoices: draft, issue, PDF, exports.
- Database export.
- Blog create and publish.
- Taxonomy.
- Top 10.
- Inviting a user.
- Every list newest first.

### Resend: code-ready, no real key needed

- With no key, it logs and doesn't crash.
- In capture mode it writes to the outbox.
- With a key, the retry on 429 and 5xx works and a bad payload isn't retried.
- `FODEL_FROM`, `FODEL_REPLY_TO` and `FODEL_INBOX` from `.env.example` are honoured.
- Every template renders in hu and nl. Check plain-text parts and link URLs on the production origin.
- Write a setup checklist for the user, covering:
  - verifying the domain fodel.eu in Resend (SPF, DKIM and DMARC records);
  - the `RESEND_AUDIENCE_ID` for the newsletter;
  - a smoke test to `delivered@resend.dev`.

### Stripe: code-ready

- With `STRIPE_ENABLED=false`, the bank-transfer path is complete and no card button shows.
- With it on:
  - the Checkout amount comes from the stored order, never the request body;
  - the success and cancel URLs work;
  - the webhook verifies the signature and rejects a bad one;
  - the webhook is idempotent (replaying the same event twice changes nothing);
  - these outcomes are handled: `checkout.session.completed`, async payment succeeded or failed, and expired.
- Test cards: 4242… succeeds, 4000 0025 0000 3155 requires 3DS, 4000 0000 0000 0002 is declined.
- Write a setup checklist for the user, covering:
  - test, then live, keys in Vercel env;
  - the webhook endpoint URL `https://<domain>/api/stripe/webhook` and the exact events to subscribe to;
  - `STRIPE_WEBHOOK_SECRET`.

### Finally

Run all of `npm run check`, `build`, `test:rules`, `verify:ssg`, `verify:contrast` and the full Playwright suite in the clone, and report the counts.

---

## 9. Handover

Write `Fodel-indulas-elotti-atadas.md` in Hungarian, short and practical, in the repo root, next to the existing `Fodel-ajanlat-teljesites-atadas.md`. It covers:

- what changed, per area;
- the new seller flow, with screenshots or a description;
- **migration 0020**, if any, which the user must run by hand before deploying;
- the Resend and Stripe checklists;
- the test-environment instructions;
- the wording-change list;
- open TODOs and decisions for the client.

Then tell the user, in a few lines, what's done, what's verified, and what's still theirs to do. Offer to commit and push.
