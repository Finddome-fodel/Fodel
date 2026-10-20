# FODEL glossary

One term per concept per language. If you add copy, use these words; if a word is missing, add a row here first.

Registers: Hungarian **Ön**, Dutch **u**, English plain British **you**, German **Sie**, French **vous**.

Typography: see `src/lib/format.ts` (numbers, prices, areas, dates) and `src/lib/typography.ts` (quotation marks, no-break spaces).

| Concept | hu | nl | en | de | fr |
|---|---|---|---|---|---|
| property (the object) | ingatlan | woning / vastgoed | property | Immobilie | bien (immobilier) |
| listing (the ad for one property) | hirdetés | advertentie | listing | Inserat | annonce |
| to advertise / place an ad | hirdetni / hirdetést feladni | adverteren / advertentie plaatsen | to list / place an ad | inserieren / Inserat aufgeben | publier / déposer une annonce |
| seller | eladó | verkoper | seller | Verkäufer | vendeur |
| advertiser (portal account) | hirdető | adverteerder | advertiser | Inserent | annonceur |
| buyer | vevő | koper | buyer | Käufer | acheteur |
| cash buyer | készpénzes vevő | koper met eigen geld | cash buyer | Barkäufer | acheteur au comptant |
| owner | tulajdonos | eigenaar | owner | Eigentümer | propriétaire |
| county | megye | comitaat | county | Komitat | comitat |
| region | régió | regio | region | Region | région |
| settlement (town or village) | település | plaats | town or village | Ort | localité |
| exclusivity contract | kizárólagossági szerződés | exclusiviteitscontract | exclusivity contract | Alleinvermittlungsvertrag | contrat d’exclusivité |
| brokerage fee / commission | jutalék | courtage | commission | Provision | commission |
| power of attorney | meghatalmazás | volmacht | power of attorney | Vollmacht | procuration |
| land registry | földhivatal | kadaster | land registry | Grundbuchamt | registre foncier (cadastre) |
| energy performance certificate | energetikai tanúsítvány | energielabel | energy performance certificate (EPC) | Energieausweis | certificat de performance énergétique |
| sale and purchase contract | adásvételi szerződés | koopovereenkomst | sale and purchase agreement | Kaufvertrag | contrat de vente |
| payment request (pro forma) | díjbekérő | betaalverzoek (proforma) | payment request (pro forma invoice) | Zahlungsaufforderung (Proforma-Rechnung) | demande de paiement (facture pro forma) |
| invoice | számla | factuur | invoice | Rechnung | facture |
| valuation | értékbecslés | waardebepaling | valuation | Bewertung | estimation |
| search request (free search service) | kerestetés | zoekopdracht / zoekdienst | property search request | Suchauftrag | recherche personnalisée |
| callback | visszahívás | terugbellen | callback | Rückruf | rappel |
| price list / rates | árlista | tarieven | prices | Preise | tarifs |
| asking price | irányár | vraagprijs | asking price | Angebotspreis | prix demandé |
| plot / land | telek | perceel | plot | Grundstück | terrain |
| living area | alapterület | woonoppervlak | floor area | Wohnfläche | surface habitable |
| farm (tanya) | tanya | boerderij | farmstead | Hof | ferme (tanya) |
| manor house (kúria) | kúria, kastély | landhuis, herenhuis | manor house | Landhaus, Herrenhaus | manoir |
| adobe house | vályogház | leemhuis | adobe house | Lehmhaus | maison en adobe |
| unique sale opportunity | alkalmi vétel | buitenkans | bargain | Gelegenheit | bonne affaire |
| Top 10 | Top 10 | Top 10 | Top 10 | Top 10 | Top 10 |
| sold archive | eladott ingatlanok | verkocht | sold properties | Verkaufte Immobilien | biens vendus |
| portal (owner login) | hirdetői portál | portaal | owner portal | Inserentenportal | espace annonceur |
| register (create a free account) | regisztráció | registreren | register | Registrieren | s’inscrire |
| sign in | belépés | inloggen | sign in | Anmelden | se connecter |
| newsletter | hírlevél | nieuwsbrief | newsletter | Newsletter | lettre d’information |
| cookie banner | süti-sáv | cookiebanner | cookie banner | Cookie-Banner | bandeau de cookies |
| privacy statement | adatvédelmi tájékoztató | privacyverklaring | privacy notice | Datenschutzerklärung | politique de confidentialité |
| terms and conditions | ÁSZF | algemene voorwaarden | terms and conditions | Allgemeine Geschäftsbedingungen (AGB) | conditions générales |
| imprint / company details | impresszum | colofon | imprint | Impressum | mentions légales |
| accessibility | akadálymentesítés | toegankelijkheid | accessibility | Barrierefreiheit | accessibilité |
| VAT | áfa | btw | VAT | USt. (MwSt.) | TVA |
| Hungary | Magyarország | Hongarije | Hungary | Ungarn | Hongrie |
| the Netherlands | Hollandia | Nederland | the Netherlands | die Niederlande | les Pays-Bas |
| The Hague (office) | Hága | Den Haag | The Hague | Den Haag | La Haye |

## Notes

- Hungarian place names, counties and property types keep their Hungarian name, with a short translation where it helps: “Zala County”, “Zala (Komitat)”, “comitat de Zala”.
- “Commission” is used for the 4% fee. “Fee” and “price” are used for the listing packages.
- FODEL is never “an agency that sells for you in Hungary”: it advertises properties and helps with the sale. Do not write “broker” for FODEL.
- No marketing filler, no rhetorical questions, few em-dashes. Use commas, colons and full stops.
- Facts never change between languages: prices, percentages, hours and promises come from `src/config/company.ts` and `src/lib/listing-packages.ts`.
