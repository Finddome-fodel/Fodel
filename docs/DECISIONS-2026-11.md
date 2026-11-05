# Decisions for the November 2026 release

Written during the release build. Marci did not answer the Q1–Q17 message before work started, so every default of
`claude-code-master.md` §2 applies until he says otherwise. Where the code or a test disagreed with the brief,
the code won and the reason is written here.

## Questions Q1–Q17 (defaults in force)

| # | Decision | Status |
|---|---|---|
| Q1 | Tier bands: `< 25 000 000`, `25 000 000 – 100 000 000` (both ends in the middle band), `> 100 000 000` Ft. Stored as inclusive upper bounds 24 999 999 and 100 000 000. | default |
| Q2 | The listing's `price_huf` decides the tier; frozen into the order line (`tier`, plus `price_tier_*` on the listing). A draft without a price shows "from" prices and cannot be checked out. | default |
| Q3 | Basic = HU + EN + DE; Europe = every site language except `uk tr he ar zh ru` (so `sr` is in; **Ukrainian moved to World on 2026-11-05 at Marci's request**, see the end of this file); World = all 28. The owner's language is always included. | default |
| Q4 | The three packages differ in languages and price only (20 images, phone per consent, no FINDDOME editing). Editable per package. | default |
| Q5 | Single languages are no longer sold. Code stays behind an admin switch (`singleLanguages.enabled`, off). | default (supersedes 3 Nov decision, Gábor 4 Nov) |
| Q6 | Upgrade charges the difference inside the **original** snapshot tier and duration; expiry unchanged. | default |
| Q7 | Free listings stay: free, Basic languages, current duration rule. Admins can grant any package free. | default |
| Q8 | `renewal-6m` retired for new sales. Renewal = 1/3/6 months of the listing's package at today's price in its current tier, starting at the old expiry (or now if expired). | default |
| Q9 | `cheap-6m` / `normal-12m` live on for old listings and unpaid pro-formas (14 days). New orders: Basic/Europe/World only. | default |
| Q10 | Kategória kiemelés only with 3- or 6-month packages and at most the package duration; hidden with a one-line reason on 1 month. | default |
| Q11 | The table prices are gross (VAT included). | default |
| Q12 | HUF hint „kb. 3 400 Ft”, rounded to the nearest 100 Ft, footnote with the ECB rate and date. Never a payable amount. | default |
| Q13 | Agricultural remap by keyword („üzem”, „telep”, „gazdaság” → Mezőgazdasági üzem; „major” → Majorság; else Birtok); every moved listing flagged „Típus ellenőrzése”. | default |
| Q14 | „Teljes épületterület” hint as Gábor wrote it; the two area fields are not cross-validated. **Still to ask Gábor**: does it include the house? | open (Gábor) |
| Q15 | Living area required for every type with a home, optional on Mezőgazdasági üzem / Állattartó telep / Halastó / Egyéb mezőgazdasági, hidden on land-only; commercial/industrial buildings get a required „Nettó hasznos alapterület”. | default |
| Q16 | A language the owner wrote is published only if the package covers it; otherwise kept and shown as „nincs benne a csomagban”. | default |
| Q17 | The spec (Google Doc) is private and was not available to the build. Its remaining ❓ items use the brief's own recommendations. **Marci: please drop the export into `docs/spec-2026-11.md` so the audit can be checked against it.** | default |

## Deviations and judgement calls

- **Node.** The brief says Node 22; this machine runs v26.12.1 (strip-types), and the whole suite was green on it. Not changed without asking.
- **`claude-code-fixes.md`** arrived after the first look (repo root, untracked); its §1.1 conflict guide was used for the chain rebase. Its translation-price fixes (3.1, 3.2, 3.4) are implemented in the terms of the new model (master §4.2 step 6).
- **Rebase.** The chain was replayed onto the release branch from a local copy (`tmp/chain`); no remote PR branch was touched. Two replayed commits did not pass `astro check` on their own (an e-mail copy gap that #34 left for #31's languages, fixed by F2, and two typing slips fixed in the merge); the merge tip and every later commit are green.
- **`test-migrations-sequence.mjs`** cannot apply the real 0001 → 0058 chain in PGlite (it needs Supabase's auth/vault/pg_cron). It checks numbering, enum-alone, RLS + grants, idempotent form, and that every November file is replayed twice by the PGlite harness.
- **Migration numbers.** `0050_locales_7`, `0051_locales_7_newsletter`, `0052_translation_status`, `0053_translation_packages`, `0054_photo_moderation`; new: 0055 `listing_package_values`, 0056 `pricing_2026`, 0057 `agricultural_types`, 0058 `property_media_listing_closed`.
- **0058 is not the floor-area report.** The brief's optional 0058 (a report of listings whose floor-area data is now inconsistent) was skipped; the number went to the photo-bucket fix (F5), which matters more.
- **Languages stay in `translationPackages`**, not in `listingPricing`: one source of truth for what each package covers. Package names are the same brand words in all 28 languages (hu/en editable).
- **Legacy packages** (`cheap-6m`, `normal-12m`) stay in the catalog flagged `legacy`; listings on them renew as Basic.
- **`pricingLive` is a flag** written by migration 0056 (which refuses to run unless 0055's enum values exist), not detected by probing. Before it, the app sells the two older packages and refuses new ids, so a deploy before the migrations is safe.
- **Renewal** offers 1/3/6 months as radios on `/listing/[action]`.
- **`extrasPatch`** never persists the derived translation price; fee display uses `eurPrice` (two decimals).
- **Rate:** informational only, never stored as a price; a stored day is stale after 4 days; Frankfurter is the fallback only when the ECB fails; public pages show EUR always and a small script fills the forint hint from `/api/fx` (no daily rebuild).
- **Chooser prices** are server-rendered for every term and shown with CSS `:has()`, so the chooser works with JS off.
- **Entitlement** is claimed once per order through `activity_events` (`translation.entitlement_applied`); only code `23505` means "already applied". The switched-off languages are frozen on the order line (`excludedLocales`), also on the legacy package line.
- **Basic includes Hungarian** (Q3). **Written languages do not publish by themselves** (Q16). `legacySubtypeRedirect` lives in `src/middleware.ts`.
- **`test-migrations-sequence.mjs`** checks the harness replays, not the real 0001 → 0058 chain (see above).
- **Glossaries and the spec** were never provided, so the 7 new-language labels (and the share-button words in all 28 languages) are marked "needs a native-speaker check".
- **Share buttons.** The row sits under the figures in the main column (not in the dark, sticky enquiry panel): it stays secondary to the contact form and next to the price it belongs to; on a phone it is the one „Megosztás” button (or icons). It is never offered on a stand-in page; draft and admin previews are not rendered by this component at all (the route serves published listings only). The shared address is the page's own address with a trailing slash, as the site links it. `og:locale:alternate` equals the hreflang set. The e-mail button's short word is a separate table (`EMAIL_LABEL`).
- **F5 scope.** Closing the bucket's list endpoint (0058) is shipped and tested; a fully private pending photo (private bucket, signed addresses, a move on approval) is not, because it could not be tested against real Storage from here. See the residual risk in the PR.
- **Added a dev dependency** `@axe-core/playwright` for the accessibility scan in the share spec, and a one-listing stand-in (`tests/e2e/support/public-listing-database.mjs`, `npm run test:e2e:listing`).
- **Firefox** could not be launched in this environment (browser binary); chromium, webkit and the two phone profiles were run.

## Changes after the release (2026-11-05, requested by Marci)

- **Ukrainian is a World language** everywhere: the language switcher's "Világ" group, the Európa rule (`excludeFromAll`), the World-only list (`worldOnly` in `src/config/company.ts`, `WORLD_ONLY_LOCALES` in `translate-core.ts`), the single-language price group (€5 instead of €1), and the package texts (Basic and World pitches name Ukrainian; "the five" became "the six"). Effects, all derived from the rule, nothing stored: the World-only singles add up to six × €5 = €30 (Európa + all six = €42; World stays €25, so the deal still holds); Európa covers 21 translation targets (it was 22). **Consequence to know:** a listing on Európa that already had a Ukrainian text no longer publishes it (its page 301s to English, as for the other World languages); the text is kept and comes back when the listing is upgraded to World. A package text an admin saved by hand in Csomagok → Fordítások keeps its own wording until it is edited. `test-rules.mjs` has a test that keeps the five places in step.
- **Autosave in the listing forms.** A draft (or a listing sent back for corrections) now saves itself in the full editor and in the guided setup: 1.5 s after typing stops, at once when a field is left, when the tab is hidden or closed, and again by itself (after 2 s, 5 s, 15 s, 30 s, then every 30 s) while the connection is down. Every change is first copied to the browser's own storage, and the copy is removed only when the server has confirmed exactly those values; on the next visit a copy that never reached the server is restored (or, if the listing changed elsewhere meanwhile, the person is asked). A listing that is live, waiting for review or for payment is **never** saved in the background (the server answers 409 to an autosave request); it keeps the Save button. The status line (`AutosaveStatus.astro`) is calm: a green check and "Minden módosítás mentve · Utoljára mentve: 14:32", a quiet ring while saving, amber (never red) and "Nincs kapcsolat. A módosításai ebben a böngészőben biztonságban vannak…" when offline, with an "Újra" button. Code: `src/lib/portal/autosave.ts` (the rules, no DOM), `autosave-client.ts` (browser), `autosave-rules.ts` (which statuses), `update.ts` (`autosave=yes`: a JSON answer, tolerant of an unfinished form). Not covered: the free upload-link page (three contact fields, saved on submit), the public registration form, and the photo uploader (each photo is saved as it is uploaded).
- **Long titles in the photograph.** The title was set at up to 88 px in a 14-character column, so a sentence-long title climbed out of the picture over the breadcrumb. It is now sized by length (`src/lib/title-fit.ts`, four tiers), at most three lines, and the breadcrumb is one line with an ellipsis; the full title is the heading under the picture. Screenshots: `docs/qa/2026-11/hero-before-*.png`, `hero-after-*.png`.
