# FODEL: handoff for the "old upload form parity" round

> Paste everything below into a new, empty Claude Code chat opened in the FODEL project folder.
> It is written so you can start work at once, without re-discovering the codebase.

---

## 0. Your mission, in one paragraph

You are continuing work on **FODEL**, a Hungarian-property marketplace for Western-European buyers (Astro 5 SSR on Vercel, Supabase, Stripe, Resend, nine languages). The client (Éva and Gábor) sent the **old upload form** and said: *"We shaped those fields very carefully, so it is important that they all make it into the new upload interface."* A previous session audited the new system against the old form, got the owner's decisions, and **built most of the missing fields on the unmerged branch `feat/listing-details`** (pushed to GitHub, no PR yet). Your job: **verify, finish, polish and ship that branch** to a standard that is both a design masterclass and precise, careful engineering. Premium, rounded, calm, accessible, correct in Hungarian and Dutch first (the client's languages), then English.

You work for **Marton Orosz** (the owner of the project; they/them if you must refer to them). They are not a developer by trade: explain things in plain, human language, name exactly what to click or paste, and keep final reports short. Before you hand over anything meant for someone else (the client, a doc), start the message with one line naming the audience.

---

## 1. Read these first (two minutes)

1. Your auto-memory index (`MEMORY.md`, loaded automatically in this project) and the files it links. The ones that matter here:
   - `fodel-design-taste` — wants a rounded premium look; **no** split-colour, outlined or italic text effects; the marquee never pauses; **verify HU and NL at many widths**.
   - `fodel-2-0-system` — slabs, radius scale, pill buttons with ArrowChip, upright quiet-ink heading emphasis.
   - `fodel-admin-3-0` — ink sidebar, `pf` dialogs, admin skin layer.
   - `onedrive-vite-stale-css` — Vite on OneDrive misses edits (styles *and* scripts); verify the served module with a unique string.
   - `fodel-audit-before-building` — skip only features that truly exist and work; finish partial ones; **never read `.env`**.
   - `fodel-quote-completion` — build in a scratchpad clone, because OneDrive `node_modules` times out.
2. This file, top to bottom.

---

## 2. Environment, and the traps in it (important)

- **The local project folder is stale and its git is broken.**
  `/Users/marton/Library/CloudStorage/OneDrive-Personal/Fodel` has a `.git` whose files hang on OneDrive ("Operation timed out"), so `git status` says "not a git repository". It also lacks everything merged this week. **Do not work there.** Marton copies migration files from it in VS Code, so a copy of the new migration was placed at `supabase/migrations/0023_es_pl_ro_sk.sql` there; that is all it has.
- **Work in a fresh clone outside OneDrive**, inside your scratchpad directory:
  `gh repo clone omarci16/Fodel fodel && cd fodel && git checkout feat/listing-details && npm ci`
  (`gh` is logged in as `omarci16`. The repo is `omarci16/Fodel`; **main is production on Vercel**.)
- The previous session's working copy was at
  `/private/tmp/claude-501/-Users-marton-Library-CloudStorage-OneDrive-Personal-Fodel/5cd98c7d-a525-4c7f-a4c8-40d42e51fa20/scratchpad/fodel`. It may or may not still exist; the branch on GitHub is the source of truth.
- macOS/zsh gotchas that cost time: no `timeout` command; unquoted globs fail with "no matches found" (quote them: `--include='*.astro'`); a bare `sleep` in Bash is blocked (use Monitor or just re-check); a shell variable holding several file names does not split in zsh (use `xargs`).
- Commits end with: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. PR bodies end with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- **Never read `.env`.** Never paste secrets. You have no Supabase credentials: Marton runs SQL by hand in the Supabase SQL Editor, so every schema change is a numbered migration file plus plain instructions.
- Checks that exist: `npx astro check` (about 1-2 min, must be 0 errors), `npm run build`, `npm run test:rules` (75 checks), `npm run check:i18n`, `npm run verify:ssg -- --allow-missing-kvk` (**one failure is pre-existing on main**: the non-map JS budget, about 1168 kB against 100 kB; ignore it), `node scripts/test-listing-input.mjs` (the server input unit tests, runs through Vite with no network), Playwright under `tests/e2e/**` (`npm run` scripts in `package.json`).

