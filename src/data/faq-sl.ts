/**
 * FAQ, Slovenian (formal "vikanje"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'sl' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_SL = [
  {
    id: 'direct-from-the-owner',
    question: 'Kaj pomeni „neposredno od lastnika“?',
    answer: [
      'Pri velikem delu naše ponudbe poleg naših podatkov objavimo ime in telefonsko številko lastnika. Prodajalca lahko kontaktirate neposredno.',
      'Če ga kontaktirate neposredno in se o nakupu dogovorite sami, nihče ne plača provizije: ne vi ne prodajalec. V tem primeru smo plačani le za oglas.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Koliko stane vaše posredovanje?',
    answer: [
      `Naša provizija znaša ${COMMISSION.percent}\u00a0% neto, najmanj ${eur(COMMISSION.minimumEur, L)}, plus ${COMMISSION.vatPercent}\u00a0% nizozemskega DDV. Plača jo madžarski prodajalec, ne vi.`,
      'Račun izstavimo le, ko so izpolnjeni vsi trije pogoji: obstaja pisna prodajna pogodba, kupca je pripeljal FODEL in ara je bila plačana.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Ali lahko kot državljan EU kupim nepremičnino na Madžarskem?',
    answer: [
      'Da. Kot državljan EU na Madžarskem kupujete hiše in zemljišča praktično pod enakimi pogoji kot Madžar. Skoraj 100\u00a0% madžarskih nepremičnin stoji na zemljišču v polni lasti. Stavbna pravica, kot je nizozemski erfpacht, je redka.',
      `Za kmetijska zemljišča veljajo posebna pravila. Državljan EU s kmetijsko izobrazbo lahko na Madžarskem pridobi do ${AGRI_HECTARE_LIMIT} hektarjev; ta postopek v celoti izpeljemo mi.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Ali moram za podpis potovati na Madžarsko?',
    answer: [
      'Ne. Na Madžarskem vas lahko zastopamo s pooblastilom, zato vam za podpis ni treba priti.',
      'Poskrbimo tudi za vpis v madžarsko zemljiško knjigo in prenos komunalnih priključkov.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'V katerem jeziku je sestavljena prodajna pogodba?',
    answer: [
      'Poskrbimo za dvojezične pogodbe, tako da preberete, kar podpišete.',
      `Okvirne cene: madžarsko od ${price('hu')}, nemško–madžarsko in angleško–madžarsko od ${price('de-hu')}, nizozemsko–madžarsko od ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Kaj natanko FODEL uredi pri nakupu?',
    answer: [
      '- Svetovanje po telefonu in e-pošti ter komunikacija med obema stranema',
      '- Osebni sestanki in ogledi na kraju samem',
      '- Sodelavec, ki govori vaš jezik in potuje z vami',
      '- Podpora pri pogajanjih o ceni',
      '- Priprava večjezične pogodbe',
      '- Izvedba celotnega nakupa',
      '- Vpis novega lastnika in prenos komunalnih priključkov',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Zakaj kupci iz zahodne Evrope izberejo Madžarsko?',
    answer: [
      '- Cene nepremičnin in življenjski stroški so precej nižji',
      '- Davek na nepremičnine se na Madžarskem praviloma ne obračunava',
      '- Več sonca in milejše podnebje',
      '- Država leži nad morsko gladino, sredi celine',
      '- Madžarska je država članica EU',
      '- Skoraj vse nepremičnine stojijo na zemljiščih v polni lasti',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Ali ima madžarska nepremičnina energetsko izkaznico?',
    answer: [
      'Da. Madžarska zahteva energetsko izkaznico (energiatanúsítvány), ki mora biti navedena v oglasu. V naših oglasih je razred naveden med lastnostmi; „v pripravi“ pomeni, da se izkaznica še pripravlja.',
      'Če prodajalec želi, lahko poskrbimo za izdelavo izkaznice.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Kaj je storitev iskanja in koliko stane?',
    answer: [
      'Storitev iskanja je brezplačna. Poveste nam, kaj iščete (vrsto, območje, proračun in želje), mi pa iščemo namesto vas, tudi zunaj nepremičnin na tej spletni strani.',
      'Naši madžarsko govoreči sodelavci pomagajo pri pogajanjih in poskrbijo, da je pogodba pravno pravilno sestavljena. Ko se pojavi kaj primernega, prejmete e-pošto.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Katera območja pokrivate?',
    answer: [
      'Poudarek je na Prekdonavju z županijami Baranya, Tolna, Zala, Somogy in Veszprém ter na Blatnem jezeru in Blatenskem višavju.',
      'Imamo tudi nepremičnine na nižini in na območjih z dobro povezavo do budimpeštanskega letališča.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Ne govorim madžarsko. Je to težava?',
    answer: [
      'Ne. Pri vsakem oglasu je navedeno, katere jezike govori lastnik, zato to veste vnaprej.',
      'Naša ekipa govori nizozemsko, nemško, angleško, francosko in madžarsko ter vas pospremi na ogled.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Kdaj vas lahko dosežem?',
    answer: [
      `Ob delavnikih med ${COMPANY.hours.weekdays.from} in ${COMPANY.hours.weekdays.to}. Če prosite za povratni klic, kličemo do ${COMPANY.hours.callback.to}, tudi ob koncih tedna.`,
      'Povratni klic vas nič ne stane. Klic plačamo mi.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
