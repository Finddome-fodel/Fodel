/**
 * Unsubscribing from FINDDOME's bulk template mail.
 *
 * Every bulk email carries a link to /mail/unsubscribe, signed for the
 * recipient's address (never expires in practice: ten years). The page asks
 * for one click to confirm rather than acting on the GET — corporate link
 * scanners open every link in an email, and would otherwise unsubscribe people
 * who never clicked. Confirming adds the address to mail_suppressions and, if
 * it is also on the newsletter list, unsubscribes it there too: someone who
 * says "no more of this" means all of it.
 *
 * The footer line and the page are in the email's language, all 21.
 */
import { SITE_URL } from '~/config/site.mjs';
import { signAction, verifyAction } from '~/lib/valuation/action-token';
import { localeFrom, type Locale } from '~/i18n/ui';

const VALID_DAYS = 3650;

const b64url = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
export const decodeAddress = (value: string) => {
  try {
    return Buffer.from(value, 'base64url').toString('utf8');
  } catch {
    return '';
  }
};

export function unsubscribeUrl(email: string, locale: string): string {
  const address = email.trim().toLowerCase();
  const token = signAction('mail-unsubscribe', address, VALID_DAYS);
  return `${SITE_URL}/mail/unsubscribe?e=${b64url(address)}&t=${token}&l=${localeFrom(locale)}`;
}

export function verifyUnsubscribe(encoded: string, token: string): string | null {
  const address = decodeAddress(encoded).trim().toLowerCase();
  if (!address.includes('@')) return null;
  try {
    return verifyAction('mail-unsubscribe', address, token) ? address : null;
  } catch {
    return null;
  }
}

type UnsubscribeCopy = {
  /** Footer sentence; {link} becomes the linked word(s) in `linkText`. */
  footer: string;
  linkText: string;
  confirmTitle: string;
  confirmBody: string;
  button: string;
  doneTitle: string;
  doneBody: string;
  invalidTitle: string;
  invalidBody: string;
  /** The confirm button could not save (database down): try again or write to us. */
  failBody: string;
  home: string;
};