---

## 3. What happened so far (state of the world on 2026-10-26)

| Item | State |
|---|---|
| **PR #1** Spanish, Polish, Romanian, Slovak (whole site) | **Merged to `main`**, deployed. Migration `0023_es_pl_ro_sk.sql` **was run by Marton** in Supabase. |
| **PR #2** domain moved to **finddome.com** | **Merged to `main`**, deployed. `SITE_URL` in `src/config/site.mjs` is `https://finddome.com`; company e-mail defaults `info@finddome.com`; Resend sender fallbacks `website@` / `portal@finddome.com`. Migration `0024_domain_finddome_com.sql` (moves `site_settings.emails.primary`) **was given to Marton to run; confirmation not received**: ask. |
| Live site | Production is reachable at **https://fodel.vercel.app** (all nine languages verified 200). `fodel.eu` and `fodel.nl` still resolve to an **old Apache site** (185.51.191.194); **finddome.com is not yet attached in Vercel / DNS**. That is Marton's to do. |
| Branch **`feat/listing-details`** | **Unmerged, no PR yet.** Contains the work described in sections 6 and 7. |
| Migration **`0025_listing_details.sql`** | Written, **not yet run** anywhere. Must be run in Supabase **before** this branch is deployed. |

Open ops items for Marton (not yours, but remind them): mailbox `info@finddome.com`, Resend domain verification (SPF/DKIM/DMARC), Vercel domain, Stripe webhook URL `https://finddome.com/api/stripe/webhook`, Supabase Auth Site URL and redirect URLs, Search Console sitemap. Whether migration **0022** is applied: `0023` says it must be, and Marton ran 0023, so assume yes.

---

## 4. The request, and the owner's decisions

The client's mail (Hungarian): *"Átküldöm a régi Fodel-feltöltő linkjét. Az ottani adatmezőket nagyon gondosan alakítottuk ki, ezért fontos, hogy ezek hiánytalanul bekerüljenek az új feltöltőfelületbe is."*

**Decisions from Marton (final):**
- **No coupon codes.** Do not add them.
- **Payments stay exactly as in the current site** (Stripe / card or transfer *after* approval, no prepayment). Do **not** port the old form's "Előre utalás" radio, the "129 € … Díjbekérő ellenében 5 munkanapon belül" paragraph, or the "payment obligation" tick.
- **Everything else that is missing: add it, beautifully, carefully, efficiently.**

### The old form, field by field (from the screenshots)

**1. A megrendelő adatai** — Megrendelő / kapcsolattartó neve*, kapcsolattartó telefonja*, e-mail*, kapcsolattartó által beszélt idegen nyelv(ek) (i), checkbox "kapcsolati adatai feltüntetésre kerüljenek a hirdetésben?" (i), számlázási név*, számlázási cím*, közösségi adószám (ha van) (i), **kupon kód** (dropped), fizetési mód: előre utalás (dropped).
**2. Árszámítás** — a hirdetésben megjelenítendő ár (Ft)* (i), fordítások (Holland / Angol / Német / Francia 25 EUR each, Magyar 0), kiemelési lehetőségek (select), videó (36 EUR), live total.
**3. Az ingatlan adatai** — megye*, irányítószám, település*, **az ingatlan címe*** (placeholder "Pl. Kossuth u. 12."), **checkbox "az ingatlan címe feltüntetésre kerüljön a hirdetésben?"** (i), **elhelyezkedés*** radio (Városban / Faluban / Nyaralóövezetben / Vízparton / Erdőben / Lakott területen kívül, ill. egyéb helyen), az ingatlan jellege* (select), az építés éve* (i), telek mérete (m²)* (i), nettó alapterület összesen (m²)* (i), **pince alapterülete összesen, ha van (m²)** (i), **az ingatlan szintjeinek száma***, **szobák + félszobák száma összesen*** (i), hálószobák száma*, fürdőszobák száma*, **konyhák száma***, **különálló WC-k száma***, checkboxes: **víz / csatorna / gáz / villany bekötve? internet / vezetékes telefon előfizethető?** (i on the last two), **parkolási lehetőség** checkboxes (Garázsban / Kerti épületben / Kertben / A ház körül), **kiegészítő építmények a telek területén** (i, free text), a hirdetés szövege (max. 100 szó)* (i), **egyéb megjegyzés** (do not put the ad text here; non-public notes that help with foreign enquiries), **honnan értesült weboldalunkról, hirdetési szolgáltatásunkról?** (select), "Tudomásul veszem, hogy a megrendelésem fizetési kötelezettséggel jár"* (dropped), "ÁSZF és Adatvédelmi tájékoztató elfogadása"* with PDF links.

