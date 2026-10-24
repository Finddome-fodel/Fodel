# FODEL European listing intake — handover

The client listing updates are implemented in the existing Astro/Supabase project. Existing listing IDs, URLs, photos, seller details, translations, prices for listing packages and on-site services, approval workflow, billing and payments are retained. No live database changes, deployment, Git commit or push were performed by the agent. On 24 October the user confirmed that they had run the migration. See `Fodel-changes-guide.md` for the plain-language walkthrough, preview addresses and explicit coverage limits.

## Deployment

1. Apply `supabase/migrations/0022_european_listing_intake.sql` after the existing migrations through 0021. Apply it to staging first and retain the usual database backup. The migration is transactional and repeatable.
2. Deploy this code together with the migration. The new editor requires its new columns and transactional save functions.
3. Ensure outbound HTTPS access to the ECB and the selected geocoder. `GEOCODER_URL` optionally points to a compatible Photon installation; the default is `https://photon.komoot.io`. A geocoder outage leaves manual location entry available. Exchange-rate failures preserve existing rates and prevent a new conversion from being silently guessed.

No new production API key is required by the default integrations. The existing Supabase authentication/storage, services, Stripe and email configuration remains in use.

## Client requirements

| Area | Result |
|---|---|
| Classification | All 9 main categories and 56 subtypes. The subtype selector contains only the selected main category’s options. Existing subtype-based URLs remain valid. |
| Europe | 50 European and transcontinental countries, including non-EU countries; Hungary has exactly 19 counties and Budapest. GeoNames supplies first-level administrative areas. Region/locality inputs remain editable, searchable where local data exists, and optional. |
| Location | Interactive map, draggable pin, explicit place search, reverse lookup after a map selection, and manually editable coordinates. Country changes clear stale address information. Rural properties can use a pin without a street address or compulsory region. |
| Privacy | The exact point and internal note live in `property_private`, protected by RLS. Approximate listings expose a displaced, rounded point in the public table itself. Public pages, map feeds, search and structured data use that public point. |
| Details | One original asking price and currency; euro and legacy forint display values are calculated on the server. Source, rate, rate date and calculation timestamp are stored, with conversion history. Unchanged prices retain their original snapshot. |
| Areas and buildings | Living area, total building area and land area are distinct. m² and hectares convert automatically. Relevant fields follow the type/subtype, construction and renovation years remain optional, and “unknown construction year” is supported. Hidden historic values are preserved. |
| Energy, condition, heating, walls | The requested vocabularies, including unknown/not-applicable options. Energy classification accepts the actual national certificate’s value instead of requiring a Hungarian class in every country. |
| Features | Shared vocabulary with category/subtype applicability and grouped presentation. Synonymous legacy selections resolve to canonical keys. Administrators can add/edit features and their applicability in the existing taxonomy manager. |
| Promotions | Exactly homepage, category and subtype/topic placements. Owner requests are separate from admin activation. Existing homepage/category prices remain; topic placement is an unpriced request for office agreement. `property_promotion_requests` retains request status, optional quoted amount and payment reference for later paid ordering. It does not invent a price or charge the seller automatically. |
| Retired functions | Top 10, homepage ordering and bargain controls are removed from the active public/admin experience. Old Top 10 URLs redirect to listings; the old mutation endpoint returns 410. Historic database values and orders are retained. |
| Seller | Existing seller/contact settings remain. Contact languages have their own searchable multi-select, separate from paid translation choices. |
| Copy | Required title and short description, optional detailed description, and a private internal note. Existing legacy copy fields and translations are not deleted from stored listings. |
| Photos | Maximum 20 new photos, enforced in PostgreSQL as well as the UI, including concurrent uploads. Multiple upload, optimisation, drag/arrow ordering, independent cover selection, deletion and replacement. Replacement keeps the photo’s identity, position and caption. Existing galleries above the cap are preserved and can be tidied/replaced. |
| Advice and services | Six brief-specific photo tips in a compact disclosure. Both optional services and their existing descriptions/prices remain: €170 and €250. |
| Owner workflow | Existing six-step flow retained. Draft autosaves can store incomplete steps; saves are queued per step. Direct navigation to the review step works. Submission still requires complete core information and at least one photo. |

