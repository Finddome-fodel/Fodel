/**
 * Shared handling for all four forms.
 *
 * Responsibilities: validate server-side (never trust the client), reject
 * bots, deliver to FODEL, acknowledge to the sender, and answer both fetch
 * (JSON) and native form POST (303 redirect) so the forms work without
 * JavaScript.
 *
 * Validation is hand-rolled rather than pulling in a schema library — the
 * rules are a dozen lines and this keeps the server bundle to almost nothing.
 */

import type { APIContext } from 'astro';
import { logEvent } from '~/lib/activity';
import { SITE_HOST } from '~/config/site.mjs';
import { senderAddress, officeInbox, replyToAddress } from '~/lib/email/routing';
import { sendEmail } from '~/lib/email/send';
import {
  validateField,
  normalizePhone,
  normalizePostcode,
  normalizeNumber,
  isPhoneCountry,
  defaultPhoneCountry,
  type FieldError,
  type FieldRule as ValidationRule,
} from '~/lib/validation';
import { path, isLocale, localeOfPath, type Locale } from '~/i18n/ui';

export type FieldRule = {
  name: string;
  required?: boolean;
  /**
   * `tel` is checked with libphonenumber against the country picked beside it
   * (`<name>Country`, posted by PhoneField.astro) and stored as E.164.
   * `number` accepts "64.000.000" and "1 200 000" the way people write them.
   */
  type?: 'text' | 'email' | 'tel' | 'number' | 'postcode' | 'url';
  maxLength?: number;
  min?: number;
  max?: number;
  /** For `postcode`: the field holding the ISO country code. */
  countryField?: string;
  /** Shown to FODEL in the email; keeps the message readable. */
  label: string;
};

export interface FormDefinition {
  id: string;
  /** Subject line prefix in the notification email. */
  subject: string;
  fields: FieldRule[];
  /**
   * Fires after FODEL's notification email is sent, before the response goes
   * out. Used by the enquiry form to also persist to Supabase and notify the
   * property's owner, and by the ad-submission form to open a portal account —
   * side effects specific to one form each, so they live here as an opt-in
   * hook rather than complicating this shared handler.
   */
  onSuccess?: (
    values: Record<string, string>,
    extras: Record<string, string>,
    /** The raw submission, for what `fields` cannot carry — the valuation form's photos. */
    form: FormData
  ) => Promise<void | Record<string, unknown>>;
  /** Cross-field rules the per-field rules cannot express (e.g. "phone is required when a callback is chosen"). */
  refine?: (values: Record<string, string>) => Record<string, FieldError>;
  /** Critical persistence hooks return an error instead of false success. */
  requireSuccess?: boolean;
  /**
   * Suppresses the generic "thanks for your message" acknowledgement.
   *
   * Set by the ad-submission form, whose `onSuccess` sends a far better email:
   * a branded, localised "one more step — set a password and carry on with
   * your listing". Two acknowledgements for one submission reads as a system
   * that doesn't know what it already sent.
   */
  skipAck?: boolean;
  /**
   * Recorded to activity_events once the submission is accepted — see
   * src/lib/activity.ts. One call site for all four public forms rather than
   * one per route file; the referral form re-uses this too.
   */
  activityKind: string;
}

/** Humans do not complete and submit a form in under three seconds. */
const MIN_FILL_MS = 3000;

/** Crude in-process rate limit. Serverless resets it per instance, which is fine. */
const recent = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const hits = (recent.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > RATE_MAX;
}

export interface ValidationResult {
  ok: boolean;
  values: Record<string, string>;
  /** Field name → what is wrong, in the shape src/lib/validation.ts words in hu/nl. */
  errors: Record<string, FieldError>;
}

const RULE_OF: Record<NonNullable<FieldRule['type']>, ValidationRule> = {
  text: 'text',
  email: 'email',
  tel: 'phone',
  number: 'number',
  postcode: 'postcode',
  url: 'url',
};

