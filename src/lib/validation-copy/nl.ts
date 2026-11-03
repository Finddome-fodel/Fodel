import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `, bijv. ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'nl-NL',
  adjective: {
    HU: 'Hongaars', NL: 'Nederlands', BE: 'Belgisch', DE: 'Duits', AT: 'Oostenrijks', GB: 'Brits', FR: 'Frans', CH: 'Zwitsers',
    SK: 'Slowaaks', RO: 'Roemeens', HR: 'Kroatisch', SI: 'Sloveens', LU: 'Luxemburgs', DK: 'Deens', ES: 'Spaans', IT: 'Italiaans',
    PL: 'Pools', CZ: 'Tsjechisch',
  },
  required: 'Vul dit veld in.',
  email: 'Vul een geldig e-mailadres in, bijv. naam@voorbeeld.nl.',
  phone: (adjective, example) => `Vul een geldig ${adjective ? `${adjective} ` : ''}telefoonnummer in${eg(example)}.`,
  postcode: (example) => `Vul een geldige postcode in${eg(example)}.`,
  number: 'Vul alleen een getal in, bijv. 120.',
  min: (limit) => `Minimaal ${limit}.`,
  max: (limit) => `Maximaal ${limit}.`,
  url: 'Vul een volledig webadres in, bijv. https://www.youtube.com/…',
  tooLong: (limit) => `Maximaal ${limit} tekens.`,
  minLength: (limit) => `Minimaal ${limit} tekens.`,
  consent: 'Ga akkoord met de privacyverklaring om verder te gaan.',
  selfReferral: 'U kunt uzelf niet aanbevelen: vul een ander e-mailadres in.',
  choose: "Kies een waarde uit de lijst.",
  contact: (kind, match) => (kind === 'email' ? `De tekst mag geen e-mailadres bevatten („${match}”). Geïnteresseerden bereiken u via FINDDOME.` : kind === 'phone' ? `De tekst mag geen telefoonnummer bevatten („${match}”). Geïnteresseerden bereiken u via FINDDOME.` : `De tekst mag geen website, sociale media of berichtenapp bevatten („${match}”).`),
  summary: (count) => (count === 1 ? 'Nog één veld controleren:' : `Nog ${count} velden controleren:`),
};