The new catalogue’s group/subtype/feature labels include Hungarian, Dutch, English, German and French. The existing portal language policy is retained: the owner flow uses Hungarian, Dutch or English; administration uses Hungarian.

## OneDrive workaround

The existing local mirror is `~/fodel-dev`. Its launcher and sync scripts are `~/fodel-dev-start.sh` and `~/fodel-sync.sh`. The launcher’s own notes explain that the mirror is the running dev server and should not be edited or built in while it runs.

This work used `/private/tmp/fodel-client-update`, without copying `.env`, and a complete pre-change source snapshot in `/private/tmp/fodel-client-original`. There were 172 cloud-only files; every recovered mirror file matched the source placeholder’s byte size and modification time. No unavailable source file was treated as missing or overwritten from an unverified version.

For future checks:

```sh
npm run local:prepare
```

This creates a separate local verification checkout and prints its location and next commands. It checks OneDrive’s placeholder flag before reading a file, uses the verified mirror only when necessary, and refuses mismatched mirror files or conflicting local edits. It never writes into the running mirror and excludes credentials, Git data, dependencies and generated output.

Run installs/builds/tests in that printed checkout. Keep production `.env` out of automated tests. The development mirror’s existing sync mechanism may carry normal source edits across; dependency/configuration changes still need the launcher’s normal refresh or a fresh isolated checkout.

## Verification

- `npm run check`: no TypeScript/Astro errors.
- `npm run build`: production build.
- `npm run test:rules`: existing rule suite.
- `npm run test:listing`: input rules, currencies, coordinates, hectares, legacy category preservation and partial drafts, without network/database access.
- `npm run test:listing:migration`: actual SQL execution in an embedded PostgreSQL engine, including repeatability, atomic rollback, private-data isolation, price audit, promotion permissions, photo limits, cover/order changes and grouped/subtype search.
- `tests/e2e/editor`: complete owner/admin form interactions plus public selectors, retired routes, photo-limit copy and responsive checks in Chromium, WebKit and iPhone Safari. Uses an explicit localhost in-memory fixture, never production.

Follow-up verification: 48 browser checks pass, including full retained admin navigation and loaded homepage images both with and without published listings. The homepage now falls back to the existing lakeside hero asset when no listing can supply its image. The test preview is clearly labelled and rejects non-test account emails. The updated normal development server is available on `http://localhost:4321` using the existing mirror/configuration; port 4402 remains a fictional-data demonstration.

The SQL tests use a representative schema fixture; they do not replace applying the migration to a staging copy of the real database. Actual production Supabase/Stripe/email delivery and real service scheduling were not exercised.

To reproduce the browser checks, start these in separate terminals from the isolated checkout:

```sh
node tests/e2e/support/listing-database.mjs 54401
```

```sh
SUPABASE_URL=http://127.0.0.1:54401 SUPABASE_ANON_KEY=local-editor-fixture SUPABASE_SERVICE_ROLE_KEY=local-editor-fixture EMAIL_TRANSPORT=capture AI_ENABLED=false STRIPE_ENABLED=false npm run dev -- --port 4402 --host 127.0.0.1
```

```sh
E2E_BASE_URL=http://127.0.0.1:4402 E2E_EDITOR_FIXTURE=1 npx playwright test tests/e2e/editor --project=chromium --project=webkit --project=mobile-safari --workers=1
```

The local fixture accepts `admin@fodel-test.local` or `owner@fodel-test.local` with any nonempty test password. It contains only fictional test records. The fixture is not an application route and must not be deployed as a service.

## Data sources

- [ECB reference-rate feed and publication notes](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html). Used for display conversions, not transaction settlement.
- [GeoNames download documentation](https://www.geonames.org/export/), CC BY 4.0. `node scripts/update-geography.mjs` refreshes the checked-in region dataset while retaining Hungary’s exact 20 required entries.
- [Photon provider and API documentation](https://github.com/komoot/photon), with OpenStreetMap attribution. Searches are explicitly user-triggered, not requests on every keystroke. The public demo provider can throttle requests; a dedicated compatible deployment can be configured with `GEOCODER_URL`.
