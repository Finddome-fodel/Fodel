# November 2026 release: audit and checklist

Branch `release/nov-2026` (from `origin/main` = `24b6839`). Legend: ✅ done on the release branch · 🟡 partly · ❌ not yet.
Source of the items: `claude-code-master.md` (§ numbers), `claude-code-fixes.md` (fix numbers). The spec Google Doc was private
and not available to the build; the master brief was used as the checklist.

## Repository state at the start (Phase 0, read-only)

| Item | Result |
|---|---|
| Open PRs | #28–#34, all mergeable and clean, no reviews. Heads equal the handoff (`f8ef580 bae0c65 65562dc 8579bcf`, `a1bd23f f967322 cf0ba45`). |
| Path | **A**: the fix prompt had not been applied; the translation chain sat on `main`, not #30. |
| Migrations on branches | #30 0046–0049 · #31 two files numbered 0050 · chain 0051, 0052 · #34 0053 · nothing from 0046 up on production. |
| New env vars | `UNPURCHASED_LISTING_LOCALES`, `SHOW_MACHINE_TRANSLATION_NOTE` (chain), `TR_DEBUG`; this release adds none that is required. |
| Crons | before: daily 07:00, mail 07:30, translate 08:00 UTC. Now also `/api/cron/fx` 15:30 UTC. |
| Stripe events handled | `checkout.session.completed / expired / async_payment_succeeded / async_payment_failed`, `invoice.issued / sent / credit_note_issued`. |

## Integration (§4, §6, §7)

| Item | Status | Evidence |
|---|---|---|
| I1 #30, #31, #34 merged | ✅ | merge commits on the release branch; suites green |
| Chain #28 #29 #32 #33 replayed onto the release (never the PR branches) | ✅ | merge commit; PR branches untouched (`gh pr list`) |
| 21-language pin dropped; `ALL_LOCALES = LOCALES` (28) | ✅ | `translate-core.ts`, `page.ts`; tests count 28 |
| Migrations renumbered 0046–0054 + `test:migrations` | ✅ | `scripts/test-migrations-sequence.mjs` |
| 0055 `listing_package_values` (own run) | ✅ | PGlite harness, twice |
| 0056 `pricing_2026` (term/band columns, `exchange_rate_snapshots`, `pricingLive`) | ✅ | PGlite harness, twice |
| 0057 agricultural types | ✅ | PGlite harness (remap, flag, log, rollback line) |
| 0058 photo bucket closed to listing (replaces the planned floor-area report, see decisions) | ✅ | PGlite harness: before/after, owner/other/admin, twice |
| F2 photo-review e-mail in the 7 new languages | ✅ | `check:i18n` |
| 2.1 one contact detector (`findContacts`) | ✅ | `test:rules` |
| 3.1 Csomagok tabs in `PackagesShell` / `saveServicesPatch`, no placeholder | ✅ | `PACKAGE_TABS` test |
| 3.2 Kiegészítők never writes the translation price | ✅ | `extrasStored`; test |
| 3.3 locale filter in SQL + parity test | ✅ | `test:listing:migration` (30 listings × 28 languages × 2 modes, pagination) |
| 3.4 prices read with `readMoney` | ✅ | `test-package-orders.mjs` |
| 3.5 `applyPurchase` snapshot + one-shot (`23505` only = already applied) | ✅ | `test:translation`, `test:stripe` |
| 3.6 backfill touches only rows that gain languages | ✅ | PGlite test |
| 3.7 "Basic included" line once, only on older-package orders | ✅ | `test-package-orders.mjs` |
| 3.8 decisions in the PR text | ✅ | `docs/DECISIONS-2026-11.md`, PR body |
| F1 one locale-gate helper for all 28 routes | ✅ | `src/lib/listing-locale-gate.ts`; grep test in `test:language-gate` |
| F3 `writtenLocales` (Q16) | ✅ | `listing-languages.ts` + SQL twin, parity test |
| F5 pending photos | 🟡 | the bucket can no longer be listed (0058); a pending photo's own address still opens for whoever holds it (random uuid). Private bucket + signed addresses **not** shipped: residual risk in the PR and the guide |
| F6 legal and price pages | ✅ | price list/submit/sellers/llms on the new model (`priceFacts`); legal texts keep „A magyar/angol változat az irányadó”; lawyer check in the guide |

## §8 Pricing and the daily rate