### Audit result (new system, before this branch) — what already existed

Name/phone/e-mail (registration), contact languages (`ContactLanguages`), show-contact yes/no (package-gated), billing name/address/VAT (`BillingForm`: name, country, postcode, city, street, phone, tax number; EU reverse-charge logic), price + currency with automatic EUR, translations (now nine languages) / highlights / video / live total, property type (9 groups with subtypes), country/county/settlement with map pin and exact-or-approximate public location, year built (+ unknown), plot, living area, building area, bedrooms, bathrooms, heating, wall, condition, energy rating, features (74), title / short description / long description / private internal note.

**Missing, and now built on the branch:** street + postcode + "show the address", the setting (Városban…), cellar m², floors, rooms + half rooms, kitchens, separate toilets, utilities (six), parking (four), extra buildings (free text), "how did you hear about us", and the old form's *required-ness* for a home.

**Not carried, on purpose / still open:** coupon (decided), old payment wording (decided), the **100-word cap** on the ad text (new allows 6000 characters; ask the client), the **(i) help tooltips** (new form uses inline hints instead), and the exact **options of the old "honnan értesült" dropdown** (not visible in the screenshots; the list on the branch is a guess, ask the client for theirs). The ÁSZF / Adatvédelmi consent: registration has a `consent` checkbox in `src/components/forms/FormShell.astro` (line ~128); **verify it links the terms and privacy documents with wording equal to the old one**. Not yet checked.

---

## 5. How the system fits together (read this and skip the dig)

**Register-first flow.** `/hirdetes-feladasa/` (and the other eight native slugs) is `src/components/pages/SubmitAdPage.astro`: information plus `RegisterForm.astro` (name, e-mail, phone only; deliberately "three details"). It posts to `/api/listing-order`; the person gets an e-mail link, sets a password, and lands in the portal's **guided setup** `src/pages/portal/properties/[id]/setup.astro` with six steps: Package → The property → Description and contact → Photos → Billing → Review/submit. Admins and owners can also use the **full editor** `src/pages/portal/properties/[id].astro`. The portal is **hu / nl / en only** (labels via a local `x(hu, nl, en)` helper, type `PortalLang`); the **public site is nine languages** (`x(hu, nl, en, de, fr, es, pl, ro, sk)`).

**One component renders the property fields in both the wizard and the editor:** `src/components/portal/ListingFields.astro` (sections 01 type, 02 location, 03 price and details, 04 features). Its client behaviour is `src/scripts/listing-fields.ts` (map/geocoding, price conversion, area units, and the **`data-relevance` show/hide system**: `living`, `plot`, `building` (default, = not land-only), and on the branch `utilities`).

