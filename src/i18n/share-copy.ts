/**
 * The words of the share buttons, in every language of the site (a test proves none is missing).
 * `share` the heading, `facebook`/`whatsapp`/`email` the accessible names, `copy` and `copied` the link button and its toast,
 * `newWindow` the screen-reader addition, `mailIntro` the first line of a shared e-mail.
 */
import type { Locale } from './ui';

export type ShareCopy = { share: string; facebook: string; whatsapp: string; email: string; copy: string; copied: string; newWindow: string; mailIntro: string };

export const SHARE_COPY: Record<Locale, ShareCopy> = {
  hu: { share: "Megosztás", facebook: "Megosztás Facebookon", whatsapp: "Megosztás WhatsAppon", email: "Megosztás e-mailben", copy: "Link másolása", copied: "Link kimásolva", newWindow: "(új ablakban nyílik meg)", mailIntro: "Ezt az ingatlant találtam a FINDDOME-on:" },
  nl: { share: "Delen", facebook: "Delen op Facebook", whatsapp: "Delen via WhatsApp", email: "Delen per e-mail", copy: "Link kopiëren", copied: "Link gekopieerd", newWindow: "(opent in een nieuw venster)", mailIntro: "Ik vond dit pand op FINDDOME:" },
  en: { share: "Share", facebook: "Share on Facebook", whatsapp: "Share on WhatsApp", email: "Share by e-mail", copy: "Copy link", copied: "Link copied", newWindow: "(opens in a new window)", mailIntro: "I found this property on FINDDOME:" },
  de: { share: "Teilen", facebook: "Auf Facebook teilen", whatsapp: "Über WhatsApp teilen", email: "Per E-Mail teilen", copy: "Link kopieren", copied: "Link kopiert", newWindow: "(öffnet in einem neuen Fenster)", mailIntro: "Ich habe diese Immobilie auf FINDDOME gefunden:" },
  fr: { share: "Partager", facebook: "Partager sur Facebook", whatsapp: "Partager sur WhatsApp", email: "Partager par e-mail", copy: "Copier le lien", copied: "Lien copié", newWindow: "(s’ouvre dans une nouvelle fenêtre)", mailIntro: "J’ai trouvé ce bien sur FINDDOME :" },
  es: { share: "Compartir", facebook: "Compartir en Facebook", whatsapp: "Compartir por WhatsApp", email: "Compartir por correo electrónico", copy: "Copiar enlace", copied: "Enlace copiado", newWindow: "(se abre en una ventana nueva)", mailIntro: "He encontrado este inmueble en FINDDOME:" },
  pl: { share: "Udostępnij", facebook: "Udostępnij na Facebooku", whatsapp: "Udostępnij przez WhatsApp", email: "Udostępnij e-mailem", copy: "Kopiuj link", copied: "Skopiowano link", newWindow: "(otwiera się w nowym oknie)", mailIntro: "Znalazłem tę nieruchomość na FINDDOME:" },
  ro: { share: "Distribuie", facebook: "Distribuie pe Facebook", whatsapp: "Distribuie pe WhatsApp", email: "Distribuie prin e-mail", copy: "Copiază linkul", copied: "Link copiat", newWindow: "(se deschide într-o fereastră nouă)", mailIntro: "Am găsit această proprietate pe FINDDOME:" },
  sk: { share: "Zdieľať", facebook: "Zdieľať na Facebooku", whatsapp: "Zdieľať cez WhatsApp", email: "Zdieľať e-mailom", copy: "Kopírovať odkaz", copied: "Odkaz skopírovaný", newWindow: "(otvorí sa v novom okne)", mailIntro: "Našiel som túto nehnuteľnosť na FINDDOME:" },
  it: { share: "Condividi", facebook: "Condividi su Facebook", whatsapp: "Condividi su WhatsApp", email: "Condividi via e-mail", copy: "Copia link", copied: "Link copiato", newWindow: "(si apre in una nuova finestra)", mailIntro: "Ho trovato questo immobile su FINDDOME:" },
  pt: { share: "Partilhar", facebook: "Partilhar no Facebook", whatsapp: "Partilhar no WhatsApp", email: "Partilhar por e-mail", copy: "Copiar ligação", copied: "Ligação copiada", newWindow: "(abre numa nova janela)", mailIntro: "Encontrei este imóvel no FINDDOME:" },
  el: { share: "Κοινοποίηση", facebook: "Κοινοποίηση στο Facebook", whatsapp: "Κοινοποίηση στο WhatsApp", email: "Κοινοποίηση με email", copy: "Αντιγραφή συνδέσμου", copied: "Ο σύνδεσμος αντιγράφηκε", newWindow: "(ανοίγει σε νέο παράθυρο)", mailIntro: "Βρήκα αυτό το ακίνητο στο FINDDOME:" },
  cs: { share: "Sdílet", facebook: "Sdílet na Facebooku", whatsapp: "Sdílet přes WhatsApp", email: "Sdílet e-mailem", copy: "Kopírovat odkaz", copied: "Odkaz zkopírován", newWindow: "(otevře se v novém okně)", mailIntro: "Našel jsem tuto nemovitost na FINDDOME:" },
  sl: { share: "Deli", facebook: "Deli na Facebooku", whatsapp: "Deli prek WhatsAppa", email: "Deli po e-pošti", copy: "Kopiraj povezavo", copied: "Povezava kopirana", newWindow: "(odpre se v novem oknu)", mailIntro: "To nepremičnino sem našel na FINDDOME:" },
  sv: { share: "Dela", facebook: "Dela på Facebook", whatsapp: "Dela via WhatsApp", email: "Dela via e-post", copy: "Kopiera länk", copied: "Länken kopierad", newWindow: "(öppnas i ett nytt fönster)", mailIntro: "Jag hittade den här fastigheten på FINDDOME:" },
  da: { share: "Del", facebook: "Del på Facebook", whatsapp: "Del på WhatsApp", email: "Del via e-mail", copy: "Kopiér link", copied: "Link kopieret", newWindow: "(åbner i et nyt vindue)", mailIntro: "Jeg fandt denne ejendom på FINDDOME:" },
  no: { share: "Del", facebook: "Del på Facebook", whatsapp: "Del på WhatsApp", email: "Del på e-post", copy: "Kopier lenke", copied: "Lenken er kopiert", newWindow: "(åpnes i et nytt vindu)", mailIntro: "Jeg fant denne eiendommen på FINDDOME:" },
  fi: { share: "Jaa", facebook: "Jaa Facebookissa", whatsapp: "Jaa WhatsAppissa", email: "Jaa sähköpostilla", copy: "Kopioi linkki", copied: "Linkki kopioitu", newWindow: "(avautuu uudessa ikkunassa)", mailIntro: "Löysin tämän kiinteistön FINDDOME-palvelusta:" },
  et: { share: "Jaga", facebook: "Jaga Facebookis", whatsapp: "Jaga WhatsAppis", email: "Jaga e-postiga", copy: "Kopeeri link", copied: "Link kopeeritud", newWindow: "(avaneb uues aknas)", mailIntro: "Leidsin selle kinnisvara FINDDOME’ist:" },
  lv: { share: "Dalīties", facebook: "Dalīties Facebook", whatsapp: "Dalīties WhatsApp", email: "Dalīties pa e-pastu", copy: "Kopēt saiti", copied: "Saite nokopēta", newWindow: "(atveras jaunā logā)", mailIntro: "Atradu šo īpašumu vietnē FINDDOME:" },
  lt: { share: "Dalytis", facebook: "Dalytis Facebook", whatsapp: "Dalytis per WhatsApp", email: "Dalytis el. paštu", copy: "Kopijuoti nuorodą", copied: "Nuoroda nukopijuota", newWindow: "(atsidaro naujame lange)", mailIntro: "Radau šį nekilnojamąjį turtą FINDDOME:" },
  sr: { share: "Podeli", facebook: "Podeli na Facebooku", whatsapp: "Podeli na WhatsApp-u", email: "Podeli e-poštom", copy: "Kopiraj link", copied: "Link je kopiran", newWindow: "(otvara se u novom prozoru)", mailIntro: "Našao sam ovu nekretninu na FINDDOME-u:" },
  uk: { share: "Поділитися", facebook: "Поділитися у Facebook", whatsapp: "Поділитися у WhatsApp", email: "Поділитися електронною поштою", copy: "Копіювати посилання", copied: "Посилання скопійовано", newWindow: "(відкриється в новому вікні)", mailIntro: "Я знайшов цю нерухомість на FINDDOME:" },
  tr: { share: "Paylaş", facebook: "Facebook’ta paylaş", whatsapp: "WhatsApp’ta paylaş", email: "E-posta ile paylaş", copy: "Bağlantıyı kopyala", copied: "Bağlantı kopyalandı", newWindow: "(yeni pencerede açılır)", mailIntro: "Bu gayrimenkulü FINDDOME’da buldum:" },
  he: { share: "שיתוף", facebook: "שיתוף בפייסבוק", whatsapp: "שיתוף בוואטסאפ", email: "שיתוף בדוא״ל", copy: "העתקת קישור", copied: "הקישור הועתק", newWindow: "(נפתח בחלון חדש)", mailIntro: "מצאתי את הנכס הזה ב־FINDDOME:" },
  ar: { share: "مشاركة", facebook: "مشاركة على فيسبوك", whatsapp: "مشاركة عبر واتساب", email: "مشاركة عبر البريد الإلكتروني", copy: "نسخ الرابط", copied: "تم نسخ الرابط", newWindow: "(يفتح في نافذة جديدة)", mailIntro: "وجدت هذا العقار على FINDDOME:" },
  ru: { share: "Поделиться", facebook: "Поделиться в Facebook", whatsapp: "Поделиться в WhatsApp", email: "Поделиться по e-mail", copy: "Скопировать ссылку", copied: "Ссылка скопирована", newWindow: "(откроется в новом окне)", mailIntro: "Я нашёл эту недвижимость на FINDDOME:" },
  zh: { share: "分享", facebook: "分享到 Facebook", whatsapp: "通过 WhatsApp 分享", email: "通过电子邮件分享", copy: "复制链接", copied: "链接已复制", newWindow: "(在新窗口中打开)", mailIntro: "我在 FINDDOME 上找到了这处房产：" },
};

/** The short word on the e-mail button (the long one, for readers, is `SHARE_COPY[locale].email`). Marked for a native-speaker check like the rest. */
export const EMAIL_LABEL: Record<Locale, string> = {
  hu: 'E-mail', nl: 'E-mail', en: 'Email', de: 'E-Mail', fr: 'E-mail', es: 'Correo', pl: 'E-mail', ro: 'E-mail', sk: 'E-mail', it: 'E-mail',
  pt: 'E-mail', el: 'E-mail', cs: 'E-mail', sl: 'E-pošta', sv: 'E-post', da: 'E-mail', no: 'E-post', fi: 'Sähköposti', et: 'E-post', lv: 'E-pasts',
  lt: 'El. paštas', sr: 'E-pošta', uk: 'Ел. пошта', tr: 'E-posta', he: 'אימייל', ar: 'البريد', ru: 'Эл. почта', zh: '电子邮件',
};