export const UNSUBSCRIBE_COPY: Record<Locale, UnsubscribeCopy> = {
  hu: { footer: 'Ha nem szeretne több ilyen levelet kapni, {link}.', linkText: 'itt leiratkozhat', confirmTitle: 'Leiratkozás', confirmBody: 'Biztosan nem kér több körlevelet a FINDDOME-tól erre a címre:', button: 'Leiratkozom', doneTitle: 'Sikeresen leiratkozott', doneBody: 'Erre a címre több körlevelet nem küldünk. A hirdetéséhez vagy számlájához kapcsolódó értesítéseket továbbra is megkapja.', invalidTitle: 'Ez a link nem érvényes', invalidBody: 'Ha le szeretne iratkozni, írjon nekünk, és intézzük.', failBody: 'Valami hiba történt, a leiratkozást nem sikerült rögzíteni. Kérjük, próbálja újra néhány perc múlva, vagy írjon nekünk, és intézzük.', home: 'Vissza a főoldalra' },
  nl: { footer: 'Wilt u dit soort e-mails niet meer ontvangen? {link}.', linkText: 'Meld u hier af', confirmTitle: 'Afmelden', confirmBody: 'Weet u zeker dat u geen mailings van FINDDOME meer wilt ontvangen op dit adres:', button: 'Afmelden', doneTitle: 'U bent afgemeld', doneBody: 'Wij sturen geen mailings meer naar dit adres. Berichten over uw advertentie of factuur ontvangt u wel.', invalidTitle: 'Deze link is niet geldig', invalidBody: 'Wilt u zich afmelden? Stuur ons een bericht, dan regelen wij het.', failBody: 'Er ging iets mis en uw afmelding is niet opgeslagen. Probeer het over een paar minuten opnieuw, of stuur ons een bericht, dan regelen wij het.', home: 'Naar de homepage' },
  en: { footer: 'If you would rather not receive emails like this, {link}.', linkText: 'unsubscribe here', confirmTitle: 'Unsubscribe', confirmBody: 'Stop all mailings from FINDDOME to this address:', button: 'Unsubscribe', doneTitle: 'You are unsubscribed', doneBody: 'We will send no more mailings to this address. Messages about your listing or invoice will still reach you.', invalidTitle: 'This link is not valid', invalidBody: 'To unsubscribe, just write to us and we will take care of it.', failBody: 'Something went wrong and your unsubscribe was not saved. Please try again in a few minutes, or write to us and we will take care of it.', home: 'Back to the homepage' },
  de: { footer: 'Wenn Sie keine solchen E-Mails mehr erhalten möchten, {link}.', linkText: 'melden Sie sich hier ab', confirmTitle: 'Abmelden', confirmBody: 'Keine Mailings von FINDDOME mehr an diese Adresse:', button: 'Abmelden', doneTitle: 'Sie sind abgemeldet', doneBody: 'Wir senden keine Mailings mehr an diese Adresse. Nachrichten zu Ihrem Inserat oder Ihrer Rechnung erhalten Sie weiterhin.', invalidTitle: 'Dieser Link ist ungültig', invalidBody: 'Schreiben Sie uns einfach, wenn Sie sich abmelden möchten.', failBody: 'Leider ist etwas schiefgegangen, Ihre Abmeldung wurde nicht gespeichert. Bitte versuchen Sie es in ein paar Minuten erneut oder schreiben Sie uns, dann erledigen wir das.', home: 'Zur Startseite' },
  fr: { footer: 'Si vous ne souhaitez plus recevoir ce type d’e-mails, {link}.', linkText: 'désabonnez-vous ici', confirmTitle: 'Désabonnement', confirmBody: 'Ne plus recevoir d’envois de FINDDOME à cette adresse :', button: 'Me désabonner', doneTitle: 'Vous êtes désabonné', doneBody: 'Nous n’enverrons plus d’envois groupés à cette adresse. Les messages concernant votre annonce ou votre facture vous parviendront toujours.', invalidTitle: 'Ce lien n’est pas valable', invalidBody: 'Pour vous désabonner, écrivez-nous simplement.', failBody: 'Une erreur s’est produite et votre désabonnement n’a pas été enregistré. Veuillez réessayer dans quelques minutes, ou écrivez-nous et nous nous en occuperons.', home: 'Retour à l’accueil' },
  es: { footer: 'Si prefiere no recibir más correos como este, {link}.', linkText: 'dese de baja aquí', confirmTitle: 'Darse de baja', confirmBody: 'Dejar de recibir envíos de FINDDOME en esta dirección:', button: 'Darme de baja', doneTitle: 'Baja confirmada', doneBody: 'No enviaremos más envíos a esta dirección. Seguirá recibiendo los mensajes sobre su anuncio o su factura.', invalidTitle: 'Este enlace no es válido', invalidBody: 'Para darse de baja, escríbanos y nos encargaremos.', failBody: 'Algo ha fallado y no se ha registrado su baja. Vuelva a intentarlo dentro de unos minutos o escríbanos y nos encargaremos.', home: 'Volver a la página de inicio' },
  pl: { footer: 'Jeśli nie chcą Państwo otrzymywać takich wiadomości, {link}.', linkText: 'można się wypisać tutaj', confirmTitle: 'Wypisanie się', confirmBody: 'Nie wysyłać już korespondencji od FINDDOME na ten adres:', button: 'Wypisz mnie', doneTitle: 'Wypisano', doneBody: 'Nie będziemy już wysyłać korespondencji na ten adres. Wiadomości dotyczące ogłoszenia lub faktury nadal będą docierać.', invalidTitle: 'Ten link jest nieważny', invalidBody: 'Aby się wypisać, wystarczy do nas napisać.', failBody: 'Coś poszło nie tak i wypisanie nie zostało zapisane. Prosimy spróbować ponownie za kilka minut lub do nas napisać – zajmiemy się tym.', home: 'Powrót do strony głównej' },
  ro: { footer: 'Dacă nu mai doriți astfel de e-mailuri, {link}.', linkText: 'vă puteți dezabona aici', confirmTitle: 'Dezabonare', confirmBody: 'Nu mai trimiteți mesaje FINDDOME la această adresă:', button: 'Mă dezabonez', doneTitle: 'V-ați dezabonat', doneBody: 'Nu vom mai trimite mesaje la această adresă. Mesajele despre anunțul sau factura dvs. vă vor parveni în continuare.', invalidTitle: 'Acest link nu este valabil', invalidBody: 'Pentru dezabonare, scrieți-ne și ne ocupăm noi.', failBody: 'A apărut o eroare și dezabonarea nu a fost înregistrată. Vă rugăm să încercați din nou peste câteva minute sau să ne scrieți și ne ocupăm noi.', home: 'Înapoi la prima pagină' },
  sk: { footer: 'Ak si neželáte dostávať takéto e-maily, {link}.', linkText: 'odhláste sa tu', confirmTitle: 'Odhlásenie', confirmBody: 'Už neposielať hromadné správy FINDDOME na túto adresu:', button: 'Odhlásiť sa', doneTitle: 'Ste odhlásený', doneBody: 'Na túto adresu už nebudeme posielať hromadné správy. Správy o vašom inzeráte alebo faktúre dostanete aj naďalej.', invalidTitle: 'Tento odkaz nie je platný', invalidBody: 'Ak sa chcete odhlásiť, stačí nám napísať.', failBody: 'Niečo sa pokazilo a odhlásenie sa neuložilo. Skúste to, prosím, znova o pár minút alebo nám napíšte a vybavíme to.', home: 'Späť na úvodnú stránku' },
  it: { footer: 'Se preferisce non ricevere più e-mail come questa, {link}.', linkText: 'annulli l’iscrizione qui', confirmTitle: 'Annulla iscrizione', confirmBody: 'Non ricevere più invii di FINDDOME a questo indirizzo:', button: 'Annulla iscrizione', doneTitle: 'Iscrizione annullata', doneBody: 'Non invieremo più comunicazioni a questo indirizzo. I messaggi sul Suo annuncio o sulla Sua fattura Le arriveranno comunque.', invalidTitle: 'Questo link non è valido', invalidBody: 'Per annullare l’iscrizione, ci scriva e ce ne occuperemo noi.', failBody: 'Qualcosa non ha funzionato e l’annullamento non è stato registrato. La preghiamo di riprovare tra qualche minuto, oppure ci scriva e ce ne occuperemo noi.', home: 'Torna alla homepage' },
  pt: { footer: 'Se preferir não receber mais e-mails como este, {link}.', linkText: 'cancele a subscrição aqui', confirmTitle: 'Cancelar subscrição', confirmBody: 'Deixar de receber envios da FINDDOME neste endereço:', button: 'Cancelar subscrição', doneTitle: 'Subscrição cancelada', doneBody: 'Não enviaremos mais envios para este endereço. As mensagens sobre o seu anúncio ou fatura continuarão a chegar.', invalidTitle: 'Esta ligação não é válida', invalidBody: 'Para cancelar a subscrição, escreva-nos e tratamos do assunto.', failBody: 'Algo correu mal e o cancelamento não foi registado. Tente novamente dentro de alguns minutos ou escreva-nos e tratamos do assunto.', home: 'Voltar à página inicial' },
  el: { footer: 'Αν δεν επιθυμείτε να λαμβάνετε τέτοια μηνύματα, {link}.', linkText: 'διαγραφείτε εδώ', confirmTitle: 'Διαγραφή', confirmBody: 'Διακοπή των μαζικών μηνυμάτων της FINDDOME σε αυτή τη διεύθυνση:', button: 'Διαγραφή', doneTitle: 'Η διαγραφή ολοκληρώθηκε', doneBody: 'Δεν θα στέλνουμε πλέον μαζικά μηνύματα σε αυτή τη διεύθυνση. Τα μηνύματα για την αγγελία ή το τιμολόγιό σας θα συνεχίσουν να φτάνουν.', invalidTitle: 'Ο σύνδεσμος δεν ισχύει', invalidBody: 'Για διαγραφή, απλώς γράψτε μας.', failBody: 'Κάτι πήγε στραβά και η διαγραφή δεν καταχωρίστηκε. Δοκιμάστε ξανά σε λίγα λεπτά ή γράψτε μας και θα το φροντίσουμε.', home: 'Επιστροφή στην αρχική σελίδα' },
  cs: { footer: 'Pokud si nepřejete dostávat podobné e-maily, {link}.', linkText: 'odhlaste se zde', confirmTitle: 'Odhlášení', confirmBody: 'Už neposílat hromadné zprávy FINDDOME na tuto adresu:', button: 'Odhlásit se', doneTitle: 'Jste odhlášeni', doneBody: 'Na tuto adresu již nebudeme posílat hromadné zprávy. Zprávy o vašem inzerátu nebo faktuře budete dostávat i nadále.', invalidTitle: 'Tento odkaz není platný', invalidBody: 'Pokud se chcete odhlásit, stačí nám napsat.', failBody: 'Něco se pokazilo a odhlášení se neuložilo. Zkuste to prosím znovu za pár minut, nebo nám napište a vyřídíme to.', home: 'Zpět na úvodní stránku' },
  sl: { footer: 'Če ne želite več prejemati takšnih sporočil, {link}.', linkText: 'se odjavite tukaj', confirmTitle: 'Odjava', confirmBody: 'Ne pošiljajte več skupinskih sporočil FINDDOME na ta naslov:', button: 'Odjava', doneTitle: 'Odjavljeni ste', doneBody: 'Na ta naslov ne bomo več pošiljali skupinskih sporočil. Sporočila o vašem oglasu ali računu boste še naprej prejemali.', invalidTitle: 'Ta povezava ni veljavna', invalidBody: 'Za odjavo nam preprosto pišite.', failBody: 'Prišlo je do napake in odjava ni bila shranjena. Poskusite znova čez nekaj minut ali nam pišite in bomo uredili.', home: 'Nazaj na domačo stran' },
  sv: { footer: 'Vill du inte få fler mejl som detta? {link}.', linkText: 'Avregistrera dig här', confirmTitle: 'Avregistrering', confirmBody: 'Sluta skicka utskick från FINDDOME till den här adressen:', button: 'Avregistrera mig', doneTitle: 'Du är avregistrerad', doneBody: 'Vi skickar inga fler utskick till den här adressen. Meddelanden om din annons eller faktura får du fortfarande.', invalidTitle: 'Länken är inte giltig', invalidBody: 'Skriv till oss så avregistrerar vi dig.', failBody: 'Något gick fel och avregistreringen sparades inte. Försök igen om några minuter, eller skriv till oss så ordnar vi det.', home: 'Tillbaka till startsidan' },
  da: { footer: 'Ønsker du ikke flere e-mails som denne? {link}.', linkText: 'Afmeld dig her', confirmTitle: 'Afmelding', confirmBody: 'Stop udsendelser fra FINDDOME til denne adresse:', button: 'Afmeld mig', doneTitle: 'Du er afmeldt', doneBody: 'Vi sender ikke flere udsendelser til denne adresse. Beskeder om din annonce eller faktura modtager du stadig.', invalidTitle: 'Linket er ikke gyldigt', invalidBody: 'Skriv til os, så afmelder vi dig.', failBody: 'Noget gik galt, og afmeldingen blev ikke gemt. Prøv igen om et par minutter, eller skriv til os, så ordner vi det.', home: 'Tilbage til forsiden' },
  no: { footer: 'Ønsker du ikke flere e-poster som denne? {link}.', linkText: 'Meld deg av her', confirmTitle: 'Avmelding', confirmBody: 'Stopp utsendelser fra FINDDOME til denne adressen:', button: 'Meld meg av', doneTitle: 'Du er avmeldt', doneBody: 'Vi sender ikke flere utsendelser til denne adressen. Meldinger om annonsen eller fakturaen din får du fortsatt.', invalidTitle: 'Lenken er ikke gyldig', invalidBody: 'Skriv til oss, så melder vi deg av.', failBody: 'Noe gikk galt, og avmeldingen ble ikke lagret. Prøv igjen om noen minutter, eller skriv til oss, så ordner vi det.', home: 'Tilbake til forsiden' },
  fi: { footer: 'Jos et halua enää tällaisia viestejä, {link}.', linkText: 'peru tilaus tästä', confirmTitle: 'Tilauksen peruminen', confirmBody: 'Lopeta FINDDOMEn joukkoviestit tähän osoitteeseen:', button: 'Peru tilaus', doneTitle: 'Tilaus peruttu', doneBody: 'Emme lähetä enää joukkoviestejä tähän osoitteeseen. Ilmoitustasi tai laskuasi koskevat viestit saat edelleen.', invalidTitle: 'Linkki ei ole voimassa', invalidBody: 'Kirjoita meille, niin perumme tilauksen.', failBody: 'Jokin meni vikaan, eikä tilauksen perumista tallennettu. Yritä uudelleen muutaman minuutin kuluttua tai kirjoita meille, niin hoidamme asian.', home: 'Takaisin etusivulle' },
  et: { footer: 'Kui te ei soovi selliseid kirju enam saada, {link}.', linkText: 'loobuge siin', confirmTitle: 'Loobumine', confirmBody: 'Lõpetage FINDDOME’i masspostituste saatmine sellele aadressile:', button: 'Loobun', doneTitle: 'Olete loobunud', doneBody: 'Sellele aadressile me enam masspostitusi ei saada. Teie kuulutuse või arvega seotud teated jõuavad teieni endiselt.', invalidTitle: 'See link ei kehti', invalidBody: 'Loobumiseks kirjutage meile.', failBody: 'Midagi läks valesti ja loobumist ei salvestatud. Proovige mõne minuti pärast uuesti või kirjutage meile ja me korraldame selle.', home: 'Tagasi avalehele' },
  lv: { footer: 'Ja nevēlaties vairs saņemt šādas vēstules, {link}.', linkText: 'atrakstieties šeit', confirmTitle: 'Atrakstīšanās', confirmBody: 'Vairs nesūtīt FINDDOME masveida vēstules uz šo adresi:', button: 'Atrakstīties', doneTitle: 'Jūs esat atrakstījies', doneBody: 'Uz šo adresi masveida vēstules vairs nesūtīsim. Ziņas par jūsu sludinājumu vai rēķinu jūs saņemsiet arī turpmāk.', invalidTitle: 'Šī saite nav derīga', invalidBody: 'Lai atrakstītos, vienkārši uzrakstiet mums.', failBody: 'Radās kļūda, un atrakstīšanās netika saglabāta. Lūdzu, mēģiniet vēlreiz pēc dažām minūtēm vai uzrakstiet mums, un mēs to nokārtosim.', home: 'Atpakaļ uz sākumlapu' },
  lt: { footer: 'Jei nebenorite gauti tokių laiškų, {link}.', linkText: 'atsisakykite čia', confirmTitle: 'Atsisakymas', confirmBody: 'Nebesiųsti FINDDOME masinių laiškų šiuo adresu:', button: 'Atsisakyti', doneTitle: 'Atsisakėte', doneBody: 'Šiuo adresu masinių laiškų nebesiųsime. Pranešimus apie jūsų skelbimą ar sąskaitą gausite ir toliau.', invalidTitle: 'Ši nuoroda negalioja', invalidBody: 'Norėdami atsisakyti, tiesiog parašykite mums.', failBody: 'Įvyko klaida ir atsisakymas nebuvo išsaugotas. Bandykite dar kartą po kelių minučių arba parašykite mums – mes tuo pasirūpinsime.', home: 'Atgal į pagrindinį puslapį' },
};

/**
 * The footer line appended to a bulk email, in the email's language. Placed
 * just before </body> so it sits under the template's own footer.
 */
export function unsubscribeFooter(email: string, locale: string): string {
  const copy = UNSUBSCRIBE_COPY[localeFrom(locale)];
  const url = unsubscribeUrl(email, locale);
  const link = `<a href="${url}" style="color:#475457;text-decoration:underline;">${copy.linkText}</a>`;
  const sentence = copy.footer.replace('{link}', link);
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="padding:0 16px 32px;font-family:'Jost','Helvetica Neue',Helvetica,Arial,sans-serif;font-size:11.5px;line-height:1.6;color:#6b7780;">${sentence}</td></tr></table>`;
}

export function appendBeforeBodyEnd(html: string, fragment: string): string {
  return /<\/body>/i.test(html) ? html.replace(/<\/body>/i, `${fragment}</body>`) : html + fragment;
}
