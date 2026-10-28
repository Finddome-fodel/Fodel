/**
 * The confirmation a visitor gets after the "we search for you" form
 * (src/pages/api/search-request.ts).
 *
 * It used to share the generic "thanks for your message" acknowledgement with
 * the callback form, so a person who had just described the home they want got
 * a mail that never mentioned it. This one repeats back what they asked for.
 */
import { shell, textShell, h1, lead, small, facts, type ShellLocale } from './layout';
import type { Locale } from '~/i18n/ui';

type Copy = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  type: string;
  region: string;
  budget: string;
  requirements: string;
  outro: string;
};

const COPY: Record<Locale, Copy> = {
  hu: { subject: 'Megkaptuk a kerestetési kérését | FINDDOME', preheader: 'Elkezdjük a keresést, és jelentkezünk.', heading: 'Elkezdjük a keresést', intro: 'Köszönjük, megkaptuk a kérését. Munkatársunk átnézi, és hamarosan jelentkezik az első ötletekkel. Ezt kérte:', type: 'Típus', region: 'Régió', budget: 'Keret', requirements: 'Elvárások', outro: 'Ha változik az elképzelése, egyszerűen válaszoljon erre az e-mailre.' },
  nl: { subject: 'We hebben uw zoekopdracht ontvangen | FINDDOME', preheader: 'We gaan voor u op zoek en nemen contact op.', heading: 'We gaan voor u zoeken', intro: 'Bedankt, we hebben uw zoekopdracht ontvangen. Een collega bekijkt hem en neemt snel contact met u op met de eerste ideeën. Dit vroeg u:', type: 'Type', region: 'Regio', budget: 'Budget', requirements: 'Wensen', outro: 'Verandert uw wens? Beantwoord dan gewoon deze e-mail.' },
  en: { subject: 'We have received your search request | FINDDOME', preheader: 'We will start looking and get back to you.', heading: 'We will start looking', intro: 'Thank you, we have received your request. A colleague will review it and come back to you soon with first ideas. This is what you asked for:', type: 'Type', region: 'Region', budget: 'Budget', requirements: 'Requirements', outro: 'If your plans change, just reply to this e-mail.' },
  de: { subject: 'Wir haben Ihre Suchanfrage erhalten | FINDDOME', preheader: 'Wir beginnen mit der Suche und melden uns.', heading: 'Wir beginnen mit der Suche', intro: 'Vielen Dank, wir haben Ihre Anfrage erhalten. Ein Mitarbeiter prüft sie und meldet sich bald mit ersten Vorschlägen. Das haben Sie angegeben:', type: 'Art', region: 'Region', budget: 'Budget', requirements: 'Wünsche', outro: 'Ändern sich Ihre Pläne, antworten Sie einfach auf diese E-Mail.' },
  fr: { subject: 'Nous avons bien reçu votre demande de recherche | FINDDOME', preheader: 'Nous lançons la recherche et revenons vers vous.', heading: 'Nous lançons la recherche', intro: 'Merci, nous avons bien reçu votre demande. Un collaborateur l’étudie et vous recontacte bientôt avec de premières idées. Voici ce que vous avez indiqué :', type: 'Type', region: 'Région', budget: 'Budget', requirements: 'Souhaits', outro: 'Si votre projet change, répondez simplement à cet e-mail.' },
  es: { subject: 'Hemos recibido su solicitud de búsqueda | FINDDOME', preheader: 'Empezamos a buscar y le contactaremos.', heading: 'Empezamos a buscar', intro: 'Gracias, hemos recibido su solicitud. Un compañero la revisará y le contactará pronto con las primeras ideas. Esto es lo que nos indicó:', type: 'Tipo', region: 'Región', budget: 'Presupuesto', requirements: 'Requisitos', outro: 'Si cambian sus planes, responda sencillamente a este correo.' },
  pl: { subject: 'Otrzymaliśmy Twoje zlecenie wyszukania | FINDDOME', preheader: 'Zaczynamy szukać i wkrótce się odezwiemy.', heading: 'Zaczynamy szukać', intro: 'Dziękujemy, otrzymaliśmy Twoje zgłoszenie. Nasz pracownik je przejrzy i wkrótce odezwie się z pierwszymi propozycjami. Oto, o co prosisz:', type: 'Rodzaj', region: 'Region', budget: 'Budżet', requirements: 'Wymagania', outro: 'Jeśli Twoje plany się zmienią, po prostu odpowiedz na tę wiadomość.' },
  ro: { subject: 'Am primit cererea dvs. de căutare | FINDDOME', preheader: 'Începem căutarea și revenim cu un răspuns.', heading: 'Începem căutarea', intro: 'Vă mulțumim, am primit cererea dvs. Un coleg o va analiza și vă va contacta în curând cu primele idei. Iată ce ați cerut:', type: 'Tip', region: 'Regiune', budget: 'Buget', requirements: 'Cerințe', outro: 'Dacă planurile dvs. se schimbă, răspundeți pur și simplu la acest e-mail.' },
  sk: { subject: 'Dostali sme vašu požiadavku na vyhľadávanie | FINDDOME', preheader: 'Začíname hľadať a ozveme sa vám.', heading: 'Začíname hľadať', intro: 'Ďakujeme, vašu požiadavku sme dostali. Kolega ju posúdi a čoskoro sa vám ozve s prvými návrhmi. Toto ste uviedli:', type: 'Druh', region: 'Región', budget: 'Rozpočet', requirements: 'Požiadavky', outro: 'Ak sa vaše plány zmenia, jednoducho odpovedzte na tento e-mail.' },
  it: { subject: 'Abbiamo ricevuto la sua richiesta di ricerca | FINDDOME', preheader: 'Iniziamo la ricerca e la ricontatteremo.', heading: 'Iniziamo la ricerca', intro: 'Grazie, abbiamo ricevuto la sua richiesta. Un collega la esaminerà e la ricontatterà presto con le prime proposte. Ecco cosa ha indicato:', type: 'Tipo', region: 'Regione', budget: 'Budget', requirements: 'Requisiti', outro: 'Se i suoi piani cambiano, risponda semplicemente a questa e-mail.' },
  pt: { subject: 'Recebemos o seu pedido de pesquisa | FINDDOME', preheader: 'Vamos começar a procurar e entraremos em contacto.', heading: 'Vamos começar a procurar', intro: 'Obrigado, recebemos o seu pedido. Um colega irá analisá-lo e contactá-lo em breve com as primeiras ideias. Foi isto que indicou:', type: 'Tipo', region: 'Região', budget: 'Orçamento', requirements: 'Requisitos', outro: 'Se os seus planos mudarem, basta responder a este e-mail.' },
  el: { subject: 'Λάβαμε το αίτημα αναζήτησής σας | FINDDOME', preheader: 'Ξεκινάμε την αναζήτηση και θα επικοινωνήσουμε μαζί σας.', heading: 'Ξεκινάμε την αναζήτηση', intro: 'Σας ευχαριστούμε, λάβαμε το αίτημά σας. Συνάδελφός μας θα το εξετάσει και θα επικοινωνήσει σύντομα μαζί σας με τις πρώτες προτάσεις. Αυτό δηλώσατε:', type: 'Τύπος', region: 'Περιοχή', budget: 'Προϋπολογισμός', requirements: 'Απαιτήσεις', outro: 'Αν αλλάξουν τα σχέδιά σας, απλώς απαντήστε σε αυτό το μήνυμα.' },
  cs: { subject: 'Obdrželi jsme vaši poptávku na hledání | FINDDOME', preheader: 'Začínáme hledat a ozveme se vám.', heading: 'Začínáme hledat', intro: 'Děkujeme, vaši poptávku jsme obdrželi. Kolega ji posoudí a brzy se vám ozve s prvními nápady. Uvedli jste:', type: 'Druh', region: 'Region', budget: 'Rozpočet', requirements: 'Požadavky', outro: 'Pokud se vaše plány změní, stačí odpovědět na tento e-mail.' },
  sl: { subject: 'Prejeli smo vašo zahtevo za iskanje | FINDDOME', preheader: 'Začenjamo z iskanjem in se vam oglasimo.', heading: 'Začenjamo z iskanjem', intro: 'Hvala, vašo zahtevo smo prejeli. Sodelavec jo bo pregledal in se vam kmalu oglasil s prvimi predlogi. To ste navedli:', type: 'Vrsta', region: 'Regija', budget: 'Proračun', requirements: 'Zahteve', outro: 'Če se vaši načrti spremenijo, preprosto odgovorite na to e-pošto.' },
  sv: { subject: 'Vi har tagit emot din sökförfrågan | FINDDOME', preheader: 'Vi börjar söka och återkommer till dig.', heading: 'Vi börjar söka', intro: 'Tack, vi har tagit emot din förfrågan. En kollega granskar den och hör av sig snart med de första förslagen. Det här angav du:', type: 'Typ', region: 'Region', budget: 'Budget', requirements: 'Önskemål', outro: 'Om dina planer ändras, svara bara på det här mejlet.' },
  da: { subject: 'Vi har modtaget din søgeanmodning | FINDDOME', preheader: 'Vi begynder at lede og vender tilbage til dig.', heading: 'Vi begynder at lede', intro: 'Tak, vi har modtaget din anmodning. En kollega gennemgår den og vender snart tilbage med de første forslag. Det er det, du ønskede:', type: 'Type', region: 'Region', budget: 'Budget', requirements: 'Ønsker', outro: 'Hvis dine planer ændrer sig, skal du bare svare på denne e-mail.' },
  no: { subject: 'Vi har mottatt søkeforespørselen din | FINDDOME', preheader: 'Vi begynner å lete og tar kontakt.', heading: 'Vi begynner å lete', intro: 'Takk, vi har mottatt forespørselen din. En kollega går gjennom den og tar snart kontakt med de første forslagene. Dette oppga du:', type: 'Type', region: 'Region', budget: 'Budsjett', requirements: 'Ønsker', outro: 'Hvis planene dine endrer seg, svarer du bare på denne e-posten.' },
  fi: { subject: 'Olemme vastaanottaneet hakupyyntösi | FINDDOME', preheader: 'Aloitamme etsinnän ja otamme yhteyttä.', heading: 'Aloitamme etsinnän', intro: 'Kiitos, olemme vastaanottaneet pyyntösi. Kollegamme käy sen läpi ja ottaa pian yhteyttä ensimmäisten ehdotusten kanssa. Kerroit seuraavaa:', type: 'Tyyppi', region: 'Alue', budget: 'Budjetti', requirements: 'Toiveet', outro: 'Jos suunnitelmasi muuttuvat, vastaa vain tähän viestiin.' },
  et: { subject: 'Saime kätte teie otsingupäringu | FINDDOME', preheader: 'Alustame otsinguga ja anname teada.', heading: 'Alustame otsinguga', intro: 'Aitäh, saime teie päringu kätte. Kolleeg vaatab selle üle ja võtab peagi ühendust esimeste ettepanekutega. Te märkisite:', type: 'Tüüp', region: 'Piirkond', budget: 'Eelarve', requirements: 'Soovid', outro: 'Kui teie plaanid muutuvad, vastake lihtsalt sellele e-kirjale.' },
  lv: { subject: 'Esam saņēmuši jūsu meklēšanas pieprasījumu | FINDDOME', preheader: 'Sākam meklēt un sazināsimies ar jums.', heading: 'Sākam meklēt', intro: 'Paldies, esam saņēmuši jūsu pieprasījumu. Kolēģis to izskatīs un drīz sazināsies ar pirmajiem priekšlikumiem. Jūs norādījāt:', type: 'Veids', region: 'Reģions', budget: 'Budžets', requirements: 'Prasības', outro: 'Ja jūsu plāni mainās, vienkārši atbildiet uz šo e-pastu.' },
  lt: { subject: 'Gavome jūsų paieškos užklausą | FINDDOME', preheader: 'Pradedame ieškoti ir susisieksime su jumis.', heading: 'Pradedame ieškoti', intro: 'Dėkojame, gavome jūsų užklausą. Kolega ją peržiūrės ir netrukus susisieks su pirmaisiais pasiūlymais. Nurodėte:', type: 'Tipas', region: 'Regionas', budget: 'Biudžetas', requirements: 'Pageidavimai', outro: 'Jei jūsų planai pasikeis, tiesiog atsakykite į šį laišką.' },
};