/**
 * The same rules the browser ran (src/lib/validation.ts), run again here —
 * never trust the client. A valid phone number is rewritten to E.164 and a
 * postcode to its usual form, so what is stored and emailed is clean.
 */
export function validate(form: FormData, def: FormDefinition): ValidationResult {
  const values: Record<string, string> = {};
  const errors: Record<string, FieldError> = {};
  const locale = formLocale(form);

  for (const field of def.fields) {
    const raw = form.get(field.name);
    const value = typeof raw === 'string' ? raw.trim() : '';
    const rule = RULE_OF[field.type ?? 'text'];
    const pickedCountry = String(form.get(`${field.name}Country`) ?? '');
    const country =
      rule === 'phone'
        ? (isPhoneCountry(pickedCountry) ? pickedCountry : defaultPhoneCountry(locale))
        : field.countryField
          ? String(form.get(field.countryField) ?? '').toUpperCase()
          : undefined;

    const error = validateField(
      { rule, required: field.required, maxLength: field.maxLength, min: field.min, max: field.max },
      value,
      country
    );
    if (error) {
      errors[field.name] = error;
      continue;
    }
    if (value && rule === 'phone' && isPhoneCountry(country)) {
      const phone = normalizePhone(value, country);
      values[field.name] = phone.ok ? phone.e164 : value;
    } else if (value && rule === 'number') {
      values[field.name] = normalizeNumber(value);
    } else if (value && rule === 'postcode' && country) {
      values[field.name] = normalizePostcode(value, country);
    } else {
      values[field.name] = value;
    }
  }

  if (form.get('consent') !== 'yes') errors.consent = { code: 'consent' };

  return { ok: Object.keys(errors).length === 0, values, errors };
}

/** Returns a reason if the submission looks automated. */
export function spamReason(form: FormData): string | null {
  if (typeof form.get('company') === 'string' && String(form.get('company')).length > 0) {
    return 'honeypot';
  }
  const renderedAt = Number(form.get('renderedAt'));
  if (Number.isFinite(renderedAt) && Date.now() - renderedAt < MIN_FILL_MS) {
    return 'too-fast';
  }
  return null;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildEmail(def: FormDefinition, values: Record<string, string>, extras: Record<string, string>) {
  const rows = def.fields
    .filter((f) => values[f.name])
    .map(
      (f) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#5E6E72;vertical-align:top;white-space:nowrap">${escapeHtml(
          f.label
        )}</td><td style="padding:6px 0;color:#102A43">${escapeHtml(values[f.name]).replace(/\n/g, '<br>')}</td></tr>`
    )
    .join('');

  const extraRows = Object.entries(extras)
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#8C9AA0;white-space:nowrap">${escapeHtml(
          k
        )}</td><td style="padding:6px 0;color:#5E6E72">${escapeHtml(v)}</td></tr>`
    )
    .join('');

  return `<div style="font-family:system-ui,-apple-system,sans-serif;max-width:640px">
  <h2 style="font-size:18px;color:#102A43;margin:0 0 4px">${escapeHtml(def.subject)}</h2>
  <p style="font-size:13px;color:#5E6E72;margin:0 0 20px">${SITE_HOST}</p>
  <table style="font-size:14px;line-height:1.6;border-collapse:collapse">${rows}</table>
  ${extraRows ? `<hr style="border:none;border-top:1px solid #D0D4D6;margin:20px 0"><table style="font-size:12px;line-height:1.6;border-collapse:collapse">${extraRows}</table>` : ''}
</div>`;
}

/**
 * The language of a submission: the form's own `locale` field (the page it was
 * rendered in), else the language in the address of the page it came from,
 * else Hungarian. A seller's stored language wins over all of these where the
 * email goes to an account holder (see localeOf in email/send.ts).
 */
export function formLocale(form: FormData): Locale {
  const stated = form.get('locale');
  if (typeof stated === 'string' && isLocale(stated)) return stated;
  const from = String(form.get('returnTo') ?? '');
  return localeOfPath(from.startsWith('/') ? from : '/') ?? 'hu';
}

