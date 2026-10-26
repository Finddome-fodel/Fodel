# 12-language job state (el it fi sv nb cs da et sl pt lv lt)
Branch feat/i18n-12-more-languages from main (PR#1 merged). Work dir .i18n-w2/
Plan: extract.cjs -> units.json + strings (fr/en) ; translations in tr/<lang>/*.txt ; apply.cjs injects after sk.
Progress log below.
## Decisions
Order/codes: it pt el cs sl sv da no fi et lv lt  (Norwegian code 'no', htmlLang nb, intl nb-NO)
Register: it Lei; pt-PT 3rd-person formal (no "você", use "o seu", "pode"); el εσείς; cs vykání; sl vikanje; sv/da/no du (natural standard); fi sinä (natural standard); et teie; lv jūs; lt jūs.
Translation files: .i18n-w2/tr/tNN{a,b}.txt  a = it pt el cs sl sv ; b = da no fi et lv lt. Format "@id\nit: ...". '=' => same as source.
Plurals: use ${nOf('cs', n, one, few, many[, two])} with literal code (nOf gets a 6th param `two` for sl). Constants: languages 5, countries 8, ha 300, REGISTRATION_DAYS 7.
Glossary key terms: it immobile/annuncio/pubblicare un annuncio/provvigione/contea/APE; pt imóvel/anúncio/comissão/condado/certificado energético/registo predial; el ακίνητο/αγγελία/προμήθεια/νομός; cs nemovitost/inzerát/provize/župa/PENB; sl nepremičnina/oglas/provizija/županija/energetska izkaznica; sv fastighet(bostad)/annons/provision/provins/energideklaration; da ejendom/annonce/provision/provins/energimærke; no eiendom/annonse/provisjon/fylke/energiattest; fi kiinteistö(kohde)/ilmoitus/välityspalkkio/maakunta/energiatodistus; et kinnisvara/kuulutus/vahendustasu/maakond/energiamärgis; lv īpašums/sludinājums/komisijas maksa/apriņķis/energosertifikāts; lt nekilnojamasis turtas/skelbimas/komisinis atlyginimas/apskritis/energinio naudingumo sertifikatas
Brand: it FODEL IMMOBILIARE, pt FODEL IMOBILIÁRIA, el FODEL ΑΚΙΝΗΤΑ, cs FODEL NEMOVITOSTI, sl FODEL NEPREMIČNINE, sv FODEL FASTIGHETER, da FODEL EJENDOMME, no FODEL EIENDOM, fi FODEL KIINTEISTÖT, et FODEL KINNISVARA, lv FODEL NEKUSTAMAIS ĪPAŠUMS, lt FODEL NEKILNOJAMASIS TURTAS
## Progress
t01 a+b done
- NOTE: apply must turn ' €' and ' %' (space before) into NBSP; translations use plain spaces
- t02 a+b done
- t03 a+b done; SellersPage space var must cover cs sl sv da no fi lt
- t04 a+b done
- t05 a+b done
- NOTE apply: preserve leading/trailing whitespace of EN automatically (e.g. @469,@470 start with space); value = text after 'xx: '
- t06 a+b done
- t07 a+b done (slugs: el latin-translit; da/no ø→o å→a æ→ae; hreflang pt-PT, nb)
- t08 a+b done
- t09 a+b done
- t10 a+b done
- t11 a+b done
- t12 a+b done (now via tsv2tr.cjs)
- t13 done
- NOTE postfix: in block files replace BRAND.en. -> BRAND.xx. (e.g. @1084)
- t14 done
- overrides.json: block literal overrides by start offset (unextracted 'guide', case of Hungary in Moving to). After generating blocks, scan for leftover EN literals.
- legal overrides needed: 2853 notice(Privacy), 6573 notice(Cookie), 7924 conditions(Terms and), 11523 statement(Accessibility)
- t15 done (incl 1068)
- t16 done (1119-1190)
- t17 done (faq 1191-1235)
- t18 done (legal 1236-1358); legal title overrides in overrides.json
- t19 done (email 1359-1440)
- t20 done (email 1441-1521)
- t21 done (ui 1522-1618) ALL TRANSLATED. results plural: postfix to pluralOf
