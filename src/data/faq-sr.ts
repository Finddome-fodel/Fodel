/**
 * FAQ, Serbian, Latin script (formal Vi). Buyer-facing, translated from the English set (src/data/faq-en.ts):
 * same ids, same order; every figure comes from src/config/company.ts.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'sr' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_SR = [
  {
    id: 'direct-from-the-owner',
    question: 'Šta znači „direktno od vlasnika”?',
    answer: [
      'Za veliki deo naše ponude objavljujemo ime i broj telefona vlasnika pored naših podataka. Prodavca možete kontaktirati direktno.',
      'Ako ga kontaktirate direktno i sami dogovorite kupovinu, niko ne plaća proviziju: ni Vi ni prodavac. Mi tada naplaćujemo samo oglas.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Koliko košta vaše posredovanje?',
    answer: [
      `Naša provizija iznosi ${COMMISSION.percent}% neto, najmanje ${eur(COMMISSION.minimumEur, L)}, uz holandski PDV od ${COMMISSION.vatPercent}%. Plaća je mađarski prodavac, a ne Vi.`,
      'Fakturišemo samo kada su ispunjena sva tri uslova: postoji pisani kupoprodajni ugovor, kupca je doveo FINDDOME i kapar je uplaćen.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Mogu li kao građanin EU da kupim nekretninu u Mađarskoj?',
    answer: [
      'Da. Kao građanin EU kuće i placeve u Mađarskoj kupujete praktično pod istim uslovima kao i Mađar. Gotovo 100% mađarskih nekretnina nalazi se na zemljištu u punom vlasništvu. Zakupni aranžmani poput holandskog erfpachta su retki.',
      `Za poljoprivredno zemljište važe posebna pravila. Građanin EU sa poljoprivrednom kvalifikacijom može u Mađarskoj steći do ${AGRI_HECTARE_LIMIT} hektara; taj postupak u potpunosti preuzimamo mi.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Da li moram da putujem u Mađarsku radi potpisivanja?',
    answer: [
      'Ne. Možemo Vas zastupati u Mađarskoj na osnovu punomoćja, pa ne morate dolaziti na potpisivanje.',
      'Brinemo se i o upisu u mađarski katastar nepokretnosti i o prenosu komunalnih usluga.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Na kom jeziku se sastavlja kupoprodajni ugovor?',
    answer: [
      'Dajemo da se sastave dvojezični ugovori, tako da razumete šta potpisujete.',
      `Okvirne cene: na mađarskom od ${price('hu')}, nemačko-mađarski i englesko-mađarski od ${price('de-hu')}, holandsko-mađarski od ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Šta tačno FINDDOME sređuje pri kupovini?',
    answer: [
      '- Savetovanje telefonom i e-poštom i komunikaciju između obe strane',
      '- Lične sastanke i razgledanja na licu mesta',
      '- Kolegu koji govori Vaš jezik i putuje sa Vama',
      '- Podršku u pregovorima o ceni',
      '- Pripremu višejezičnog ugovora',
      '- Vođenje celokupne kupovine',
      '- Upis novog vlasnika i prenos komunalnih usluga',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Zašto kupci iz Zapadne Evrope biraju Mađarsku?',
    answer: [
      '- Nekretnine i troškovi života znatno su niži',
      '- Porez na imovinu se u Mađarskoj po pravilu ne naplaćuje',
      '- Više sunca i blaža klima',
      '- Zemlja leži iznad nivoa mora, u srcu kontinenta',
      '- Mađarska je država članica EU',
      '- Gotovo sve nekretnine nalaze se na zemljištu u punom vlasništvu',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Da li mađarska nekretnina ima energetski sertifikat?',
    answer: [
      'Da. Mađarska zahteva sertifikat o energetskim svojstvima (energiatanúsítvány), koji mora biti naveden u oglasu. U našim oglasima razred se nalazi među karakteristikama; „u izradi” znači da se sertifikat još priprema.',
      'Ako prodavac želi, možemo organizovati izradu sertifikata.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Šta je usluga pretrage i koliko košta?',
    answer: [
      'Usluga pretrage je besplatna. Recite nam šta tražite (tip, oblast, budžet i želje), a mi tražimo za Vas, i van nekretnina na ovom sajtu.',
      'Naše kolege koje govore mađarski pomažu u pregovorima i staraju se da ugovor bude pravno ispravno sastavljen. E-poruku dobijate čim se pojavi nešto odgovarajuće.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Koje oblasti pokrivate?',
    answer: [
      'Fokus je na Zadunavlju, sa županijama Baranja, Tolna, Zala, Šomođ i Vesprem, kao i na Balatonu i Balatonskom pobrđu.',
      'Imamo nekretnine i u ravnici, kao i u oblastima sa dobrom vezom do budimpeštanskog aerodroma.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Ne govorim mađarski. Da li je to problem?',
    answer: [
      'Nije. U svakom oglasu piše koje jezike vlasnik govori, pa to znate unapred.',
      'Naš tim govori holandski, nemački, engleski, francuski i mađarski i ide sa Vama na razgledanje.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Kada mogu da vas dobijem?',
    answer: [
      `Radnim danima od ${COMPANY.hours.weekdays.from} do ${COMPANY.hours.weekdays.to}. Ako zatražite povratni poziv, zovemo do ${COMPANY.hours.callback.to}, i vikendom.`,
      'Povratni poziv Vas ništa ne košta. Mi plaćamo poziv.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
