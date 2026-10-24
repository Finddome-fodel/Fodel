/**
 * The wording for code that runs on the server (endpoints, emails, tests),
 * where every language is at hand. Browser code does not import this file: it
 * loads its own language's copy through validation-client.ts.
 */
import type { FieldError } from './validation.ts';
import { errorMessageIn, summaryHeadingIn } from './validation-messages.ts';
import type { ValidationCopy } from './validation-copy/types.ts';
import { copy as hu } from './validation-copy/hu.ts';
import { copy as nl } from './validation-copy/nl.ts';
import { copy as en } from './validation-copy/en.ts';
import { copy as de } from './validation-copy/de.ts';
import { copy as fr } from './validation-copy/fr.ts';
import { copy as es } from './validation-copy/es.ts';
import { copy as pl } from './validation-copy/pl.ts';
import { copy as ro } from './validation-copy/ro.ts';
import { copy as sk } from './validation-copy/sk.ts';

const COPY: Record<string, ValidationCopy> = { hu, nl, en, de, fr, es, pl, ro, sk };

/** An unknown language gets Dutch, the site's default for visitors we cannot place. */
const copyFor = (locale: string): ValidationCopy => COPY[locale] ?? nl;

export function errorMessage(error: FieldError, locale: string): string {
  return errorMessageIn(copyFor(locale), error);
}

export function summaryHeading(count: number, locale: string): string {
  return summaryHeadingIn(copyFor(locale), count);
}
