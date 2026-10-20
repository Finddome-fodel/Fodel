/** Shared by the Hírlevél page and its XLSX export: same filters, same rows. */
export const NEWSLETTER_STATUS_LABEL: Record<string, string> = {
  pending: 'Megerősítésre vár',
  confirmed: 'Feliratkozott',
  unsubscribed: 'Leiratkozott',
};
export const NEWSLETTER_LOCALE_LABEL: Record<string, string> = { hu: 'Magyar', nl: 'Holland', en: 'Angol', de: 'Német' };

export type NewsletterFilters = { status: string; locale: string; q: string };

export function newsletterFilters(params: URLSearchParams): NewsletterFilters {
  const status = params.get('status') ?? '';
  const locale = params.get('locale') ?? '';
  return {
    status: status in NEWSLETTER_STATUS_LABEL ? status : '',
    locale: locale in NEWSLETTER_LOCALE_LABEL ? locale : '',
    q: (params.get('q') ?? '').trim().toLowerCase().slice(0, 120),
  };
}

export async function loadSubscribers(supabase: any, f: NewsletterFilters) {
  let query = supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(5000);
  if (f.status) query = query.eq('status', f.status);
  if (f.locale) query = query.eq('locale', f.locale);
  const { data, error } = await query;
  if (error) return { rows: [] as any[], error: error.message };
  const rows = (data ?? []).filter((row: any) => !f.q || String(row.email).includes(f.q));
  return { rows, error: null };
}