**Save path (everything goes through here):**
`FormData` → `listingInput()` in `src/lib/portal/listing-input.ts` → returns `{ patch, privateData }` → `supabase.rpc('save_listing_editor', { p_id, p_patch, p_private, p_translations })` (SQL function, **SECURITY INVOKER**, so RLS applies; it has a **hard-coded column allow-list and a hard-coded UPDATE list**, which is why new columns need a migration that re-creates the function). Callers: `src/lib/portal/setup.ts` (`saveProperty`, `saveDescription`, one wizard step at a time, autosave with `partial=yes`) and `src/pages/api/portal/properties/[id]/update.ts` (full editor). Private data lives in table **`property_private`** (owner + admins only, RLS): `lat`, `lng`, `internal_note` (+ new `street`, `postal_code`, `heard_from`). Exact coordinates are private; the public `properties.lat/lng` are an offset point unless `precision='exact'`.

**Read paths.** Portal: `getProperty()` in `src/lib/portal/properties.ts` merges `properties.*` + `property_private` into `PortalProperty`. Public: `src/lib/properties.ts` (`mapRow` turns a row into `Property`; it reads `select('*')`, so new columns arrive automatically) → `PropertyDetailPage.astro` (the `specs` array of big-number cards, `features` chips, JSON-LD in `src/lib/seo.ts`), `PropertyCard.astro`.

**Submit gate.** `src/pages/api/portal/properties/[id]/status.ts`, action `submit`: needs at least one photo and `country`, `location_confirmed`, a valid subtype, `original_price > 0`, a titled+described translation. The wizard's review step also has a client-side `missing()` list (in the `<script>` of `setup.astro`) with copy from `src/lib/portal/setup-copy.ts`. I saw **no server-side billing check** in that gate (the wizard only checks `billingName()` client-side); confirm, and do not change it without asking.

**Catalogue helpers** `src/lib/listing-catalogue.ts`: `PROPERTY_GROUPS` (9 groups, `groups.json`), `hasLivingArea`, `isLandOnly`, `hasPlot`, `groupOf`, `subtypeOf`, `FEATURE_DEFINITIONS`, `canonicalFeature`. **Existing "access" features** (`electricity`, `water`, `sewer`, `gas-supply`, `telecom`) apply only to groups `land` and `other`, which is why the new utilities block is hidden for those two.

**Admin.** The review screen `src/pages/portal/review/[id].astro` (Hungarian only) shows facts, checklist, approval. Approval and publishing: `src/lib/portal/publish.ts`. Orders and invoices use catalogue prices (`src/lib/orders.ts`, `src/lib/listing-packages.ts`), untouched here.

**i18n conventions.** Every public string is typed per locale; `npm run check:i18n` compares **French keys** against es/pl/ro/sk for `src/data/*` TS modules. Formal register everywhere (Ön / u / Sie / usted / Państwo / dumneavoastră / vykanie). Glossary: `src/i18n/GLOSSARY.md`. Romanian comma-below ș/ț. Slovak, Polish and Romanian have distinct plural forms (`src/i18n/plural.ts`).

---

## 6. What is built on `feat/listing-details` (design decisions included)

**New files**
- `src/data/listing/details.json` — settings (6), utilities (6), parking (4) and field labels, **each in all nine languages**. Setting keys: `city, village, holiday-area, waterfront, forest, outside-built-up`. Utilities: `water, sewage, gas, electricity, internet, landline`. Parking: `garage, garden-building, garden, around-house`.
- `src/lib/listing-details.ts` — `ListingDetails` type, `readDetails()` (defensive), label helpers, relevance predicates (`hasUtilities`, `hasParking`, `hasCellar`, `hasExtraBuildings`, `hasLayout`), `detailGaps()` (the submit gate), `HEARD_FROM` (7 options, hu/nl/en, **a guess**).
- `supabase/migrations/0025_listing_details.sql` — see below.

**Data model.** One jsonb column **`properties.details`** = `{ rooms, half_rooms, floors, kitchens, toilets, cellar_m2, setting, utilities[], parking[], extra_buildings }` (a new fact never needs a new column). **Address privacy by construction:** street and postcode are stored privately (`property_private.street`, `.postal_code`); only when the owner ticks "show the address in the ad" are they copied to `properties.public_address` / `public_postal_code` (null otherwise, so nothing is public by accident). The tick state is derived as `Boolean(public_address)`. **A public address forces `precision='exact'`** (server-side in `listingInput`; the client script also flips the select) so the page never prints one place and maps another. JSON-LD gets `streetAddress`/`postalCode` only when public. `property_private.heard_from` stores the private marketing answer.

