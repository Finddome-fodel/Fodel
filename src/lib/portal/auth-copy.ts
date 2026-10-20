/**
 * The signed-out portal screens (sign in, register, forgotten and new
 * password) in Hungarian and Dutch.
 *
 * Until the launch round these screens were Hungarian only, so a Dutch buyer
 * who clicked "Inloggen" on the Dutch site landed on "Portál bejelentkezés".
 * The public nav now links with `?lang=hu|nl`; failing that, the language
 * last picked in the switcher (the `fodel_lang` cookie) decides, and
 * Hungarian — the office's language — is the default. A visitor whose cookie
 * says en/de/fr gets Dutch: the bridge pages point into the Dutch site.
 */
import type { AstroCookies } from 'astro';

export type AuthLang = 'hu' | 'nl';

export function authLang(url: URL, cookies: AstroCookies): AuthLang {
  const asked = url.searchParams.get('lang');
  if (asked === 'hu' || asked === 'nl') return asked;
  const remembered = cookies.get('fodel_lang')?.value;
  if (remembered === 'hu') return 'hu';
  if (remembered === 'nl' || remembered === 'en' || remembered === 'de' || remembered === 'fr') return 'nl';
  return 'hu';
}

export const AUTH_COPY = {
  hu: {
    tabs: { label: 'Fiók', login: 'Bejelentkezés', register: 'Regisztráció' },
    login: {
      title: 'Bejelentkezés',
      heading: 'Üdvözöljük újra',
      email: 'E-mail-cím',
      password: 'Jelszó',
      submit: 'Bejelentkezés',
      forgot: 'Elfelejtette a jelszavát?',
      justReset: 'A jelszava megváltozott. Jelentkezzen be az új jelszóval.',
      errors: {
        invalid: 'Hibás e-mail-cím vagy jelszó.',
        'rate-limited': 'Túl sok próbálkozás. Várjon egy percet, majd próbálja újra.',
        other: 'Nem sikerült bejelentkezni. Kérjük, próbálja újra.',
      },
      invited: 'Meghívót kapott a FODEL-től? A meghívó e-mailben lévő linkkel állíthatja be a jelszavát.',
    },
    register: {
      title: 'Regisztráció',
      heading: 'Hirdessen a FODEL-en',
      intro: 'Adja meg a nevét és az elérhetőségét. Küldünk egy linket, amellyel jelszót állít be, és utána lépésről lépésre összeállítja a hirdetését.',
    },
    forgot: {
      title: 'Elfelejtett jelszó',
      heading: 'Elfelejtett jelszó',
      body: 'Adja meg az e-mail-címét, és küldünk egy linket, amellyel új jelszót állíthat be.',
      email: 'E-mail-cím',
      submit: 'Link küldése',
      sent: 'Ha ehhez az e-mail-címhez tartozik fiók, elküldtük rá a jelszó-visszaállító linket. Nézze meg a postafiókját, és a spam mappát is.',
      validity: 'A link egy óráig érvényes.',
      back: 'Vissza a bejelentkezéshez',
    },
    reset: {
      title: 'Új jelszó',
      heading: 'Új jelszó beállítása',
      headingInvalid: 'A link nem érvényes',
      password: 'Új jelszó',
      password2: 'Új jelszó még egyszer',
      submit: 'Jelszó mentése',
      rule: 'Legalább 8 karakter.',
      invalid: 'Ez a jelszó-visszaállító link lejárt, vagy már felhasználták. A biztonság kedvéért minden link csak egyszer és csak egy óráig működik.',
      newLink: 'Új link kérése',
      back: 'Vissza a bejelentkezéshez',
      errors: {
        short: 'A jelszó legalább 8 karakter legyen.',
        mismatch: 'A két jelszó nem egyezik.',
        invalid: 'Ez a link már nem érvényes. Kérjen újat.',
        failed: 'Nem sikerült menteni. Kérjük, próbálja újra.',
      },
    },
  },
  nl: {
    tabs: { label: 'Account', login: 'Inloggen', register: 'Registreren' },
    login: {
      title: 'Inloggen',
      heading: 'Welkom terug',
      email: 'E-mailadres',
      password: 'Wachtwoord',
      submit: 'Inloggen',
      forgot: 'Wachtwoord vergeten?',
      justReset: 'Uw wachtwoord is gewijzigd. Log in met uw nieuwe wachtwoord.',
      errors: {
        invalid: 'Onjuist e-mailadres of wachtwoord.',
        'rate-limited': 'Te veel pogingen. Wacht een minuut en probeer het opnieuw.',
        other: 'Inloggen is niet gelukt. Probeer het opnieuw.',
      },
      invited: 'Uitgenodigd door FODEL? Met de link in de uitnodiging stelt u uw wachtwoord in.',
    },
    register: {
      title: 'Registreren',
      heading: 'Adverteren bij FODEL',
      intro: 'Vul uw naam en contactgegevens in. Wij sturen u een link om een wachtwoord in te stellen; daarna stelt u stap voor stap uw advertentie samen.',
    },
    forgot: {
      title: 'Wachtwoord vergeten',
      heading: 'Wachtwoord vergeten',
      body: 'Vul uw e-mailadres in. Wij sturen u een link waarmee u een nieuw wachtwoord instelt.',
      email: 'E-mailadres',
      submit: 'Link versturen',
      sent: 'Als er een account bij dit e-mailadres hoort, hebben wij er een link naartoe gestuurd. Kijk in uw mailbox, en ook in uw spammap.',
      validity: 'De link is een uur geldig.',
      back: 'Terug naar inloggen',
    },
    reset: {
      title: 'Nieuw wachtwoord',
      heading: 'Nieuw wachtwoord instellen',
      headingInvalid: 'De link is niet geldig',
      password: 'Nieuw wachtwoord',
      password2: 'Nieuw wachtwoord nogmaals',
      submit: 'Wachtwoord opslaan',
      rule: 'Minimaal 8 tekens.',
      invalid: 'Deze link is verlopen of al gebruikt. Voor uw veiligheid werkt elke link één keer en één uur lang.',
      newLink: 'Nieuwe link aanvragen',
      back: 'Terug naar inloggen',
      errors: {
        short: 'Het wachtwoord moet minimaal 8 tekens hebben.',
        mismatch: 'De twee wachtwoorden zijn niet gelijk.',
        invalid: 'Deze link is niet meer geldig. Vraag een nieuwe aan.',
        failed: 'Opslaan is niet gelukt. Probeer het opnieuw.',
      },
    },
  },
} as const;
