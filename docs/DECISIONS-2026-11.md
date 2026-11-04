# Decisions for the November 2026 release

Written during the release build. Marci did not answer the Q1–Q17 message before work started, so every default of
`claude-code-master.md` §2 applies until he says otherwise. Where the code or a test disagreed with the brief,
the code won and the reason is written here.

## Questions Q1–Q17 (defaults in force)

| # | Decision | Status |
|---|---|---|
| Q1 | Tier bands: `< 25 000 000`, `25 000 000 – 100 000 000` (both ends in the middle band), `> 100 000 000` Ft. Stored as inclusive upper bounds 24 999 999 and 100 000 000. | default |
| Q2 | The listing's `price_huf` decides the tier; frozen into the order line (`tier`, plus `price_tier_*` on the listing). A draft without a price shows "from" prices and cannot be checked out. | default |
| Q3 | Basic = HU + EN + DE; Europe = every site language except `tr he ar zh ru` (so `sr` and `uk` are in); World = all 28. The owner's language is always included. | default |
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
- **Migration numbers.** `0050_locales_7`, `0051_locales_7_newsletter`, `0052_translation_status`, `0053_translation_packages`, `0054_photo_moderation`; new: 0055–0058 per brief §6.
