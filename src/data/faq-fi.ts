/**
 * FAQ, Finnish (standard "sinä"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'fi' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_FI = [
  {
    id: 'direct-from-the-owner',
    question: 'Mitä ”suoraan omistajalta” tarkoittaa?',
    answer: [
      'Suuressa osassa kohteitamme julkaisemme omistajan nimen ja puhelinnumeron omien yhteystietojemme rinnalla. Voit ottaa yhteyttä suoraan myyjään.',
      'Jos otat suoraan yhteyttä ja sovitte kaupasta keskenänne, kukaan ei maksa palkkiota: et sinä eikä myyjä. Saamme silloin maksun vain ilmoituksesta.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Mitä välityksenne maksaa?',
    answer: [
      `Palkkiomme on ${COMMISSION.percent}\u00a0% netto, vähintään ${eur(COMMISSION.minimumEur, L)}, lisäksi ${COMMISSION.vatPercent}\u00a0% Alankomaiden ALV. Sen maksaa unkarilainen myyjä, et sinä.`,
      'Laskutamme vain, kun kaikki kolme ehtoa täyttyvät: kirjallinen kauppakirja on olemassa, ostajan on tuonut FODEL ja käsiraha on maksettu.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Voinko EU-kansalaisena ostaa kiinteistön Unkarista?',
    answer: [
      'Kyllä. EU-kansalaisena ostat taloja ja tontteja Unkarista käytännössä samoin ehdoin kuin unkarilainen. Lähes 100\u00a0% unkarilaisista kiinteistöistä sijaitsee omalla maalla. Vuokratontit, kuten hollantilainen erfpacht, ovat harvinaisia.',
      `Maatalousmaata koskevat omat sääntönsä. Maatalousalan pätevyyden omaava EU-kansalainen voi hankkia Unkarista enintään ${AGRI_HECTARE_LIMIT} hehtaaria; hoidamme menettelyn kokonaan.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Pitääkö minun matkustaa Unkariin allekirjoittamaan?',
    answer: [
      'Ei. Voimme edustaa sinua Unkarissa valtakirjalla, joten sinun ei tarvitse tulla paikalle allekirjoitusta varten.',
      'Hoidamme myös rekisteröinnin Unkarin kiinteistörekisteriin ja liittymien siirron.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Millä kielellä kauppakirja laaditaan?',
    answer: [
      'Teetämme kaksikieliset sopimukset, joten luet sen, minkä allekirjoitat.',
      `Suuntaa-antavat hinnat: unkari alk. ${price('hu')}, saksa–unkari ja englanti–unkari alk. ${price('de-hu')}, hollanti–unkari alk. ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Mitä FODEL tarkalleen hoitaa, kun ostat?',
    answer: [
      '- Neuvonta puhelimitse ja sähköpostitse sekä viestintä osapuolten välillä',
      '- Henkilökohtaiset tapaamiset ja esittelyt paikan päällä',
      '- Kieltäsi puhuva kollega, joka matkustaa kanssasi',
      '- Tukea hintaneuvotteluissa',
      '- Monikielisen sopimuksen laatiminen',
      '- Koko kaupan hoitaminen',
      '- Uuden omistajan rekisteröinti ja liittymien siirto',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Miksi länsieurooppalaiset ostajat valitsevat Unkarin?',
    answer: [
      '- Kiinteistöjen hinnat ja elinkustannukset ovat huomattavasti alhaisemmat',
      '- Kiinteistöveroa ei Unkarissa yleensä peritä',
      '- Enemmän aurinkoa ja leudompi ilmasto',
      '- Maa sijaitsee merenpinnan yläpuolella keskellä mannerta',
      '- Unkari on EU:n jäsenvaltio',
      '- Lähes kaikki kiinteistöt sijaitsevat omalla maalla',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Onko unkarilaisella kiinteistöllä energiatodistus?',
    answer: [
      'Kyllä. Unkari edellyttää energiatodistusta (energiatanúsítvány), joka on mainittava ilmoituksessa. Ilmoituksissamme luokka näkyy ominaisuuksien kohdalla; ”tekeillä” tarkoittaa, että todistusta laaditaan vielä.',
      'Jos myyjä haluaa, voimme teettää todistuksen hänen puolestaan.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Mikä hakupalvelu on ja mitä se maksaa?',
    answer: [
      'Hakupalvelu on maksuton. Kerrot meille, mitä etsit (tyyppi, alue, budjetti ja toiveet), ja etsimme puolestasi, myös tämän sivuston kohteiden ulkopuolelta.',
      'Unkaria puhuvat kollegamme auttavat neuvotteluissa ja huolehtivat siitä, että sopimus laaditaan juridisesti oikein. Saat sähköpostin heti, kun jotain sopivaa löytyy.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Mitä alueita katatte?',
    answer: [
      'Painopiste on Transdanubiassa: Baranyan, Tolnan, Zalan, Somogyn ja Veszprémin läänit sekä Balaton-järvi ja Balatonin ylänkö.',
      'Meillä on kohteita myös tasangolla ja alueilla, joilta on hyvät yhteydet Budapestin lentoasemalle.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'En puhu unkaria. Onko se ongelma?',
    answer: [
      'Ei. Jokaisessa ilmoituksessa kerrotaan, mitä kieliä omistaja puhuu, joten tiedät sen etukäteen.',
      'Tiimimme puhuu hollantia, saksaa, englantia, ranskaa ja unkaria ja tulee mukaan esittelyyn.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Milloin tavoitan teidät?',
    answer: [
      `Arkisin klo ${COMPANY.hours.weekdays.from}–${COMPANY.hours.weekdays.to}. Jos pyydät takaisinsoittoa, soitamme klo ${COMPANY.hours.callback.to} asti, myös viikonloppuisin.`,
      'Takaisinsoitto ei maksa sinulle mitään. Maksamme puhelun.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