**Migration 0025** (one transaction, idempotent): adds the three `properties` columns with check constraints, the three `property_private` columns with a length check, and **re-creates `save_listing_editor`** with the identical 0022 body plus the new columns in the allow-list, the private upsert (`street`, `postal_code`, `heard_from`, each updated only when the key is present in `p_private`) and the UPDATE list. Run order for Marton: **0024 (if not yet) → 0025 → deploy**.

**Form behaviour (`listingInput`)**
- A hidden `details_present=yes` marker is rendered inside the details section; **without it every details value is left exactly as saved** (protects older clients and partial forms). Address fields behave the same way via `form.has('street')`.
- Each property type only touches what applies to it; the rest keeps its saved value, so switching type never wipes data. Counts: integer 0–1000; cellar via `parseArea`; unknown setting or malformed count is a field error; blank clears.
- `heard_from` is validated against `HEARD_FROM_KEYS`, saved via `p_private` in `setup.ts:saveDescription` and `update.ts`.

**UI (`ListingFields.astro`, all in hu/nl/en with real Dutch and Hungarian copy)**
- Location section: a street + postcode (`type="postcode" countryField="country"`) grid, the "show the address" checkbox, a quiet explanatory note.
- Details section: `setting` select, then (living types) rooms, half rooms, floors, bedrooms, bathrooms, kitchens, toilets; cellar m² (building types); heating etc. as before; below the grid, **utilities** and **parking** as the existing `.lf-feature` chip checkboxes, and **extra buildings** as a textarea (relevance `plot`).
- `Field.astro` got a **`softRequired`** prop: shows "(kötelező)/(verplicht)" in the label **without** the HTML `required` attribute (the editor saves part-filled drafts and the full editor form has no `novalidate`, so native `required` on conditionally hidden fields would block saving). Used on rooms, floors, kitchens, toilets, bedrooms, bathrooms, living area. Street and setting say "Lakóingatlannál kötelező." in a hint instead, because they exist for all types.
- Setup step 3 and the full editor each got an optional "Honnan értesült a FODEL-ről?" select next to the private note.

**Required-ness for homes only** (`detailGaps`): for living-area types, a submit needs street, setting, living area, floors, rooms, kitchens, toilets, bedrooms, bathrooms (0 bedrooms is valid for a studio; an empty box is a gap). Enforced **twice**: client-side in the wizard's `missing()` (one combined bullet: "az ingatlan adatai: a cím, a környezet, …"; `setup-copy.ts` has `missing.details` and `missing.fields` in hu/nl/en) and server-side in `status.ts` (`422 incomplete-details` with `fields`; skipped for admins; skipped if the columns do not exist yet). Land and other non-home types are held to nothing extra.

**Public page** (`PropertyDetailPage.astro`): the counts become spec cards (rooms, half rooms, floors, kitchens, toilets, cellar area); a new "Részletek / Details" section under the features lists setting, address (only if public), extra buildings, then utilities and parking as chips; CSS `.fact-list`/`.fact-head` added beside `.features`. `src/lib/properties.ts` maps `details` (filtered by relevance, so a stale value from a previous type never shows) and `address`.

**Admin review** (`portal/review/[id].astro`): rows for address (marked "megjelenik a hirdetésben" or "nem nyilvános"), setting, rooms/floors/bedrooms/bathrooms, cellar, utilities, parking, extra buildings, how-heard.

**Verification done:** `npx astro check` → 0 errors. `node scripts/test-listing-input.mjs` → **20 passed** (10 existing + 10 new: save, privacy, exact pinning, land keeps values, missing marker leaves data, rejections, the gate, defensive read, nine-language labels).

---

## 7. What is NOT done yet — your task list, in order

