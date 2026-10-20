# FODEL: full English, German and French versions of the public site

You are working in the FODEL repository (fodel.eu: Astro 5 SSR on Vercel, Supabase, Resend, Stripe). Read this whole file, then carry it out phase by phase, in one go, without asking questions unless a hard rule below forces you to. Work carefully; quality of language matters more than speed.

## Goal

Today the public site exists in full in **Hungarian (hu)** and **Dutch (nl)**. English (`en`), German (`de`) and French (`fr`) are only single bridge pages (`src/pages/{en,de,fr}/index.astro`, `src/layouts/Bridge.astro`, `src/components/pages/LocaleBridgePage.astro`; `en` and `de` also have a small blog folder). Make **everything public** available in **en, de and fr**, as real, natural translations, with the same page set, the same URL structure, the same design and the same behaviour as hu and nl.

"Everything public" means: every page a visitor can open without logging in, the forms and their validation messages, the cookie banner, the navigation and footer, the 404 page, SEO meta and structured data, the sitemap and hreflang, the legal pages, the blog, and every email a visitor or a seller receives.

## Hard rules (non-negotiable)

1. **Never read, print or grep `.env`.** Use `.env.example` to learn keys. New keys go into `.env.example` with a comment.
2. **The local `.env` points at the LIVE Supabase database.** Never write to it, never submit a form against a server that uses it, never run `scripts/verify-workflow.mjs`, `scripts/verify-rls.mjs` or `seed:*` against it, never run migrations (the owner runs them by hand). Any new SQL goes into **one** new idempotent migration `supabase/migrations/0020_translations.sql` (`if not exists`, `create or replace`), mentioned in the handover.
3. **Do not kill the owner's dev server on port 4321** (it runs from `/Users/marton/fodel-dev`). Do all `npm install`, `astro check`, builds, previews and tests in a clone outside OneDrive: `rsync -a --exclude node_modules --exclude dist --exclude .env --exclude .git --exclude .astro --exclude .vercel <repo>/ <scratchpad>/build/`, re-sync after edits, preview on port 4400.
4. **Never invent business facts**: prices, phone numbers, deadlines, percentages, legal wording, statistics. Take them from the existing hu/nl text, `src/config/company.ts` / `getCompany()` and `listingCatalog()` in `src/lib/listing-packages.ts`. Anything that cannot be carried over is a clearly marked TODO listed in the handover.
5. **Admin (portal, admin-role) UI stays Hungarian.** Owner/seller portal screens stay hu/nl by `profiles.locale` in this round unless phase 6 says otherwise.
6. Design system FODEL 2.0 stays as is (slabs, radius tokens, pill buttons with ArrowChip, sentence case, upright quiet-ink `<em>` in headings; no split-colour, outlined, gradient-text or italic text effects). Check **every new language at 320, 375, 390, 768, 1024, 1280, 1440 and 1920 px with no horizontal overflow**. German and French run 20–35% longer than Hungarian or Dutch: nav, buttons, forms, tables and cards must still fit.
7. Commit in small logical commits only when the owner asks; push only when asked. At the end, offer to commit and push.
8. The working tree already contains a large uncommitted launch-readiness round (Playwright harness, Safari fixes, registration-first flow, international phone field, language polish). Build on top of it, do not revert it, and read `Fodel-indulas-elotti-atadas.md` first.

## Register and style

- English: plain **British English**, "you". German: formal **Sie**. French: formal **vous**. Dutch stays "u", Hungarian "Ön".
- Write like a good local copywriter at a premium estate agency, **not a translator**: short sentences, concrete words, native idiom. Do not translate word for word; rewrite so it reads as if it had been written in that language. No marketing filler ("seamless", "nahtlos", "sans accroc" style padding), no rule-of-three padding, no rhetorical questions, few em-dashes (use commas, colons, full stops).
- **Terminology**: decide one consistent term per concept per language and keep it. Write the glossary into `src/i18n/GLOSSARY.md` first (listing, ad, seller, buyer, county/comitaat, settlement, cash buyer, exclusivity contract, power of attorney, land registry, energy performance certificate, brokerage fee/commission, "díjbekérő" (payment request), invoice, valuation, etc.). Hungarian place names, counties and property types keep their Hungarian name with a short translation where helpful (for example "Zala County").
- **Typography per language**: English `£`/`€ 1,200` style numbers with a comma thousands separator and a decimal point; German `1.200 €` with `„…“` quotes; French `1 200 €` with a narrow no-break space and `« … »` quotes with no-break spaces inside; dates, `m²` with a no-break space. Use the formatting helpers in `src/lib/format.ts` (make them locale-aware for the new locales rather than adding ad-hoc formatting).
- Facts must not change between languages: same numbers, prices, percentages, promises. If the Dutch and Hungarian texts disagree on a fact, keep the one from `company.ts`/the catalogue and list the discrepancy in the handover.

## Phase 1: Architecture (do this first, check after)