const ACK = {
  hu: {
    subject: 'Köszönjük megkeresését | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>Kedves ${escapeHtml(name || 'Érdeklődőnk')}!</p>
       <p>Köszönjük, hogy felvette velünk a kapcsolatot. Üzenetét megkaptuk, munkatársunk hamarosan jelentkezik. ${escapeHtml(hours)}</p>
       <p>Ha sürgős, hívjon minket: ${escapeHtml(phones)}.</p>
       <p>Üdvözlettel,<br>FODEL Ingatlan</p>`,
  },
  nl: {
    subject: 'Bedankt voor uw bericht | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>Beste ${escapeHtml(name || 'bezoeker')},</p>
       <p>Bedankt voor uw bericht. Wij hebben het ontvangen; een medewerker neemt spoedig contact met u op. ${escapeHtml(hours)}</p>
       <p>Heeft u haast? Bel ons op ${escapeHtml(phones)}.</p>
       <p>Met vriendelijke groet,<br>FODEL Vastgoed</p>`,
  },
  en: {
    subject: 'Thank you for your message | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>Dear ${escapeHtml(name || 'visitor')},</p>
       <p>Thank you for your message. We have received it, and one of our team will be in touch shortly. ${escapeHtml(hours)}</p>
       <p>In a hurry? Call us on ${escapeHtml(phones)}.</p>
       <p>Kind regards,<br>FODEL Real Estates</p>`,
  },
  de: {
    subject: 'Vielen Dank für Ihre Nachricht | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Guten Tag ${escapeHtml(name)},` : 'Guten Tag,'}</p>
       <p>vielen Dank für Ihre Nachricht. Wir haben sie erhalten, und ein Mitarbeiter meldet sich in Kürze bei Ihnen. ${escapeHtml(hours)}</p>
       <p>Eilt es? Rufen Sie uns an: ${escapeHtml(phones)}.</p>
       <p>Mit freundlichen Grüßen<br>FODEL Immobilien</p>`,
  },
  fr: {
    subject: 'Merci pour votre message | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Bonjour ${escapeHtml(name)},` : 'Bonjour,'}</p>
       <p>Merci pour votre message. Nous l’avons bien reçu et un collaborateur vous répondra très prochainement. ${escapeHtml(hours)}</p>
       <p>C’est urgent&#8239;? Appelez-nous au ${escapeHtml(phones)}.</p>
       <p>Cordialement,<br>FODEL Immobilier</p>`,
  },
  es: {
    subject: 'Gracias por su mensaje | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Hola, ${escapeHtml(name)}:` : 'Hola:'}</p>
       <p>Gracias por su mensaje. Lo hemos recibido y un miembro de nuestro equipo le responderá muy pronto. ${escapeHtml(hours)}</p>
       <p>¿Es urgente? Llámenos al ${escapeHtml(phones)}.</p>
       <p>Atentamente,<br>FODEL Inmobiliaria</p>`,
  },
  pl: {
    subject: 'Dziękujemy za wiadomość | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Dzień dobry, ${escapeHtml(name)},` : 'Dzień dobry,'}</p>
       <p>dziękujemy za wiadomość. Otrzymaliśmy ją, a nasz pracownik wkrótce się z Państwem skontaktuje. ${escapeHtml(hours)}</p>
       <p>Sprawa jest pilna? Prosimy zadzwonić: ${escapeHtml(phones)}.</p>
       <p>Z poważaniem<br>FODEL Nieruchomości</p>`,
  },
  ro: {
    subject: 'Vă mulțumim pentru mesaj | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Bună ziua, ${escapeHtml(name)},` : 'Bună ziua,'}</p>
       <p>Vă mulțumim pentru mesaj. L-am primit, iar un coleg vă va răspunde în cel mai scurt timp. ${escapeHtml(hours)}</p>
       <p>Este urgent? Sunați-ne la ${escapeHtml(phones)}.</p>
       <p>Cu stimă,<br>FODEL Imobiliare</p>`,
  },
  sk: {
    subject: 'Ďakujeme za vašu správu | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Dobrý deň, ${escapeHtml(name)},` : 'Dobrý deň,'}</p>
       <p>ďakujeme za Vašu správu. Dostali sme ju a náš kolega Vám čoskoro odpovie. ${escapeHtml(hours)}</p>
       <p>Je to naliehavé? Zavolajte nám na ${escapeHtml(phones)}.</p>
       <p>S pozdravom<br>FODEL Nehnuteľnosti</p>`,
  },
  it: {
    subject: 'Grazie per il Suo messaggio | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Gentile ${escapeHtml(name)},` : 'Buongiorno,'}</p>\n       <p>grazie per il Suo messaggio. Lo abbiamo ricevuto e un membro del nostro team La contatterà a breve. ${escapeHtml(hours)}</p>\n       <p>Ha fretta? Ci chiami al numero ${escapeHtml(phones)}.</p>\n       <p>Cordiali saluti,<br>FODEL Immobiliare</p>`,
  },
  pt: {
    subject: 'Obrigado pela sua mensagem | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Bom dia, ${escapeHtml(name)},` : 'Bom dia,'}</p>\n       <p>Obrigado pela sua mensagem. Recebemo-la e um membro da nossa equipa entrará em contacto consigo em breve. ${escapeHtml(hours)}</p>\n       <p>É urgente? Ligue-nos para ${escapeHtml(phones)}.</p>\n       <p>Com os melhores cumprimentos,<br>FODEL Imobiliária</p>`,
  },
  el: {
    subject: 'Σας ευχαριστούμε για το μήνυμά σας | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Γεια σας, ${escapeHtml(name)},` : 'Γεια σας,'}</p>\n       <p>Σας ευχαριστούμε για το μήνυμά σας. Το λάβαμε και ένα μέλος της ομάδας μας θα επικοινωνήσει σύντομα μαζί σας. ${escapeHtml(hours)}</p>\n       <p>Βιάζεστε; Καλέστε μας στο ${escapeHtml(phones)}.</p>\n       <p>Με εκτίμηση,<br>FODEL Ακίνητα</p>`,
  },
  cs: {
    subject: 'Děkujeme za vaši zprávu | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Dobrý den, ${escapeHtml(name)},` : 'Dobrý den,'}</p>\n       <p>děkujeme za vaši zprávu. Obdrželi jsme ji a náš kolega se vám brzy ozve. ${escapeHtml(hours)}</p>\n       <p>Spěcháte? Zavolejte nám na ${escapeHtml(phones)}.</p>\n       <p>S pozdravem<br>FODEL Nemovitosti</p>`,
  },
  sl: {
    subject: 'Hvala za vaše sporočilo | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Pozdravljeni, ${escapeHtml(name)},` : 'Pozdravljeni,'}</p>\n       <p>hvala za vaše sporočilo. Prejeli smo ga in naš sodelavec vam bo kmalu odgovoril. ${escapeHtml(hours)}</p>\n       <p>Se vam mudi? Pokličite nas na ${escapeHtml(phones)}.</p>\n       <p>Lep pozdrav<br>FODEL Nepremičnine</p>`,
  },
  sv: {
    subject: 'Tack för ditt meddelande | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Hej ${escapeHtml(name)},` : 'Hej,'}</p>\n       <p>Tack för ditt meddelande. Vi har tagit emot det och någon i vårt team hör av sig inom kort. ${escapeHtml(hours)}</p>\n       <p>Bråttom? Ring oss på ${escapeHtml(phones)}.</p>\n       <p>Vänliga hälsningar<br>FODEL Fastigheter</p>`,
  },
  da: {
    subject: 'Tak for din besked | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Kære ${escapeHtml(name)}` : 'Hej'}</p>\n       <p>Tak for din besked. Vi har modtaget den, og en fra vores team kontakter dig snarest. ${escapeHtml(hours)}</p>\n       <p>Har du travlt? Ring til os på ${escapeHtml(phones)}.</p>\n       <p>Med venlig hilsen<br>FODEL Ejendomme</p>`,
  },
  no: {
    subject: 'Takk for meldingen din | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Hei ${escapeHtml(name)},` : 'Hei,'}</p>\n       <p>Takk for meldingen din. Vi har mottatt den, og en fra teamet vårt tar snart kontakt med deg. ${escapeHtml(hours)}</p>\n       <p>Haster det? Ring oss på ${escapeHtml(phones)}.</p>\n       <p>Med vennlig hilsen<br>FODEL Eiendom</p>`,
  },
  fi: {
    subject: 'Kiitos viestistäsi | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Hei ${escapeHtml(name)},` : 'Hei,'}</p>\n       <p>Kiitos viestistäsi. Olemme vastaanottaneet sen, ja tiimimme jäsen ottaa sinuun pian yhteyttä. ${escapeHtml(hours)}</p>\n       <p>Onko asialla kiire? Soita meille numeroon ${escapeHtml(phones)}.</p>\n       <p>Ystävällisin terveisin<br>FODEL Kiinteistöt</p>`,
  },
  et: {
    subject: 'Täname teid sõnumi eest | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Tere, ${escapeHtml(name)}!` : 'Tere!'}</p>\n       <p>Täname teid sõnumi eest. Saime selle kätte ja meie meeskonna liige võtab teiega peagi ühendust. ${escapeHtml(hours)}</p>\n       <p>Kiire? Helistage meile numbril ${escapeHtml(phones)}.</p>\n       <p>Lugupidamisega<br>FODEL Kinnisvara</p>`,
  },
  lv: {
    subject: 'Paldies par jūsu ziņojumu | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Labdien, ${escapeHtml(name)}!` : 'Labdien!'}</p>\n       <p>Paldies par jūsu ziņojumu. Mēs to saņēmām, un kāds no mūsu komandas drīz ar jums sazināsies. ${escapeHtml(hours)}</p>\n       <p>Steidzami? Zvaniet mums: ${escapeHtml(phones)}.</p>\n       <p>Ar cieņu<br>FODEL Nekustamais īpašums</p>`,
  },
  lt: {
    subject: 'Ačiū už jūsų žinutę | FODEL',
    body: (name: string, phones: string, hours: string) =>
      `<p>${name ? `Laba diena, ${escapeHtml(name)},` : 'Laba diena,'}</p>\n       <p>dėkojame už jūsų žinutę. Ją gavome, ir mūsų komandos narys netrukus su jumis susisieks. ${escapeHtml(hours)}</p>\n       <p>Skubate? Skambinkite mums ${escapeHtml(phones)}.</p>\n       <p>Pagarbiai<br>FODEL Nekilnojamasis turtas</p>`,
  },
} as const;

/**
 * Runs a form's side effect.
 *
 * Best-effort by contract: a failure here must not turn a successfully
 * delivered enquiry into an error for the visitor who submitted it. FODEL
 * already has the submission by email either way.
 */
async function runHook(
  def: FormDefinition,
  values: Record<string, string>,
  extras: Record<string, string>,
  form: FormData
): Promise<Record<string, unknown>> {
  if (!def.onSuccess) return {};
  try {
    return (await def.onSuccess(values, extras, form)) ?? {};
  } catch (error) {
    console.error(`[form:${def.id}] onSuccess hook failed`, error);
    if (def.requireSuccess) throw error;
    return {};
  }
}

export async function handleForm(
  context: APIContext,
  def: FormDefinition
): Promise<Response> {
  const { request, clientAddress } = context;
  const form = await request.formData();
  const wantsJson = request.headers.get('accept')?.includes('application/json');

  const locale = formLocale(form);
  const returnTo = String(form.get('returnTo') ?? `/${locale}/`);

  const respond = (status: number, body: Record<string, unknown>) => {
    if (wantsJson) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { 'content-type': 'application/json' },
      });
    }
    // Without JS: redirect to a real confirmation page. A prerendered page
    // cannot read a query string, so the thank-you state needs its own URL.
    const thanks = path(locale, 'thanks');
    const target = status < 400 ? `${thanks}?form=${def.id}` : `${returnTo}?error=1`;
    return new Response(null, { status: 303, headers: { location: target } });
  };

  // Silently accept bot submissions — a 200 tells them nothing.
  const spam = spamReason(form);
  if (spam) {
    console.info(`[form:${def.id}] discarded (${spam})`);
    return respond(200, { ok: true });
  }

  if (clientAddress && rateLimited(clientAddress)) {
    return respond(429, { ok: false, error: 'rate-limited' });
  }

  const result = validate(form, def);
  if (def.refine) {
    const extra = def.refine(result.values);
    if (Object.keys(extra).length) {
      result.errors = { ...result.errors, ...extra };
      result.ok = false;
    }
  }
  if (!result.ok) {
    return respond(422, { ok: false, errors: result.errors });
  }

  const extras: Record<string, string> = {
    Locale: locale,
    Page: returnTo,
    Form: def.id,
  };
  for (const key of ['propertyRef', 'propertyTitle', 'package', 'languages']) {
    const value = form.get(key);
    if (typeof value === 'string' && value) extras[key] = value;
  }

  // Logged once a valid, non-spam submission is accepted — regardless of
  // whether email delivery below succeeds. The submission itself is the
  // state change; a Resend outage must not also cost the activity record.
  await logEvent({
    kind: def.activityKind,
    actorEmail: result.values.email || null,
    subjectType: 'form',
    subjectId: def.id,
    locale,
    source: returnTo,
    payload: { ...result.values, ...extras },
  }).catch(() => {});

  const html = buildEmail(def, result.values, extras);
  const inbox = officeInbox();
  const from = senderAddress('website');

  // Capture mode (end-to-end tests) counts as a transport: the messages land in
  // .e2e/outbox/ instead of Resend, exactly as the portal's own emails do.
  if (!import.meta.env.RESEND_API_KEY && import.meta.env.EMAIL_TRANSPORT !== 'capture') {
    // Local development: log rather than fail, so forms are testable offline.
    console.warn(`[form:${def.id}] RESEND_API_KEY unset — submission logged, not sent`);
    console.info(result.values, extras);
    // The hook still runs. It is what opens a portal account from the ad form
    // and persists an enquiry — real state changes, not email side effects, so
    // skipping them offline would make the whole registration flow untestable
    // without a Resend key.
    try {
      const data = await runHook(def, result.values, extras, form);
      return respond(200, { ok: true, delivered: false, ...data });
    } catch { return respond(500, { ok: false, error: 'save-failed' }); }
  }

  try {
    const subject = extras.propertyRef
      ? `${def.subject} — #${extras.propertyRef}`
      : def.subject;

    // sendEmail retries a transient 429/5xx itself; `false` means it gave up.
    const delivered = await sendEmail({
      from,
      to: inbox,
      subject,
      html,
      replyTo: result.values.email || undefined,
    });
    if (!delivered) throw new Error('office notification not delivered');

    // Acknowledge to the sender so they know it arrived.
    if (result.values.email && !def.skipAck) {
      const ack = ACK[locale];
      const { getCompany } = await import('~/lib/runtime-config');
      const { hoursSentence } = await import('~/lib/hours');
      const company = await getCompany();
      const phones = company.phones.filter((phone) => phone.public).map((phone) => phone.display).join(' / ');
      await sendEmail({
        from,
        to: result.values.email,
        subject: ack.subject,
        html: ack.body(result.values.name ?? '', phones, hoursSentence(company.hours, locale)),
        replyTo: replyToAddress(),
      });
    }

    const data = await runHook(def, result.values, extras, form);

    return respond(200, { ok: true, delivered: true, ...data });
  } catch (error) {
    console.error(`[form:${def.id}] delivery failed`, error);
    return respond(502, { ok: false, error: 'delivery-failed' });
  }
}
