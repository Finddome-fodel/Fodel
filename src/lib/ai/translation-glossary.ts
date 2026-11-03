/**
 * Established wording for the words real-estate copy leans on, per target language.
 * Generated from src/i18n/GLOSSARY.md (the site's own vetted terms): [Hungarian, target].
 * Regenerate by re-running the extraction after the glossary changes; do not edit by hand.
 */
const GENERATED_GLOSSARY: Record<string, [string, string][]> = {
  nl: [["ingatlan", "woning / vastgoed"], ["megye", "comitaat"], ["település", "plaats"], ["földhivatal", "kadaster"], ["energetikai tanúsítvány", "energielabel"], ["irányár", "vraagprijs"], ["telek", "perceel"], ["alapterület", "woonoppervlak"], ["tanya", "boerderij"], ["kúria, kastély", "landhuis, herenhuis"], ["vályogház", "leemhuis"]],
  en: [["ingatlan", "property"], ["megye", "county"], ["település", "town or village"], ["földhivatal", "land registry"], ["energetikai tanúsítvány", "energy performance certificate (EPC)"], ["irányár", "asking price"], ["telek", "plot"], ["alapterület", "floor area"], ["tanya", "farmstead"], ["kúria, kastély", "manor house"], ["vályogház", "adobe house"]],
  de: [["ingatlan", "Immobilie"], ["megye", "Komitat"], ["település", "Ort"], ["földhivatal", "Grundbuchamt"], ["energetikai tanúsítvány", "Energieausweis"], ["irányár", "Angebotspreis"], ["telek", "Grundstück"], ["alapterület", "Wohnfläche"], ["tanya", "Hof"], ["kúria, kastély", "Landhaus, Herrenhaus"], ["vályogház", "Lehmhaus"]],
  fr: [["ingatlan", "bien (immobilier)"], ["megye", "comitat"], ["település", "localité"], ["földhivatal", "registre foncier (cadastre)"], ["energetikai tanúsítvány", "certificat de performance énergétique"], ["irányár", "prix demandé"], ["telek", "terrain"], ["alapterület", "surface habitable"], ["tanya", "ferme (tanya)"], ["kúria, kastély", "manoir"], ["vályogház", "maison en adobe"]],
  es: [["ingatlan", "inmueble"], ["megye", "condado"], ["település", "localidad"], ["földhivatal", "Registro de la Propiedad"], ["energetikai tanúsítvány", "certificado de eficiencia energética"], ["irányár", "precio de venta"], ["telek", "terreno / parcela"], ["alapterület", "superficie habitable"], ["tanya", "finca (tanya)"], ["kúria, kastély", "casa señorial"], ["vályogház", "casa de adobe"]],
  pl: [["ingatlan", "nieruchomość"], ["megye", "komitat"], ["település", "miejscowość"], ["földhivatal", "księga wieczysta"], ["energetikai tanúsítvány", "świadectwo charakterystyki energetycznej"], ["irányár", "cena ofertowa"], ["telek", "działka"], ["alapterület", "powierzchnia użytkowa"], ["tanya", "gospodarstwo (tanya)"], ["kúria, kastély", "dwór"], ["vályogház", "dom z gliny (adobe)"]],
  ro: [["ingatlan", "proprietate"], ["megye", "comitat"], ["település", "localitate"], ["földhivatal", "cartea funciară"], ["energetikai tanúsítvány", "certificat de performanță energetică"], ["irányár", "preț cerut"], ["telek", "teren / parcelă"], ["alapterület", "suprafață utilă"], ["tanya", "fermă (tanya)"], ["kúria, kastély", "conac"], ["vályogház", "casă din chirpici"]],
  sk: [["ingatlan", "nehnuteľnosť"], ["megye", "župa"], ["település", "obec"], ["földhivatal", "kataster"], ["energetikai tanúsítvány", "energetický certifikát"], ["irányár", "požadovaná cena"], ["telek", "pozemok"], ["alapterület", "úžitková plocha"], ["tanya", "farma (tanya)"], ["kúria, kastély", "kúria / panský dom"], ["vályogház", "dom z nepálených tehál"]],
  it: [["ingatlan", "immobile"], ["megye", "contea"], ["földhivatal", "catasto / registro fondiario"], ["energetikai tanúsítvány", "APE"]],
  pt: [["ingatlan", "imóvel"], ["megye", "condado"], ["földhivatal", "registo predial"], ["energetikai tanúsítvány", "certificado energético"]],
  el: [["ingatlan", "ακίνητο"], ["megye", "νομός"], ["földhivatal", "κτηματολόγιο"], ["energetikai tanúsítvány", "πιστοποιητικό ενεργειακής απόδοσης"]],
  cs: [["ingatlan", "nemovitost"], ["megye", "župa"], ["földhivatal", "katastr nemovitostí"], ["energetikai tanúsítvány", "PENB"]],
  sl: [["ingatlan", "nepremičnina"], ["megye", "županija"], ["földhivatal", "zemljiška knjiga"], ["energetikai tanúsítvány", "energetska izkaznica"]],
  sv: [["ingatlan", "fastighet (bostad)"], ["megye", "provins"], ["földhivatal", "fastighetsregister"], ["energetikai tanúsítvány", "energideklaration"]],
  da: [["ingatlan", "ejendom"], ["megye", "provins"], ["földhivatal", "tingbog"], ["energetikai tanúsítvány", "energimærke"]],
  no: [["ingatlan", "eiendom"], ["megye", "fylke"], ["földhivatal", "grunnbok"], ["energetikai tanúsítvány", "energiattest"]],
  fi: [["ingatlan", "kiinteistö (kohde)"], ["megye", "maakunta"], ["földhivatal", "kiinteistörekisteri"], ["energetikai tanúsítvány", "energiatodistus"]],
  et: [["ingatlan", "kinnisvara"], ["megye", "maakond"], ["földhivatal", "kinnistusraamat"], ["energetikai tanúsítvány", "energiamärgis"]],
  lv: [["ingatlan", "īpašums"], ["megye", "apriņķis"], ["földhivatal", "zemesgrāmata"], ["energetikai tanúsítvány", "energosertifikāts"]],
  lt: [["ingatlan", "nekilnojamasis turtas"], ["megye", "apskritis"], ["földhivatal", "nekilnojamojo turto registras"], ["energetikai tanúsítvány", "energinio naudingumo sertifikatas"]],
};

