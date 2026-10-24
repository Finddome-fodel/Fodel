# Fodel changes — plain-language review guide

Updated 24 October 2026. The database migration has been run, according to your confirmation. The website code has been updated locally; I have not deployed it to Vercel.

## Which site to open

- **Updated site with your existing database:** <http://localhost:4321/hu/>. Sign in to <http://localhost:4321/portal/dashboard> with your normal admin account. Changes saved here affect your existing database.
- **Safe demonstration with fictional records:** <http://127.0.0.1:4402/hu/>. It now has an unmistakable local-demo notice. Sign in with `admin@fodel-test.local` and password `preview` for the full admin view, or `owner@fodel-test.local` and `preview` for the seller view. Real account emails are rejected by the test database.
- **Existing hosted site:** <https://fodel.vercel.app/portal/dashboard>. I refreshed it and confirmed the full admin menu, 42 listings in total and 10 published listings. It still runs the previously deployed website code.

The missing admin menu in the screenshot was the seller role in the fictional demonstration, not a deletion of admin tools or existing records. The seller and admin accounts deliberately have different menus.

## Everything changed, and how to see it

Open **Ingatlanok → an existing listing** in the normal local admin, or use the fictional example at <http://127.0.0.1:4402/portal/properties/10000000-0000-4000-8000-000000000001>.

| What changed | Where and what to try |
|---|---|
| Nine main categories and all 56 requested subtypes | In the listing's category section, select a main category. Only its own subtypes appear. Public listing filters use the same groups and subtypes. Existing property links are preserved. |
| Europe-wide locations | In **Elhelyezkedés**, choose among 50 countries, including non-EU countries. Hungary has all 19 counties and Budapest. Change to Switzerland to see its 26 cantons. Administrative areas are country-aware and optional; you can enter a value missing from the suggestions. |
| Searchable places and a working location pin | Search explicitly for a place, select a result, click/drag the map pin, or enter coordinates manually. Pin and coordinates stay together. The system attempts to fill related place details after a map selection; manual entry remains available when lookup fails. |
| Control over location privacy | In **Elhelyezkedés**, choose approximate or exact public location. The original point remains private for approximate listings. Internal notes are private too. |
| One asking price | In **Részletek**, enter the price once and choose its currency. The euro value is calculated automatically. The applied rate, source, rate date and calculation time are stored. An unchanged price retains its existing conversion. |
| Twelve supported currencies | EUR, HUF, GBP, CHF, CZK, PLN, RON, DKK, SEK, NOK, ISK and TRY. Rate history is stored in the database; there is no separate visual price-history screen. Historic rates are not fabricated for old listings. |
| Separate, relevant areas | Living area, total building area and land area are separate. Switch between square metres and hectares without retyping. Agricultural land starts with hectares. Selecting land hides unrelated living-room/building fields. Old hidden values are retained. |
| Clearer building details | Construction and renovation years are optional. Construction year can be unknown. The requested condition, heating and wall choices are provided. Bedrooms, bathrooms and technical fields follow the property type. Video URL and negotiable price remain. |
| Country-aware energy entry | Choose unknown, not applicable, or an actual certificate rating. Suggestions adapt for supported national schemes, and the certificate value can be entered directly. The form does not force Hungarian ratings on foreign properties. |
| Shorter, relevant property features | In **Jellemzők**, change between a house, farm and industrial property. The optional feature groups change with the category/subtype. Duplicate meanings have been consolidated. In **Beállítások → taxonomy**, administrators can extend features and set which property groups/subtypes use them. |
| Exactly three promotion choices | In **Kiemelések**, see homepage, category and topic/subtype placement. Seller requests are separate from administrator activation. Topic means the chosen subtype, with a price agreed by the office, as you approved. Request/quote/order/payment fields support later paid ordering. |
| Retired Top 10, manual homepage order and bargain functions | These are removed from active public and portal interfaces. Old Top 10 page links redirect to listings. Historical database values and order records are retained. No other admin menu was removed. |
| Contact languages separate from translation purchases | In **Eladó elérhetősége**, select multiple actual spoken languages using the searchable list. Existing seller details and visibility settings remain. Translation options remain separate. |
| Four simple text fields | In **Szövegek**, use title, short description, optional detailed description and private internal note. Title and short description are required for a completed listing. Subtitle and the duplicate condition/heating/highlight text inputs are removed from the editor. Saved historic text is retained. |
| A complete photo editor with a 20-photo maximum | In **Képek**, upload several pictures, drag them or use move buttons, choose a cover independently of position, replace a picture or delete it. The same cover is used on public cards/details. The server also enforces the limit during simultaneous uploads. Existing galleries already over 20 are preserved; additional photos require getting below the cap. |
| Image optimisation and compact guidance | Uploads retain resizing/optimisation. The photo editor has a collapsed six-tip guide covering light, tidiness, complete rooms, sharpness, outdoor areas and avoiding people. |
| Optional services kept | The seller's package/setup flow retains the €170 photo/video/drone option and the €250 Gábor visit/photo/video/personal valuation option, with their existing copy. Neither is compulsory. Existing package/payment/billing/approval workflows remain. |
| More reliable drafting and saving | The existing six-step seller flow remains. Incomplete drafts can autosave; completing/submitting still checks essential information. Listing text, private details and the price conversion are saved together so a failure cannot leave only half an update saved. Direct access to the review step works. |
| Public listing information follows the new data | Property cards/details show the appropriate category/subtype, areas, technical information, features and contact languages. Empty irrelevant area values do not appear as misleading zeroes. Non-Hungarian original listings can be found without inventing Hungarian text. |
| Homepage image restored | A published featured property still supplies the hero image/link and slideshow. If there are no published properties, the existing Fodel lakeside image fills the image panel. It no longer disappears. |
| Local preview made clear | The fictional test site is visibly labelled and documents its two test accounts. The normal local site uses the existing OneDrive-safe mirror. A new `npm run local:prepare` command prepares a separate checkout for builds/checks without reading unavailable OneDrive files blindly or disturbing the running mirror. |