1. **Run the remaining checks and fix anything they show:** `npm run build`; `npm run test:rules` (75); `npm run check:i18n`; `npm run verify:ssg -- --allow-missing-kvk` (only the pre-existing JS-budget failure is acceptable); the Playwright specs that touch listings (`tests/e2e/editor/listing.spec.ts`, `tests/e2e/editor/public-integration.spec.ts`, `tests/e2e/support/listing-database.mjs` — **that support file mirrors the schema/RPC for the tests and almost certainly needs the new columns and the new RPC behaviour**; also `scripts/seed-demo.mjs` / `seed-500.mjs` could carry sample `details`). Add e2e coverage for: filling the new fields in the wizard, the submit-gate message for a home, address privacy (private vs public), land hiding the home fields.
2. **Look at it with your eyes** (nothing visual was verified; the portal needs a signed-in session and Supabase). Find a safe way to render the editor and a public detail page (a local dev server with the project's own test setup, or a Playwright run against the mocked DB). Check at **320, 360, 390, 768, 1024, 1440 px**, in **Hungarian and Dutch (long words!) and English**, mobile keyboards (numeric fields), focus order, focus rings, error states, `prefers-reduced-motion`, dark-on-light contrast. Specific things to inspect: the new address block's rhythm against the map section; whether the 2-column grid with `softRequired` labels wraps cleanly in Dutch ("(verplicht)"); the utilities/parking chip grids on mobile; the public "Részletek" section's `fact-list` on mobile; that hidden relevance wrappers collapse without leaving gaps; the review step's missing-list bullet reads naturally and its link scrolls to the right step.
3. **UX polish worth doing:** when the review step says details are missing, clicking the bullet should land on the **first empty field** (and ideally flash a quiet ring), not just the step; consider inline field errors for the soft-required fields on "Continue"; make sure the autosave (`partial=yes`) never complains about soft-required fields; check the `lf-note` copy is warm and short.
4. **Decide with Marton / the client (collect, do not guess):** the real "honnan értesült" option list; whether to keep the ad-text length soft (6000 chars) or add a word counter/limit like the old 100 words; the exact ÁSZF / Adatvédelmi wording and links at registration; whether `rooms` should instead be "rooms + half rooms" as one number like the old form (currently two fields, a deliberate superset); whether `PropertyCard` should show rooms.
5. **Hand over to the client:** a short Hungarian handover note in the style of the other `Fodel-*-atadas.md` files (what the new upload form now asks, what is private vs public, what was deliberately not carried and why). Audience: Éva and Gábor, plain language.
6. **Open the PR** `feat/listing-details` → `main`, body in the style of PR #1/#2 (what changed, what is not changed, checks, "run 0025 by hand before deploying"). **Do not merge until Marton says so**, and remind them of the run order (0024 → 0025 → deploy). After merge: verify on https://fodel.vercel.app.

---

## 8. Quality bar (how to do this work)

- **Audit before building**: confirm a thing is missing or broken by reading the code, then fix the root cause. Match the surrounding code's idiom, density and naming (the portal code is deliberately terse, one-line style; the public components are more spacious).
- **Design**: premium and quiet. Rounded forms (radius scale from the 2.0 system), generous spacing, pill buttons with ArrowChip, upright quiet-ink emphasis, no split-colour / outlined / italic text effects, nothing animated that distracts, never pause the marquee. Honour dark/light tokens already in the layout. Hungarian copy is formal ("Ön") and warm; Dutch uses "u".
- **Engineering**: privacy by construction (private by default, public only by an explicit tick), server-side validation for everything the client checks, no data loss on type switches or partial saves, defensive reads, idempotent migrations with plain run instructions, tests next to every rule. Accessibility: real labels, `aria-describedby`, visible focus, 44 px touch targets, readable at 320 px.
- **Verify, then report faithfully**: if something fails, say so with the output; if a step was skipped, say that; when verified, state it plainly. Keep replies to Marton short and in plain language, and tell them exactly what to run in Supabase and in what order.