/**
 * The same kind of terms for the seven languages added later (written by hand: the site's glossary has no
 * entry for them yet). Where a language has no everyday word for a Hungarian notion, the Hungarian word
 * follows in brackets, which the prompt allows. Currency and unit stay as they are.
 */
const NEW_LANGUAGE_GLOSSARY: Record<string, [string, string][]> = {
  sr: [["tanya", "salaš"], ["zártkert", "baštenska parcela (zártkert)"], ["présház", "vinogradarska kućica (présház)"], ["hrsz.", "br. parcele (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "okvirna cena"], ["ár", "cena"], ["telek", "plac"], ["nyaraló", "vikendica"], ["felújított", "renoviran"], ["panel", "panelna gradnja"], ["tégla", "ciglana gradnja"]],
  uk: [["tanya", "хутір"], ["zártkert", "садова ділянка (zártkert)"], ["présház", "виноградарський будиночок (présház)"], ["hrsz.", "номер ділянки (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "орієнтовна ціна"], ["ár", "ціна"], ["telek", "земельна ділянка"], ["nyaraló", "дача"], ["felújított", "відремонтований"], ["panel", "панельний будинок"], ["tégla", "цегляний"]],
  tr: [["tanya", "çiftlik evi (tanya)"], ["zártkert", "bağ bahçe parseli (zártkert)"], ["présház", "bağ evi (présház)"], ["hrsz.", "parsel no (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "talep edilen fiyat"], ["ár", "fiyat"], ["telek", "arsa"], ["nyaraló", "yazlık"], ["felújított", "yenilenmiş"], ["panel", "panel bina"], ["tégla", "tuğla"]],
  he: [["tanya", "חווה (tanya)"], ["zártkert", "חלקת גן (zártkert)"], ["présház", "בית כרם (présház)"], ["hrsz.", "מספר חלקה (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "מחיר מבוקש"], ["ár", "מחיר"], ["telek", "מגרש"], ["nyaraló", "בית נופש"], ["felújított", "משופץ"], ["panel", "בניין פנלים טרומי"], ["tégla", "לבנים"]],
  ar: [["tanya", "مزرعة (tanya)"], ["zártkert", "قطعة بستان (zártkert)"], ["présház", "بيت كرم (présház)"], ["hrsz.", "رقم القسيمة (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "السعر المطلوب"], ["ár", "السعر"], ["telek", "قطعة أرض"], ["nyaraló", "بيت للعطلات"], ["felújított", "مجدّد"], ["panel", "مبنى من الألواح الجاهزة"], ["tégla", "طوب"]],
  ru: [["tanya", "хутор"], ["zártkert", "садовый участок (zártkert)"], ["présház", "виноградарский домик (présház)"], ["hrsz.", "номер участка (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "ориентировочная цена"], ["ár", "цена"], ["telek", "земельный участок"], ["nyaraló", "дача"], ["felújított", "после ремонта"], ["panel", "панельный дом"], ["tégla", "кирпичный"]],
  zh: [["tanya", "农庄 (tanya)"], ["zártkert", "小型园地 (zártkert)"], ["présház", "葡萄园小屋 (présház)"], ["hrsz.", "地块编号 (hrsz.)"], ["m²", "m²"], ["Ft", "Ft (HUF)"], ["irányár", "参考价格"], ["ár", "价格"], ["telek", "地块"], ["nyaraló", "度假屋"], ["felújított", "已翻新"], ["panel", "预制板楼"], ["tégla", "砖砌"]],
};

export const TRANSLATION_GLOSSARY: Record<string, [string, string][]> = { ...GENERATED_GLOSSARY, ...NEW_LANGUAGE_GLOSSARY };
