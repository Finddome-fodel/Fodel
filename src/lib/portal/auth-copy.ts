/**
 * The signed-out portal screens (sign in, register, forgotten and new
 * password) in all five languages.
 *
 * The public nav links with `?lang=<code>`; failing that, the language last
 * picked in the switcher (the `fodel_lang` cookie) decides, and Hungarian,
 * the office's language, is the default.
 *
 * Once signed in, the seller's own screens speak Hungarian, Dutch or English
 * (see portalLang): a seller registered in German or French sees Dutch there,
 * because the portal itself is not translated further in this round.
 */
import type { AstroCookies } from 'astro';
import { localeFrom, type Locale } from '~/i18n/ui';

export type AuthLang = Locale;

export function authLang(url: URL, cookies: AstroCookies): AuthLang {
  const asked = url.searchParams.get('lang');
  if (asked) return localeFrom(asked, localeFrom(cookies.get('fodel_lang')?.value, 'hu'));
  return localeFrom(cookies.get('fodel_lang')?.value, 'hu');
}

/**
 * The language of the seller's screens after sign-in. English has its own;
 * German and French fall back to Dutch, the closest language we have written
 * those screens in.
 */
export type PortalLang = 'hu' | 'nl' | 'en';

export function portalLang(locale: unknown): PortalLang {
  const l = localeFrom(locale, 'hu');
  return l === 'hu' ? 'hu' : l === 'en' ? 'en' : 'nl';
}

export interface AuthStrings {
  tabs: { label: string; login: string; register: string };
  login: {
    title: string; heading: string; email: string; password: string; submit: string; forgot: string; justReset: string;
    errors: { invalid: string; 'rate-limited': string; other: string };
    invited: string;
  };
  register: { title: string; heading: string; intro: string };
  forgot: { title: string; heading: string; body: string; email: string; submit: string; sent: string; validity: string; back: string };
  reset: {
    title: string; heading: string; headingInvalid: string; password: string; password2: string; submit: string; rule: string;
    invalid: string; newLink: string; back: string;
    errors: { short: string; mismatch: string; invalid: string; failed: string };
  };
}