const money = (v: string | undefined) => (v ? `€ ${Number(v).toLocaleString('en-US').replace(/,/g, ' ')}` : '');

export function searchRequestReceived(
  locale: ShellLocale,
  a: { name?: string; propertyType?: string; region?: string; budgetMin?: string; budgetMax?: string; requirements?: string }
): { subject: string; html: string; text: string } {
  const c = COPY[locale] ?? COPY.en;
  const budget = a.budgetMin && a.budgetMax ? `${money(a.budgetMin)} – ${money(a.budgetMax)}` : a.budgetMax ? `≤ ${money(a.budgetMax)}` : a.budgetMin ? `≥ ${money(a.budgetMin)}` : '';
  const rows = ([[c.type, a.propertyType], [c.region, a.region], [c.budget, budget], [c.requirements, a.requirements]] as [string, string | undefined][]).filter(([, v]) => v) as [string, string][];
  return {
    subject: c.subject,
    html: shell({ locale, preheader: c.preheader, body: h1(c.heading) + lead(c.intro) + (rows.length ? facts(rows) : '') + small(c.outro), audience: 'visitor' }),
    text: textShell({ locale, body: `${c.heading}\n\n${c.intro}\n\n${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\n\n${c.outro}`, audience: 'visitor' }),
  };
}