For the seller flow, use the fictional example at <http://127.0.0.1:4402/portal/properties/10000000-0000-4000-8000-000000000001/setup#property>, then move through property, description, photos, package, billing and review. A test seller session shows the owner-specific behaviour.

## How fully this covers the brief

The requested listing workflow is covered across classification, location/privacy, price/areas, technical details, features, the three promotions, seller languages, simplified text, photo tools and retained services. The scope also includes the whole-site retirement you explicitly approved.

The following boundaries matter before calling the whole project fully signed off:

1. **National energy systems:** country-specific suggestions and free certificate entry are available, but this is not a fully researched and formally validated catalogue of every European country's current energy-rating rules.
2. **Geography:** the checked-in data covers 50 countries and first-level administrative areas. It is not a complete offline directory of every European town and every subdivision level. International place lookup depends on the geocoder; extra/manual area entry is available. Future data refresh is supported.
3. **Paid topic placement:** this is deliberately an office-confirmed quote request, not an automatic checkout or charge, following your instruction. The future ordering data is present; a new automated payment flow has not been built.
4. **Languages:** the contact list is searchable and extendable in code. Features can be extended through the admin interface; there is no separate admin screen for adding contact languages.
5. **Live verification and deployment:** applying the migration updates the database, but does not deploy the new website. The local implementation and isolated SQL/browser checks have passed; I have not performed a real customer payment, sent real email, verified the migration against every existing production record, or deployed the website. Those are still release checks.

No honest percentage can replace those distinctions. The requested form behaviour is substantially implemented, with the above data/service limits and release checks explicitly outstanding.

## Checks completed

- 48 browser checks across Chrome, Safari and iPhone Safari, including complete admin navigation, empty/published homepage images, all five public languages, form rules, photo controls and responsive layouts.
- Astro/TypeScript check: zero errors and zero warnings.
- Production build passes.
- Previous existing rule, listing-input, migration and contrast suites passed; details and reproduction commands are in `Fodel-europai-adatlap-atadas.md`.

The browser tests use fictional localhost records. They never log in to the hosted database or submit real payments or emails.