export const AUTH_COPY: Record<Locale, AuthStrings> = {
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
  en: {
    tabs: { label: 'Account', login: 'Sign in', register: 'Register' },
    login: {
      title: 'Sign in',
      heading: 'Welcome back',
      email: 'Email address',
      password: 'Password',
      submit: 'Sign in',
      forgot: 'Forgotten your password?',
      justReset: 'Your password has been changed. Sign in with your new password.',
      errors: {
        invalid: 'Incorrect email address or password.',
        'rate-limited': 'Too many attempts. Wait a minute and try again.',
        other: 'We could not sign you in. Please try again.',
      },
      invited: 'Invited by FODEL? Use the link in the invitation to set your password.',
    },
    register: {
      title: 'Register',
      heading: 'Advertise with FODEL',
      intro: 'Enter your name and contact details. We send you a link to set a password; after that you put your listing together step by step.',
    },
    forgot: {
      title: 'Forgotten password',
      heading: 'Forgotten password',
      body: 'Enter your email address and we will send you a link to set a new password.',
      email: 'Email address',
      submit: 'Send link',
      sent: 'If an account exists for this email address, we have sent a link to it. Check your inbox, and your spam folder too.',
      validity: 'The link is valid for one hour.',
      back: 'Back to sign in',
    },
    reset: {
      title: 'New password',
      heading: 'Set a new password',
      headingInvalid: 'The link is not valid',
      password: 'New password',
      password2: 'New password again',
      submit: 'Save password',
      rule: 'At least 8 characters.',
      invalid: 'This link has expired or has already been used. For your security every link works once, and for one hour.',
      newLink: 'Request a new link',
      back: 'Back to sign in',
      errors: {
        short: 'The password must be at least 8 characters.',
        mismatch: 'The two passwords do not match.',
        invalid: 'This link is no longer valid. Request a new one.',
        failed: 'Saving failed. Please try again.',
      },
    },
  },
  de: {
    tabs: { label: 'Konto', login: 'Anmelden', register: 'Registrieren' },
    login: {
      title: 'Anmelden',
      heading: 'Willkommen zurück',
      email: 'E-Mail-Adresse',
      password: 'Passwort',
      submit: 'Anmelden',
      forgot: 'Passwort vergessen?',
      justReset: 'Ihr Passwort wurde geändert. Melden Sie sich mit dem neuen Passwort an.',
      errors: {
        invalid: 'Falsche E-Mail-Adresse oder falsches Passwort.',
        'rate-limited': 'Zu viele Versuche. Warten Sie eine Minute und versuchen Sie es erneut.',
        other: 'Die Anmeldung hat nicht geklappt. Bitte versuchen Sie es erneut.',
      },
      invited: 'Von FODEL eingeladen? Über den Link in der Einladung legen Sie Ihr Passwort fest.',
    },
    register: {
      title: 'Registrieren',
      heading: 'Bei FODEL inserieren',
      intro: 'Geben Sie Ihren Namen und Ihre Kontaktdaten an. Wir senden Ihnen einen Link zum Festlegen eines Passworts; danach stellen Sie Schritt für Schritt Ihr Inserat zusammen.',
    },
    forgot: {
      title: 'Passwort vergessen',
      heading: 'Passwort vergessen',
      body: 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, mit dem Sie ein neues Passwort festlegen.',
      email: 'E-Mail-Adresse',
      submit: 'Link senden',
      sent: 'Falls zu dieser E-Mail-Adresse ein Konto gehört, haben wir einen Link dorthin gesendet. Schauen Sie in Ihr Postfach und auch in den Spam-Ordner.',
      validity: 'Der Link ist eine Stunde gültig.',
      back: 'Zurück zur Anmeldung',
    },
    reset: {
      title: 'Neues Passwort',
      heading: 'Neues Passwort festlegen',
      headingInvalid: 'Der Link ist ungültig',
      password: 'Neues Passwort',
      password2: 'Neues Passwort wiederholen',
      submit: 'Passwort speichern',
      rule: 'Mindestens 8 Zeichen.',
      invalid: 'Dieser Link ist abgelaufen oder wurde bereits verwendet. Zu Ihrer Sicherheit funktioniert jeder Link nur einmal und eine Stunde lang.',
      newLink: 'Neuen Link anfordern',
      back: 'Zurück zur Anmeldung',
      errors: {
        short: 'Das Passwort muss mindestens 8 Zeichen haben.',
        mismatch: 'Die beiden Passwörter stimmen nicht überein.',
        invalid: 'Dieser Link ist nicht mehr gültig. Fordern Sie einen neuen an.',
        failed: 'Das Speichern hat nicht geklappt. Bitte versuchen Sie es erneut.',
      },
    },
  },
  fr: {
    tabs: { label: 'Compte', login: 'Connexion', register: 'Inscription' },
    login: {
      title: 'Connexion',
      heading: 'Bon retour',
      email: 'Adresse e-mail',
      password: 'Mot de passe',
      submit: 'Se connecter',
      forgot: 'Mot de passe oublié\u202f?',
      justReset: 'Votre mot de passe a été modifié. Connectez-vous avec le nouveau.',
      errors: {
        invalid: 'Adresse e-mail ou mot de passe incorrect.',
        'rate-limited': 'Trop de tentatives. Attendez une minute, puis réessayez.',
        other: 'La connexion a échoué. Veuillez réessayer.',
      },
      invited: 'Invité par FODEL\u202f? Le lien de l’invitation vous permet de définir votre mot de passe.',
    },
    register: {
      title: 'Inscription',
      heading: 'Publiez chez FODEL',
      intro: 'Indiquez votre nom et vos coordonnées. Nous vous envoyons un lien pour définir un mot de passe\u00a0; vous composez ensuite votre annonce étape par étape.',
    },
    forgot: {
      title: 'Mot de passe oublié',
      heading: 'Mot de passe oublié',
      body: 'Indiquez votre adresse e-mail et nous vous envoyons un lien pour définir un nouveau mot de passe.',
      email: 'Adresse e-mail',
      submit: 'Envoyer le lien',
      sent: 'Si un compte existe pour cette adresse e-mail, nous y avons envoyé un lien. Regardez dans votre boîte de réception, et aussi dans vos courriers indésirables.',
      validity: 'Le lien est valable une heure.',
      back: 'Retour à la connexion',
    },
    reset: {
      title: 'Nouveau mot de passe',
      heading: 'Définir un nouveau mot de passe',
      headingInvalid: 'Le lien n’est pas valable',
      password: 'Nouveau mot de passe',
      password2: 'Nouveau mot de passe, encore une fois',
      submit: 'Enregistrer le mot de passe',
      rule: '8 caractères au minimum.',
      invalid: 'Ce lien a expiré ou a déjà été utilisé. Pour votre sécurité, chaque lien ne fonctionne qu’une fois et pendant une heure.',
      newLink: 'Demander un nouveau lien',
      back: 'Retour à la connexion',
      errors: {
        short: 'Le mot de passe doit comporter au moins 8 caractères.',
        mismatch: 'Les deux mots de passe ne correspondent pas.',
        invalid: 'Ce lien n’est plus valable. Demandez-en un nouveau.',
        failed: 'L’enregistrement a échoué. Veuillez réessayer.',
      },
    },
  },
  es: {
    tabs: { label: 'Cuenta', login: 'Iniciar sesión', register: 'Registro' },
    login: {
      title: 'Iniciar sesión',
      heading: 'Hola de nuevo',
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Iniciar sesión',
      forgot: '¿Ha olvidado su contraseña?',
      justReset: 'Su contraseña se ha cambiado. Inicie sesión con la nueva.',
      errors: {
        invalid: 'Correo electrónico o contraseña incorrectos.',
        'rate-limited': 'Demasiados intentos. Espere un minuto y vuelva a intentarlo.',
        other: 'No se ha podido iniciar sesión. Vuelva a intentarlo.',
      },
      invited: '¿Le ha invitado FODEL? Con el enlace de la invitación podrá definir su contraseña.',
    },
    register: {
      title: 'Registro',
      heading: 'Anúnciese en FODEL',
      intro: 'Indique su nombre y sus datos de contacto. Le enviaremos un enlace para definir una contraseña; después, preparará su anuncio paso a paso.',
    },
    forgot: {
      title: 'Contraseña olvidada',
      heading: 'Contraseña olvidada',
      body: 'Indique su correo electrónico y le enviaremos un enlace para definir una contraseña nueva.',
      email: 'Correo electrónico',
      submit: 'Enviar el enlace',
      sent: 'Si existe una cuenta con este correo electrónico, le hemos enviado un enlace. Revise su bandeja de entrada y también la carpeta de correo no deseado.',
      validity: 'El enlace es válido durante una hora.',
      back: 'Volver al inicio de sesión',
    },
    reset: {
      title: 'Contraseña nueva',
      heading: 'Definir una contraseña nueva',
      headingInvalid: 'El enlace no es válido',
      password: 'Contraseña nueva',
      password2: 'Repita la contraseña nueva',
      submit: 'Guardar la contraseña',
      rule: 'Mínimo 8 caracteres.',
      invalid: 'Este enlace ha caducado o ya se ha utilizado. Por su seguridad, cada enlace funciona una sola vez y durante una hora.',
      newLink: 'Solicitar un enlace nuevo',
      back: 'Volver al inicio de sesión',
      errors: {
        short: 'La contraseña debe tener al menos 8 caracteres.',
        mismatch: 'Las dos contraseñas no coinciden.',
        invalid: 'Este enlace ya no es válido. Solicite uno nuevo.',
        failed: 'No se ha podido guardar. Vuelva a intentarlo.',
      },
    },
  },
  pl: {
    tabs: { label: 'Rachunek', login: 'Logowanie', register: 'Rejestracja' },
    login: {
      title: 'Logowanie',
      heading: 'Witamy ponownie',
      email: 'Adres e-mail',
      password: 'Hasło',
      submit: 'Zaloguj się',
      forgot: 'Nie pamiętają Państwo hasła?',
      justReset: 'Hasło zostało zmienione. Prosimy zalogować się nowym hasłem.',
      errors: {
        invalid: 'Nieprawidłowy adres e-mail lub hasło.',
        'rate-limited': 'Zbyt wiele prób. Prosimy odczekać minutę i spróbować ponownie.',
        other: 'Nie udało się zalogować. Prosimy spróbować ponownie.',
      },
      invited: 'Otrzymali Państwo zaproszenie od FODEL? Link z zaproszenia pozwala ustawić hasło.',
    },
    register: {
      title: 'Rejestracja',
      heading: 'Ogłaszaj się w FODEL',
      intro: 'Prosimy podać imię i nazwisko oraz dane kontaktowe. Wyślemy link do ustawienia hasła, a potem krok po kroku przygotują Państwo ogłoszenie.',
    },
    forgot: {
      title: 'Nie pamiętam hasła',
      heading: 'Nie pamiętam hasła',
      body: 'Prosimy podać adres e-mail, a wyślemy link do ustawienia nowego hasła.',
      email: 'Adres e-mail',
      submit: 'Wyślij link',
      sent: 'Jeśli dla tego adresu e-mail istnieje konto, wysłaliśmy na nie link. Prosimy sprawdzić skrzynkę odbiorczą, a także folder spam.',
      validity: 'Link jest ważny przez godzinę.',
      back: 'Powrót do logowania',
    },
    reset: {
      title: 'Nowe hasło',
      heading: 'Ustaw nowe hasło',
      headingInvalid: 'Link jest nieważny',
      password: 'Nowe hasło',
      password2: 'Powtórz nowe hasło',
      submit: 'Zapisz hasło',
      rule: 'Co najmniej 8 znaków.',
      invalid: 'Ten link wygasł lub został już wykorzystany. Ze względów bezpieczeństwa każdy link działa tylko raz i przez godzinę.',
      newLink: 'Poproś o nowy link',
      back: 'Powrót do logowania',
      errors: {
        short: 'Hasło musi mieć co najmniej 8 znaków.',
        mismatch: 'Hasła nie są identyczne.',
        invalid: 'Ten link jest już nieważny. Prosimy poprosić o nowy.',
        failed: 'Nie udało się zapisać. Prosimy spróbować ponownie.',
      },
    },
  },
  ro: {
    tabs: { label: 'Cont', login: 'Autentificare', register: 'Înregistrare' },
    login: {
      title: 'Autentificare',
      heading: 'Bine ați revenit',
      email: 'Adresă de e-mail',
      password: 'Parolă',
      submit: 'Conectați-vă',
      forgot: 'Ați uitat parola?',
      justReset: 'Parola a fost schimbată. Conectați-vă cu parola nouă.',
      errors: {
        invalid: 'Adresă de e-mail sau parolă incorectă.',
        'rate-limited': 'Prea multe încercări. Așteptați un minut și încercați din nou.',
        other: 'Autentificarea nu a reușit. Vă rugăm să încercați din nou.',
      },
      invited: 'Ați fost invitat de FODEL? Cu linkul din invitație vă puteți seta parola.',
    },
    register: {
      title: 'Înregistrare',
      heading: 'Publicați la FODEL',
      intro: 'Indicați numele și datele de contact. Vă trimitem un link pentru a seta o parolă; apoi vă alcătuiți anunțul pas cu pas.',
    },
    forgot: {
      title: 'Parolă uitată',
      heading: 'Parolă uitată',
      body: 'Introduceți adresa de e-mail și vă trimitem un link pentru a seta o parolă nouă.',
      email: 'Adresă de e-mail',
      submit: 'Trimiteți linkul',
      sent: 'Dacă există un cont pentru această adresă de e-mail, v-am trimis un link. Verificați căsuța de e-mail, inclusiv dosarul de spam.',
      validity: 'Linkul este valabil o oră.',
      back: 'Înapoi la autentificare',
    },
    reset: {
      title: 'Parolă nouă',
      heading: 'Setați o parolă nouă',
      headingInvalid: 'Linkul nu este valabil',
      password: 'Parolă nouă',
      password2: 'Repetați parola nouă',
      submit: 'Salvați parola',
      rule: 'Minimum 8 caractere.',
      invalid: 'Acest link a expirat sau a fost deja folosit. Pentru siguranța dumneavoastră, fiecare link funcționează o singură dată și timp de o oră.',
      newLink: 'Solicitați un link nou',
      back: 'Înapoi la autentificare',
      errors: {
        short: 'Parola trebuie să aibă cel puțin 8 caractere.',
        mismatch: 'Cele două parole nu coincid.',
        invalid: 'Acest link nu mai este valabil. Solicitați unul nou.',
        failed: 'Salvarea nu a reușit. Vă rugăm să încercați din nou.',
      },
    },
  },
  sk: {
    tabs: { label: 'Účet', login: 'Prihlásenie', register: 'Registrácia' },
    login: {
      title: 'Prihlásenie',
      heading: 'Vitajte späť',
      email: 'E-mailová adresa',
      password: 'Heslo',
      submit: 'Prihlásiť sa',
      forgot: 'Zabudli ste heslo?',
      justReset: 'Vaše heslo bolo zmenené. Prihláste sa novým heslom.',
      errors: {
        invalid: 'Nesprávna e-mailová adresa alebo heslo.',
        'rate-limited': 'Príliš veľa pokusov. Počkajte minútu a skúste to znova.',
        other: 'Prihlásenie sa nepodarilo. Skúste to, prosím, znova.',
      },
      invited: 'Pozval vás FODEL? Pomocou odkazu v pozvánke si nastavíte heslo.',
    },
    register: {
      title: 'Registrácia',
      heading: 'Inzerujte vo FODEL',
      intro: 'Zadajte svoje meno a kontaktné údaje. Pošleme vám odkaz na nastavenie hesla; potom si krok za krokom pripravíte inzerát.',
    },
    forgot: {
      title: 'Zabudnuté heslo',
      heading: 'Zabudnuté heslo',
      body: 'Zadajte svoju e-mailovú adresu a pošleme vám odkaz na nastavenie nového hesla.',
      email: 'E-mailová adresa',
      submit: 'Poslať odkaz',
      sent: 'Ak k tejto e-mailovej adrese existuje účet, poslali sme naň odkaz. Pozrite si doručenú poštu aj priečinok so spamom.',
      validity: 'Odkaz platí jednu hodinu.',
      back: 'Späť na prihlásenie',
    },
    reset: {
      title: 'Nové heslo',
      heading: 'Nastaviť nové heslo',
      headingInvalid: 'Odkaz nie je platný',
      password: 'Nové heslo',
      password2: 'Zopakujte nové heslo',
      submit: 'Uložiť heslo',
      rule: 'Aspoň 8 znakov.',
      invalid: 'Platnosť tohto odkazu vypršala alebo už bol použitý. Kvôli vašej bezpečnosti funguje každý odkaz iba raz a jednu hodinu.',
      newLink: 'Vyžiadať nový odkaz',
      back: 'Späť na prihlásenie',
      errors: {
        short: 'Heslo musí mať aspoň 8 znakov.',
        mismatch: 'Heslá sa nezhodujú.',
        invalid: 'Tento odkaz už nie je platný. Vyžiadajte si nový.',
        failed: 'Uloženie sa nepodarilo. Skúste to, prosím, znova.',
      },
    },
  },
};
