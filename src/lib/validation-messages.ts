/**
 * Turns a validation error into a sentence, given one language's copy
 * (validation-copy/<lang>.ts). Pure: no locale tables of its own, so a page
 * that loaded one language's copy carries only that language.
 */
import type { FieldError } from './validation.ts';
import type { ValidationCopy } from './validation-copy/types.ts';

export type { ValidationCopy };

export function errorMessageIn(copy: ValidationCopy, error: FieldError): string {
  const adjective = error.country ? copy.adjective[error.country] : undefined;
  const limit = (n: number | undefined) => (n ?? 0).toLocaleString(copy.numberTag);
  switch (error.code) {
    case 'required':
      return copy.required;
    case 'email':
      return copy.email;
    case 'phone':
      return copy.phone(adjective, error.example);
    case 'postcode':
      return copy.postcode(error.example);
    case 'number':
      return copy.number;
    case 'min':
      return copy.min(limit(error.limit));
    case 'max':
      return copy.max(limit(error.limit));
    case 'url':
      return copy.url;
    case 'too-long':
      return copy.tooLong(error.limit ?? 0);
    case 'min-length':
      return copy.minLength(error.limit ?? 0);
    case 'consent':
      return copy.consent;
    case 'self-referral':
      return copy.selfReferral;
  }
}

/** The heading of the summary shown above a form that failed to submit. */
export function summaryHeadingIn(copy: ValidationCopy, count: number): string {
  return copy.summary(count);
}