Today `LOCALES = ['hu','nl']` and `type Locale` drive routes, UI strings, hreflang, sitemap, emails and forms (`src/i18n/ui.ts`). `PLANNED_LOCALES` and `SWITCHER_LOCALES` already exist, and `src/lib/page.ts` builds `alternates` from `LOCALES`.

1. Read `src/i18n/ui.ts`, `src/lib/page.ts`, `src/layouts/Base.astro`, `src/layouts/Bridge.astro`, `src/components/LanguageSwitcher.astro`, `src/components/Nav.astro`, `src/components/Footer.astro`, `src/pages/index.astro`, `src/pages/sitemap*.ts`, `src/pages/robots.txt.ts`, `src/pages/llms.txt.ts`, `src/lib/seo.ts`, `astro.config.mjs` and `scripts/verify-ssg.mjs` before changing anything.
2. Promote `en`, `de`, `fr` to **full** locales: `LOCALES = ['hu','nl','en','de','fr']`. Let the TypeScript compiler find every place that was `Record<'hu'|'nl', …>` and fix them all properly (no `as any`, no silent fallbacks to Hungarian). The existing pattern `nl satisfies typeof HU` for email copy exists so that a missing translation fails the build: keep that guarantee for all five languages.
3. URL structure: `/en/…`, `/de/…`, `/fr/…` with **translated slugs** for every route, as hu and nl have (`ROUTES` in `ui.ts`: e.g. `/en/sell/`, `/de/verkaufen/`, `/fr/vendre/`). Choose natural, short, SEO-sensible slugs; property detail URLs follow the existing `type-for-sale-ref` pattern (`/en/house-for-sale-6412/`). Keep every existing hu and nl URL unchanged. Add redirects from the old bridge URLs if any changes.
4. `hreflang`, `x-default`, canonical, sitemap (all five locales, all pages, properties and blog), `robots.txt`, `llms.txt`, Open Graph `og:locale` and alternates, JSON-LD: all updated and consistent. The language switcher lists five languages with proper names ("English", "Deutsch", "Français", "Nederlands", "Magyar"), keeps the `fodel_lang` cookie behaviour and works from every template (it already handles en/de/fr).
5. The root page (`src/pages/index.astro`) keeps preferring the `fodel_lang` cookie, then `navigator.languages` (now matching en, de, fr properly, including `en-GB`, `de-AT`, `fr-BE`), then `nl`.
6. Keep the production client-JS budgets in `scripts/verify-ssg.mjs` green. Do not ship all languages' strings to every page: only the page's own locale.

## Phase 2: UI strings and shared components

Translate all of `src/i18n/ui.ts` (nav, CTAs, property labels, filters, form labels, validation messages, footer, accessibility labels), the validation messages in `src/lib/validation.ts` (`errorMessage`, `summaryHeading`, country adjectives and phone/postcode examples), `src/components/forms/{FormShell,PhoneField,RegisterForm}.astro` strings, `CookieConsent.astro`, `NewsletterForm.astro`, `Nav.astro`, `Footer.astro`, `PackageCard.astro`, `PropertyCard.astro`, `Map.astro`, `HomeSearch.astro`, `FaqAccordion.astro`, `PhotoTips`, `404.astro` and every other inline `hu ? … : …` or `{ hu: …, nl: … }` string in `src/components` and `src/layouts`. Replace the `hu ? 'a' : 'b'` ternary pattern with a proper per-locale lookup so a third, fourth and fifth language cannot silently fall through to Dutch. Find them all with a repository-wide search (`locale === 'hu'`, `hu ?`, `'nl'`, `Record<Locale`).

## Phase 3: Page content

Translate with the same page structure and section order as hu/nl:

- `src/data/copy.ts`, `pages-content.ts`, `faq.ts`, `features.ts`, `photo-tips.ts`, `valuation-questions.ts`, `wall-materials.ts`, `invite-letter.ts` (the invite letter stays an owner-approved Hungarian text; translate only what is visitor-facing).
- Every page component in `src/components/pages/*.astro`: home, sellers, buyers, about, contact, services, agricultural property, photo guide, buying in Hungary, moving from NL, FAQ, price list, submit ad / register, search request, valuation, top 10, sold archive, map browse, properties list, property detail, blog index and post, thank-you pages.
- Page titles, meta descriptions, Open Graph/Twitter text, JSON-LD (`src/lib/seo.ts`), breadcrumbs, alt texts and `aria-label`s.
- **Property and blog content that sellers or admins write** lives in Supabase (`property_translations`, blog tables) in hu and nl only. Do **not** machine-translate seller text at request time. For en/de/fr the page shows: all UI and structured facts (type, county, settlement, price, areas, year, features, condition, heating, energy label, all in the visitor's language via the taxonomy labels), the title and description from the Dutch translation, and a small clearly styled note "Description in Dutch" / "Beschreibung auf Niederländisch" / "Description en néerlandais". If the Dutch text is missing, fall back to Hungarian with the same note. Taxonomy terms (`getTaxonomy`, `termLabel`) get en/de/fr labels, added through the idempotent migration `0020_translations.sql` if they are stored in the database, and through the checked-in fallback otherwise.
- **Blog**: the two existing articles' static pages in `src/pages/{en,de}/blog` are replaced by the real blog mechanism in all five languages; articles that exist only in hu/nl fall back to the Dutch text with the same note rather than being hidden.

## Phase 4: Legal pages

Translate `src/data/pages-legal.ts` (imprint, privacy, cookies, terms, accessibility) faithfully, **never changing meaning**. Do not invent clauses. Add one line at the top of each translated legal page, decided by the owner, as a TODO placeholder in the handover: whether the Hungarian/Dutch version prevails ("courtesy translation"). Until the owner decides, use this neutral sentence, and list it in the handover as needing client and lawyer sign-off: EN "This is a translation for convenience. In case of differences, the Dutch (for Dutch law matters) or Hungarian original prevails.", with the equivalent in de and fr. Flag every sentence that depends on Dutch or Hungarian law terms for lawyer review.

## Phase 5: Emails

Add en, de and fr to `src/lib/email/copy/*.ts`, `src/lib/email/templates.ts`, `lifecycle.ts`, `src/lib/form-handler.ts` acknowledgements, newsletter confirmation and the invoicing emails (`src/lib/invoicing/emails.ts`). The email layer already renders a shell in en/de for the invite; make all templates work in all five languages. The recipient's language follows (in order): the seller's `profiles.locale`, the form's `locale` field, then the page they came from. `profiles.locale` and the forms' `locale` field must accept `en|de|fr` (check CHECK constraints in `supabase/migrations`; relax them in `0020_translations.sql`). Admin notification emails to the office stay Hungarian. Verify every template in all five languages through `/dev/emails?t=<name>&locale=<l>` (add the locales there), including plain-text parts and that every link points at `https://fodel.eu`. Extend `tests/e2e/public/emails.spec.ts` to loop over five locales.

## Phase 6: Forms, validation, portal entry points

- Registration, contact, callback, enquiry, search request, valuation and newsletter forms: labels, hints, errors, success panels, ACK texts and the phone field (country names via `Intl.DisplayNames` in the page language, default phone country by language: en → GB, de → DE, fr → FR) in all five languages. Server-side error codes map to the visitor's language.
- `/portal/login`, `/portal/register`, `/portal/forgot`, `/portal/reset`, `/portal/invite/[token]` (`src/lib/portal/auth-copy.ts`): add en, de and fr. The seller's wizard and the rest of the owner portal stay hu/nl; if a seller's `profiles.locale` is `en|de|fr`, show the portal in **English** for en and fall back to Dutch for de and fr, and say so in the handover. (A full translated seller portal is out of scope.)

## Phase 7: Tests (Playwright, all in the clone, never against the live database)

Extend `tests/e2e/public/*` so that every locale is covered:

- every page returns 200 with no console errors and no horizontal overflow at the eight widths, in all five languages;
- language switching between all five languages from every template and back, via pointer and keyboard (WebKit and mobile Safari included), cookie remembered by the root page;
- hreflang set complete and reciprocal on every page; sitemap contains all five languages;
- form validation messages in each language (including the phone country messages);
- no untranslated leftovers: a test that loads every page in en, de and fr and fails if it finds Hungarian-only accented characters typical of hu (`ő`, `ű` outside of proper nouns and place names) in UI text, or the known Hungarian/Dutch UI words ("Hirdetés", "Kapcsolat", "Adverteren", "Contact" where the language is not nl, and so on) from a short list you build from the glossary;
- email templates in five languages (see Phase 5).

Also run `npm run check`, `build`, `test:rules`, `verify:ssg`, `verify:contrast` and the full Playwright suite (chromium, webkit, mobile-safari, mobile-chrome) in the clone and report the counts. Take screenshots of home, submit, property detail and price list in **de and fr** (the longest languages) at 320, 390, 1024 and 1440 px, look at them yourself and fix any wrapping or overflow.

## Quality pass (before you call it done)

Read every translated page end to end, once, as a native reader of that language would, and fix: literal translations, wrong register, wrong gender or case (German articles and cases, French agreement and elision), mixed terminology, untranslated fragments, inconsistent capitalisation, wrong quotation marks, missing no-break spaces in French, "Hungary/Hongarije" naming, and any place where a number, price or promise differs from hu/nl.

## Deliverables

1. The code and content above, all five languages complete.
2. `src/i18n/GLOSSARY.md`.
3. `supabase/migrations/0020_translations.sql` if (and only if) any SQL is needed, idempotent, mentioned in the handover.
4. `Fodel-forditasok-atadas.md`, **in Hungarian**, short and practical, in the repo root next to the other handover files: what was translated, how the language fallback for seller content works, URL slugs per language (table), the legal-page sign-off TODOs, anything needing the client's decision, the migration (if any) the owner must run by hand, how to run the new tests, and a list of the 15 most visible strings per language with the choice of wording explained for the owner.
5. A short final message: what is done, what you verified, what the owner has to do, and an offer to commit and push.
