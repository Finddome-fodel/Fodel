/**
 * Loads one language's validation wording in the browser. Vite splits the
 * glob into one small chunk per language, so a page fetches only its own.
 */
import type { ValidationCopy } from './validation-copy/types.ts';

const loaders = import.meta.glob<{ copy: ValidationCopy }>('./validation-copy/{hu,nl,en,de,fr}.ts');

export async function loadValidationCopy(locale: string): Promise<ValidationCopy> {
  const load = loaders[`./validation-copy/${locale}.ts`] ?? loaders['./validation-copy/nl.ts'];
  return (await load()).copy;
}
