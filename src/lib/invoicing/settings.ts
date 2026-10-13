/**
 * Invoice settings (admin-only table `invoice_settings`, migration 0018) and
 * the issuer block that is frozen onto every invoice at the moment it is
 * issued. site_settings is publicly readable, so the bookkeeper's address and
 * anything else private lives in its own table.
 */
import { COMPANY } from '~/config/company';
import type { Company } from '~/lib/runtime-config';
import type { Issuer } from './model';

export type InvoiceSettings = {
  /** Where the bookkeeper's copy goes. */
  bookkeeperEmail: string;
  /** Send the bookkeeper a copy automatically every time an invoice is sent. */
  autoBookkeeperCopy: boolean;
  /** Days between the issue date and the due date for unpaid invoices. */
  paymentTermsDays: number;
  /** Printed on every document, above the thank-you line. */
  defaultNotes: string;
  /** Overrides the legal name printed as issuer; empty uses the company settings. */
  issuerName: string;
  /** Overrides the phone line; empty uses the company's public phones. */
  issuerPhone: string;
  /** Overrides the e-mail line; empty uses the company's primary address. */
  issuerEmail: string;
};

export const INVOICE_SETTINGS_DEFAULT: InvoiceSettings = {
  bookkeeperEmail: '',
  autoBookkeeperCopy: true,
  paymentTermsDays: 14,
  defaultNotes: '',
  issuerName: '',
  issuerPhone: '',
  issuerEmail: '',
};

export async function loadInvoiceSettings(client: any): Promise<InvoiceSettings> {
  try {
    const { data } = await client.from('invoice_settings').select('data').eq('id', 1).maybeSingle();
    return { ...INVOICE_SETTINGS_DEFAULT, ...(data?.data ?? {}) };
  } catch {
    return INVOICE_SETTINGS_DEFAULT;
  }
}

export function sanitiseSettings(input: Partial<Record<keyof InvoiceSettings, unknown>>): InvoiceSettings {
  const days = Math.round(Number(input.paymentTermsDays));
  return {
    bookkeeperEmail: String(input.bookkeeperEmail ?? '').trim().slice(0, 200),
    autoBookkeeperCopy: input.autoBookkeeperCopy === true || input.autoBookkeeperCopy === 'yes',
    paymentTermsDays: Number.isFinite(days) ? Math.min(Math.max(days, 0), 120) : 14,
    defaultNotes: String(input.defaultNotes ?? '').trim().slice(0, 600),
    issuerName: String(input.issuerName ?? '').trim().slice(0, 120),
    issuerPhone: String(input.issuerPhone ?? '').trim().slice(0, 160),
    issuerEmail: String(input.issuerEmail ?? '').trim().slice(0, 160),
  };
}

/** The seller block, from the company settings and these overrides. */
export function buildIssuer(company: Company | typeof COMPANY, settings: InvoiceSettings): Issuer {
  const phones = ((company.phones ?? []) as ReadonlyArray<{ display: string; public?: boolean }>)
    .filter((p) => p.public !== false)
    .map((p) => p.display)
    .slice(0, 2)
    .join(', ');
  return {
    name: settings.issuerName || company.names.legal,
    street: company.address.street,
    postalCode: company.address.postalCode,
    city: company.address.city,
    country: company.address.country ?? 'Nederland',
    phone: settings.issuerPhone || phones,
    email: settings.issuerEmail || (company.email as { primary: string }).primary,
    vatId: company.registration.vat,
    kvk: company.registration.kvk ?? null,
    iban: company.banks.nl.iban,
    bic: company.banks.nl.bic,
    huAccount: company.banks.hu.account,
  };
}
