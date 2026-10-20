/**
 * The words of the validation messages, one file per language so a page loads
 * only its own (see validation-client.ts). The rules that decide *when* a
 * message is shown are in ../validation.ts.
 *
 * Each language writes its own sentence: where the country adjective goes
 * ("holland telefonszámot", "numéro de téléphone néerlandais"), how an example
 * is introduced (", pl." / ", bijv." / ", e.g." / ", z. B." / ", p. ex."), and
 * how numbers are grouped. French uses a no-break space before ":".
 */
export interface ValidationCopy {
  /** Intl tag for numbers in messages ("Legalább 1 000 legyen"). */
  numberTag: string;
  /** Adjective per country code, for "a valid Dutch phone number". */
  adjective: Record<string, string>;
  required: string;
  email: string;
  phone: (adjective: string | undefined, example: string | undefined) => string;
  postcode: (example: string | undefined) => string;
  number: string;
  min: (limit: string) => string;
  max: (limit: string) => string;
  url: string;
  tooLong: (limit: number) => string;
  minLength: (limit: number) => string;
  consent: string;
  /** The heading above a form that failed to submit. */
  summary: (count: number) => string;
}
