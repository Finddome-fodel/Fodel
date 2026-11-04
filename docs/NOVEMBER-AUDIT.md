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
| Chain #28 #29 #32 #33 rebased onto the release (never the PR branches) | ✅ | `tmp/chain` replayed, merged with a merge commit |
| 21-language pin dropped; `ALL_LOCALES = LOCALES` (28) | ✅ | `translate-core.ts`, `page.ts`; tests count 28 |
| Migrations renumbered 0046–0054 + `test:migrations` | ✅ | `scripts/test-migrations-sequence.mjs` |
| 0055 `listing_package_values` (own run) | ✅ | PGlite test |
| 0056 `pricing_2026` (term/band columns, `exchange_rate_snapshots`) | ✅ | PGlite test |
| 0057 agricultural types | ❌ | |
| 0058 floor-area report | ❌ | |
| F2 photo-review e-mail in the 7 new languages | ✅ | `fix(#34)` commit; `check:i18n` |
| 2.1 one contact detector (`findContacts`) | ✅ | `translation-contact.ts` deleted; test in `test:rules` |
| 3.1 Csomagok tabs in `PackagesShell` / `saveServicesPatch`, no placeholder | ✅ | new tabs; `PACKAGE_TABS` test |
| 3.2 Kiegészítők never writes the translation price | ✅ | `extrasStored`; test |
| 3.3 locale filter in SQL + parity test | ❌ | |
| 3.4 prices read with `readMoney` | ✅ | cents forms; `test-package-orders.mjs` |
| 3.5 `applyPurchase` snapshot + one-shot | ❌ | |
| 3.6 backfill touches only rows that gain languages | ✅ | PGlite test (`updated_at` kept) |
| 3.7 "Basic included" line once on pro-forma / invoice / e-mail | ❌ | |
| 3.8 decisions in the PR text | ❌ | in the release PR |
| F1 one locale-gate helper for all 28 routes | ❌ | |
| F3 `writtenLocales` (Q16) | ❌ | |
| F5 pending photos private (#34 follow-up) | ❌ | |
| F6 legal and price pages updated | ❌ | |

## §8 Pricing and the daily rate

| Item | Status | Evidence |
|---|---|---|
| 27-cell matrix, defaults asserted cell by cell | ✅ | `test:pricing` |
| Value bands (Q1) at 24 999 999 / 25 000 000 / 100 000 000 / 100 000 001 | ✅ | `test:pricing` |
| `priceFor()` the only price function; integer cents | ✅ | `src/lib/listing-pricing.ts` |
| Orders: package line with term, band, languages, switched-off languages frozen | ✅ | `test-package-orders.mjs` |
| Upgrade = difference inside the original band | ✅ (order builder) / ❌ (owner UI, webhook) | |
| Referral discount whole cents, half up | ✅ | |
| Catalog exposes Basic/Europe/World; old packages kept (Q9) | ✅ | `sellingPackages`, `legacy` |
| Csomagok tabs: matrix, content, extras, single languages, rate, extras' bands, rounding | ✅ | pages + forms + tests |
| Graceful before the migrations (`pricingLive`) | 🟡 | |
| Stripe checkout, webhook, publish term (`package_months`), expiry | ❌ | |
| Setup chooser (JS off and on), review page, owner panel | ❌ | |
| Renewal 1/3/6 (Q8) | ❌ | |
| Public price list, submit page, legal text (28 languages) | ❌ | |
| Pro-forma / invoice lines and informational HUF at order-time rate | ❌ | |
| Daily rate: table, cron `/api/cron/fx`, catch-up in the daily job, read chain, fallback, "Frissítés most", stale notice | ✅ | `test:pricing` (`test-fx.mjs`) |
| Rate never used to compute a charge (grep test) | ✅ | `test-fx.mjs` |
| HUF hints on public pages / checkout / e-mails; footnote in 28 languages | 🟡 | footnote + hint formatter done; surfaces ❌ |

## §9 Agricultural types, §10 forms, §10b share buttons

| Item | Status |
|---|---|
| Three agricultural types + legacy alias + migration remap + admin review + 301 + search alias | ❌ |
| „Irányár” → „Ár” everywhere | ❌ |
| Floor areas (living area per type, building area optional, labels in 28 languages, `fieldRules` snapshot) | ❌ |
| Share buttons (Facebook, WhatsApp, e-mail, native, copy), OG tags, UTM | ❌ |

## §11 Gate, §12 PR, §13 guide

| Item | Status |
|---|---|
| Full quality gate green | ❌ |
| Local click-test with screenshots in `docs/qa/2026-11/` | ❌ |
| Release PR opened | ❌ |
| `docs/GO-LIVE-2026-11.md` + final message | ❌ |