| Item | Status | Evidence |
|---|---|---|
| 27-cell matrix, defaults asserted cell by cell | ✅ | `test:pricing` |
| Value bands (Q1) at 24 999 999 / 25 000 000 / 100 000 000 / 100 000 001 | ✅ | `test:pricing` |
| `priceFor()` the only price function; integer cents | ✅ | `src/lib/listing-pricing.ts` |
| Orders: package line with term, band, languages, switched-off languages frozen | ✅ | `test-package-orders.mjs` |
| Upgrade = difference inside the original band (builder, owner panel, webhook entitlement) | ✅ | `test:pricing`, `test:stripe` (live-model flows) |
| Referral discount whole cents, half up | ✅ | `test:pricing` |
| Catalog exposes Basic/Europe/World; old packages kept (Q9) | ✅ | `sellingPackages`, `legacy` |
| Csomagok tabs: matrix, content, extras, single languages, rate, extras' bands, rounding | 🟡 | pages, forms and tests done; see click-test below |
| Graceful before the migrations (`pricingLive`) | ✅ | catalog sells the two older packages until 0056 |
| Stripe checkout, webhook, publish term (`package_months`), expiry | ✅ | `test:stripe` (live-model Stripe tests) |
| Setup chooser (JS off and on), review page, owner panel | ✅ | `test:chooser`; browser-checked at 1440 and 390 px |
| Renewal 1/3/6 (Q8) | ✅ | `test:stripe`, `test:pricing` |
| Public price list, submit page (28 languages) | ✅ | `PriceMatrix`, `PriceListPage`, `SubmitAdPage` |
| Pro-forma / invoice lines (hu, nl) | ✅ | `invoicing/catalogue.ts`; order-time forint note on invoices: **skipped, optional** |
| Daily rate: table, cron `/api/cron/fx`, catch-up in the daily job, read chain, fallback, "Frissítés most", stale notice | ✅ | `test-fx.mjs` |
| Rate never used to compute a charge (grep test) | ✅ | `test-fx.mjs` |
| HUF hints on public pages (`/api/fx`), checkout, e-mails; footnote in 28 languages | ✅ | `test-fx.mjs` |

## §9 Agricultural types, §10 forms, §10b share buttons

| Item | Status | Evidence |
|---|---|---|
| Three agricultural types + legacy alias + migration remap + admin „Típus ellenőrzése” + 301 + search alias | ✅ | 0057 harness, snapshot test, `legacySubtypeRedirect` |
| „Irányár” → „Ár” everywhere | ✅ | `git grep` = 0 outside historic migrations |
| Floor areas (living area per type, building area optional, labels in 28 languages, `fieldRules` snapshot) | ✅ | `test:field-rules` |
| Share buttons (Facebook, WhatsApp, e-mail, native, copy), OG tags, UTM | ✅ | `test:share` (22), `tests/e2e/public/share.spec.ts` (41 passed on chromium, webkit, mobile-safari, mobile-chrome), screenshots `docs/qa/2026-11/share-*.png`. **Not verifiable from here:** the real Facebook preview and a real WhatsApp card (guide step 6) |

## Found and fixed during the final pass

| Bug | Fix | Test |
|---|---|---|
| The three-dot menu on Felhasználók did nothing (a row that lifts on hover moved the fixed popover off-screen) | `placeMenu` measures the real origin | `tests/e2e/editor/users-menu.spec.ts` (fails before, passes after) |
| `/ar` and `/he` pages scrolled sideways by 10 000 px (spam-trap fields hidden with `left:-10000px`) | `inset-inline-start` | grep test in `test:share`; no-overflow e2e |
| The phone field on the 7 new-language pages started on Hungary (RS, UA, TR, IL, AE, RU, CN are not in the common list, so nothing was marked selected) | `selected` also set in the full list | `test:listing` + e2e forms spec (fails before, passes after) |
| Russian and Ukrainian headers touched the account and listing buttons (about 25 px) | shorter idiomatic button text („Подать объявление”, „Подати оголошення”), Russian links a little tighter | `nav.spec.ts` (171 cases; it now understands right-to-left, which had made he and ar fail for the wrong reason) |
| The flat „Hosszabbítás 6 hónappal 25 €” was still editable on Kiegészítők and Ársávok, listed on the public price list and offered as an extra on the admin review page once the 2026 prices were live | retired centrally in `listingCatalog` when `pricingLive`; price list row removed in all 28 languages | `test-package-orders.mjs`, `test-pricing.mjs` (fail before, pass after) |

## §11 Gate, §12 PR, §13 guide

See the end of this file once the gate has run (updated before the PR is opened).
