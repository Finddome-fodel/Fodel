/**
 * Legal pages, Finnish (standard "sinä"). A faithful translation of the Dutch pages
 * (src/data/pages-legal.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. It needs the client's and a lawyer's sign-off before
 * launch, like the Hungarian and Dutch originals. Every sentence that leans on
 * Dutch or Hungarian law (GDPR roles, Dutch VAT, the Dutch regulator, the
 * right of withdrawal, the ODR platform) is listed in Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'fi' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27. heinäkuuta 2026';
const notice =
  'Tämä on käännös lukemisen helpottamiseksi. Ristiriitatilanteessa sovelletaan hollanninkielistä (Alankomaiden lakia koskevissa asioissa) tai unkarinkielistä alkuperäistekstiä.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_FI = {
  imprint: {
    metaTitle: 'Yritystiedot: yhteys- ja yritystiedot',
    metaDescription: `Yrityksen ${COMPANY.names.legal} tiedot: kotipaikan osoite, ALV-tunniste, KvK-numero ja yhteystiedot.`,
    eyebrow: 'Yritystiedot',
    title: 'Yrityksen',
    titleEm: 'tiedot',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Palveluntarjoajan tiedot',
        rows: [
          ['Toiminimi', COMPANY.names.legal],
          ['Kotipaikan osoite', addressLine(COMPANY.address, L)],
          ['ALV-tunniste', COMPANY.registration.vat],
          ['KvK-numero (Alankomaiden kauppakamari)', kvk],
          ['Edustaja', COMPANY.principal],
          ['Sähköposti', COMPANY.email.primary],
          ['Puhelin', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Perustettu', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Pankkitilit',
        rows: [
          ['Alankomaat', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Unkarista', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Riidat',
        body: 'Kuluttajariidassa voit käyttää myös EU:n verkkovälitteistä riidanratkaisufoorumia: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Tietoa tietosuojasta',
    metaDescription:
      'Miten FODEL käsittelee henkilötietojasi: mitä tietoja käsittelemme, kuinka kauan säilytämme niitä ja mitkä oikeudet sinulla on GDPR:n mukaan.',
    eyebrow: 'Tietosuoja',
    title: 'Tietoa',
    titleEm: 'tietosuojasta',
    intro:
      'Tässä selosteessa kerrotaan, miten käsittelemme tämän sivuston kautta antamiasi henkilötietoja GDPR:n mukaisesti.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Rekisterinpitäjä',
        rows: [
          ['Rekisterinpitäjä', COMPANY.names.legal],
          ['Osoite', addressLine(COMPANY.address, L)],
          ['Sähköposti', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Mitä tietoja käsittelemme',
        intro: 'Vain tiedot, jotka itse syötät lomakkeisiimme:',
        items: [
          'Nimi, sähköpostiosoite ja puhelinnumero: jotta voimme vastata yhteydenottoosi',
          'Viestisi aihe ja sisältö',
          'Ilmoituksen osalta: kiinteistön tiedot ja laskutustietosi',
          'Hakupyynnön osalta: hakuehtosi',
          'Sisäistä hallintoa varten: milloin ja minkä lomakkeen täytit ja milloin kirjauduit portaaliin, ilman IP-osoitteen tallentamista',
        ],
      },
      {
        type: 'table',
        title: 'Oikeusperuste ja säilytysaika',
        rows: [
          ['Yhteydenotto ja takaisinsoittopyyntö', 'Suostumus (GDPR 6 artiklan 1 kohdan a alakohta): 12 kuukautta'],
          ['Ilmoitustilaus', 'Sopimuksen täytäntöönpano (6 artiklan 1 kohdan b alakohta): 7 vuotta, lakisääteinen verotuksellinen säilytys'],
          ['Hakupyyntö', 'Suostumus: kunnes asia on hoidettu, enintään 24 kuukautta'],
          ['Sisäinen toimintaloki', 'Oikeutettu etu (6 artiklan 1 kohdan f alakohta): asianmukainen hallinto ja väärinkäytösten havaitseminen: enintään 24 kuukautta'],
        ],
      },
      {
        type: 'list',
        title: 'Kenen kanssa jaamme tietoja',
        intro: 'Emme myy tietojasi emmekä jaa niitä markkinointitarkoituksiin. Henkilötietojen käsittelijämme ovat:',
        items: [
          'Sähköpostipalvelumme tarjoaja, joka käsittelee tiedot EU:n alueella',
          'Tämän sivuston palveluntarjoaja (hosting)',
          'Kaupan yhteydessä ja vain pyynnöstäsi: toinen osapuoli ja asiaan osallistuva asianajaja',
        ],
      },
      {
        type: 'callout',
        title: 'Ilmoituksista',
        body: 'Ilmoittajana voit antaa meille luvan näyttää nimesi ja puhelinnumerosi ilmoituksessa, jotta kiinnostuneet voivat ottaa sinuun suoraan yhteyttä. Voit perua luvan milloin tahansa; poistamme silloin tiedot ilmoituksesta.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Uutiskirje',
        body: 'Jos tilaat uutiskirjeemme, käsittelemme sähköpostiosoitettasi, valitsemaasi kieltä sekä tilaus- ja vahvistusajankohtaa ainoastaan uutiskirjeen lähettämiseksi suostumuksesi perusteella. Tilaus tehdään kahdessa vaiheessa: emme lähetä mitään ennen kuin olet napsauttanut vahvistusviestin painiketta. Jokaisessa viestissä voit perua tilauksen yhdellä napsautuksella, ja lopetamme heti. Lähetykseen käytämme Resend-palvelua.',
      },
      {
        type: 'list',
        title: 'Oikeutesi',
        items: [
          'Pääsy sinua koskeviin käsittelemiimme tietoihin',
          'Oikaisu ja poistaminen',
          'Käsittelyn rajoittaminen tai sen vastustaminen',
          'Siirto-oikeus',
          'Suostumuksen peruuttaminen milloin tahansa',
          'Valituksen tekeminen Alankomaiden tietosuojaviranomaiselle (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Tietosuojaa koskevat yhteydenotot',
        paragraphs: [`Voit lähettää kysymyksiä tai pyyntöjä osoitteeseen ${COMPANY.email.primary}. Vastaamme viimeistään 30 päivän kuluessa.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Tietoa evästeistä',
    metaDescription: `Mitä evästeitä ${SITE_HOST} käyttää ja miten voit muuttaa valintaasi.`,
    eyebrow: 'Evästeet',
    title: 'Tietoa',
    titleEm: 'evästeistä',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Tällä hetkellä sivusto käyttää vain teknisesti välttämätöntä tallennusta. Emme käytä mainos- tai seurantaskriptejä emmekä jaa mitään sosiaalisen median palveluille.',
        ],
      },
      {
        type: 'table',
        title: 'Mitä tallennamme',
        rows: [
          [
            'fodel:consent',
            'Evästevalintasi (hyväksytty tai hylätty). Se tallennetaan selaimeesi eikä tule meille. Säilytysaika: 12 kuukautta.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Tilastot',
        paragraphs: [
          'Jos joskus keräämme kävijätilastoja, otamme ne käyttöön vain etukäteen antamallasi nimenomaisella suostumuksella. Kieltäytyminen ei rajoita sivuston käyttöä mitenkään.',
        ],
      },
      {
        type: 'prose',
        title: 'Valinnan muuttaminen',
        paragraphs: [
          'Voit muuttaa valintaasi milloin tahansa tyhjentämällä tämän sivuston tallennetut selaintiedot; evästeilmoitus näkyy silloin uudelleen.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Palvelun käyttöehdot',
    metaDescription:
      'FODELin ilmoitus- ja välityspalvelun ehdot: hinnat, palkkio, peruminen ja vastuu.',
    eyebrow: 'Ehdot',
    title: 'Palvelun',
    titleEm: 'käyttöehdot',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Huomaa',
        body: 'Tämä sivu on tiivistelmä. Täydelliset, sitovat ehdot ovat saatavilla PDF-tiedostona; ristiriitatilanteessa PDF on ensisijainen.',
      },
      {
        type: 'prose',
        title: '1. Palvelu',
        paragraphs: [
          'FODEL ilmoittaa unkarilaisia kiinteistöjä omilla monikielisillä sivustoillaan ja avustaa erillisen sopimuksen perusteella kaupan toteuttamisessa.',
          'Ilmoituspalveluun ei liity yksinoikeutta: myyjä voi tarjota ja myydä kiinteistön myös muita kanavia pitkin.',
        ],
      },
      {
        type: 'list',
        title: '2. Ilmoituksen jättäminen',
        ordered: true,
        items: [
          'Myyjä täyttää rekisteröintilomakkeen.',
          'FODEL lähettää maksupyynnön valitusta paketista.',
          'Myyjä maksaa tilisiirrolla.',
          'Kun maksu on saapunut, myyjä saa oikeuden ladata kuvia.',
          'FODEL hoitaa käännöksen ja julkaisee ilmoituksen.',
        ],
      },
      {
        type: 'table',
        title: '3. Hinnat',
        intro: `Kaikki hinnat sisältävät ${LISTING_VAT_PERCENT}\u00a0%:n Alankomaiden ALV:n. Täydellinen yleiskatsaus on Hinnat-sivulla.`,
        rows: [
          [`Edullinen ilmoitus (${cheap.months} kk)`, eur(cheap.priceEur, L)],
          [`Vakioilmoitus (${normal.months} kk)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Käännös', `${eur(extra('translation').priceEur, L)} / kieli`],
          [
            'Korostus',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} kuukaudessa (väh. ${minMonths} kk)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Palkkio',
        paragraphs: [
          'Palkkio erääntyy vain, kun kaikki seuraavat täyttyvät: kirjallinen kauppakirja, FODELin tuoma ostaja ja maksettu käsiraha.',
          `Palkkio on ${COMMISSION.percent}\u00a0% netto, vähintään ${eur(COMMISSION.minimumEur, L)}, lisäksi ${COMMISSION.vatPercent}\u00a0% Alankomaiden ALV.`,
          'Jos kiinnostunut ottaa suoraan yhteyttä myyjään eikä apuamme kaupan toteuttamisessa tarvita, mitään ei makseta ilmoitusmaksun lisäksi.',
        ],
      },
      {
        type: 'prose',
        title: '5. Ilmoituksen poistaminen',
        paragraphs: [
          'Myyjä voi poistaa ilmoituksen ennen sen päättymispäivää. Jo maksettuja ilmoitusmaksuja ei tällöin palauteta.',
        ],
      },
      {
        type: 'prose',
        title: '6. Vastuu',
        paragraphs: [
          'Myyjä vastaa kiinteistöä koskevien tietojen oikeellisuudesta. FODEL julkaisee toimitetut tiedot eikä vastaa niiden paikkansapitävyydestä.',
          'Sivuston käännökset ovat tiedoksi; riitatilanteessa unkarinkielinen versio on ensisijainen.',
        ],
      },
      {
        type: 'prose',
        title: '7. Peruuttamisoikeus',
        paragraphs: [
          'Kuluttajana toimivalla myyjällä on etäsopimuksia koskeva lakisääteinen peruuttamisoikeus. Jos myyjä nimenomaisesti pyytää palvelun aloittamista heti, peruuttamisoikeus kapenee jo suoritetun palvelun suhteessa.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Tietoa saavutettavuudesta',
    metaDescription: `${SITE_HOST}-sivuston saavutettavuuden taso, noudattamamme standardi ja miten voit antaa palautetta.`,
    eyebrow: 'Saavutettavuus',
    title: 'Tietoa',
    titleEm: 'saavutettavuudesta',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Haluamme, että kaikki voivat käyttää sivustoa, myös ruudunlukijaa, näppäimistöä tai suurennusta käyttävät kävijät.',
          'Rakennamme sivuston WCAG 2.2 -ohjeiston AA-tason mukaisesti. Huomattava osa kävijöistämme on eläkeläisiä, joten tekstin koko, kontrasti ja näppäimistökäyttö ovat etusijalla.',
        ],
      },
      {
        type: 'list',
        title: 'Mitä on jo toteutettu',
        items: [
          'Kaiken tekstin kontrastisuhde on vähintään 4,5:1',
          'Täysi näppäimistökäyttö ja näkyvä kohdistuksen ilmaisin',
          '”Siirry sisältöön” -linkki jokaisen sivun yläosassa',
          'Kuvaavat vaihtoehtoiset tekstit kaikissa kuvissa',
          'Lomakekentät, joihin on liitetty nimiöt ja tekstimuotoiset virheilmoitukset',
          'Järjestelmäasetuksen ”vähennä liikettä” noudattaminen',
          'Sivusto on luettavissa ja käytettävissä ilman JavaScriptiä',
        ],
      },
      {
        type: 'prose',
        title: 'Tunnetut rajoitukset',
        paragraphs: ['Emme voi vaikuttaa kolmansien osapuolten sisällön, kuten karttapalvelun, saavutettavuuteen.'],
      },
      {
        type: 'prose',
        title: 'Palaute',
        paragraphs: [
          `Jos kohtaat esteen, ilmoita siitä osoitteeseen ${COMPANY.email.primary} tai puhelimitse. Käsittelemme ilmoitukset niin nopeasti kuin mahdollista.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
