import type { APIRoute } from 'astro';
import { activeProperties, text, url as propertyUrl } from '~/lib/properties';
import { isLocale } from '~/i18n/ui';
import { eur } from '~/lib/format';
import { compactEur, passesAdobeFilter } from '~/lib/listing-rules';

export const prerender = false;

/**
 * Feeds the browse map's clustered markers. Coordinates are the public ones
 * from mapRow — offset for approximate listings — never the stored point.
 * Cached briefly; see the calling pages' own s-maxage.
 */
export const GET: APIRoute = async ({ url }) => {
  const localeParam = url.searchParams.get('locale');
  const locale = isLocale(localeParam ?? '') ? (localeParam as 'hu' | 'nl') : 'hu';
  const excludeAdobe = url.searchParams.get('no_adobe') === '1';

  const bbox = url.searchParams.get('bbox')?.split(',').map(Number);
  const properties = (await activeProperties()).filter((property) =>
    passesAdobeFilter(property.data.building.wall?.key, excludeAdobe) &&
    (!bbox || bbox.length !== 4 || (
      property.data.location.lng >= bbox[0] && property.data.location.lng <= bbox[2] &&
      property.data.location.lat >= bbox[1] && property.data.location.lat <= bbox[3]
    ))
  );

  const features = properties.map((p) => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.data.location.lng, p.data.location.lat] },
    properties: {
      ref: p.data.ref,
      title: text(p.data.title, locale),
      cat: p.data.category,
      category: p.data.categoryLabels[locale] ?? p.data.categoryLabels.hu,
      price: eur(p.data.price.eur),
      priceShort: compactEur(p.data.price.eur),
      precision: p.data.location.precision,
      url: propertyUrl(p, locale),
    },
  }));

  return new Response(JSON.stringify({ type: 'FeatureCollection', features }), {
    headers: {
      'content-type': 'application/geo+json',
      'cache-control': 's-maxage=300, stale-while-revalidate=86400',
    },
  });
};
