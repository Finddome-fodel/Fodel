/**
 * Legal pages, Turkish (formal siz). A faithful translation of the English
 * legal pages (src/data/legal-en.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. The notice on every page states that the Hungarian
 * or English version prevails (the Dutch original on matters of Dutch law).
 * It needs the client's and a lawyer's sign-off before launch, like the other
 * translations; see Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { legacyTiers } from '~/lib/price-tiers';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'tr' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 Temmuz 2026';
const notice =
  'Bu metin kolaylık sağlamak amacıyla hazırlanmış bir çeviridir. Farklılık olması hâlinde Macarca veya İngilizce sürüm esas alınır (Hollanda hukukuna ilişkin konularda Hollandaca asıl metin).';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
/** Every tier price of a package, e.g. "€ 129 / € 179" (the tier is set by the listing's forint price). */
const tierPrices = (pkg: typeof normal) =>
  legacyTiers(pkg.priceEur, pkg.priceEurAbove, pkg.thresholdHuf).map((tier) => eur(tier.priceEur, L)).join(' / ');
// Only the category highlight is sold since November 2026; the homepage is an editorial choice.
const minMonths = (extra('category-highlight') as { minMonths?: number }).minMonths ?? 3;

const pct = (n: number) => `%${n}`;

export const LEGAL_TR = {
  imprint: {
    metaTitle: 'Künye: şirket bilgileri',
    metaDescription: `${COMPANY.names.legal} şirket bilgileri: kayıtlı adres, KDV numarası, KvK numarası ve iletişim bilgileri.`,
    eyebrow: 'Künye',
    title: 'Şirket',
    titleEm: 'bilgileri',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Hizmet sağlayıcıya ilişkin bilgiler',
        rows: [
          ['Şirket unvanı', COMPANY.names.legal],
          ['Kayıtlı adres', addressLine(COMPANY.address, L)],
          ['KDV numarası', COMPANY.registration.vat],
          ['KvK numarası (Hollanda Ticaret Odası)', kvk],
          ['Temsilci', COMPANY.principal],
          ['E-posta', COMPANY.email.primary],
          ['Telefon', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Kuruluş yılı', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Banka hesapları',
        rows: [
          ['Hollanda', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Macaristan', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Uyuşmazlıklar',
        body: 'Bir tüketici uyuşmazlığında Avrupa ODR platformuna da başvurabilirsiniz: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Gizlilik bildirimi',
    metaDescription:
      'FODEL kişisel verilerinizi nasıl işler: hangi verileri işlediğimiz, ne kadar süre sakladığımız ve GDPR kapsamında hangi haklara sahip olduğunuz.',
    eyebrow: 'Gizlilik',
    title: 'Gizlilik',
    titleEm: 'bildirimi',
    intro:
      'Bu bildirim, bu web sitesi aracılığıyla bize ilettiğiniz kişisel verileri GDPR’a uygun olarak nasıl işlediğimizi açıklar.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Veri sorumlusu',
        rows: [
          ['Veri sorumlusu', COMPANY.names.legal],
          ['Adres', addressLine(COMPANY.address, L)],
          ['E-posta', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Hangi verileri işliyoruz',
        intro: 'Yalnızca formlarımıza kendi girdiğiniz veriler:',
        items: [
          'Ad, e-posta adresi ve telefon numarası: talebinizi yanıtlayabilmemiz için',
          'Mesajınızın konusu ve içeriği',
          'İlan için: mülke ilişkin bilgiler ve fatura bilgileriniz',
          'Arama talebi için: arama kriterleriniz',
          'İç kayıtlar için: hangi formu ne zaman doldurduğunuz ve portala ne zaman giriş yaptığınız; IP adresi saklanmaz',
        ],
      },
      {
        type: 'table',
        title: 'Hukuki dayanak ve saklama süresi',
        rows: [
          ['İletişim ve geri arama talebi', 'Açık rıza (GDPR md. 6(1)(a)): 12 ay'],
          ['İlan siparişi', 'Sözleşmenin ifası (md. 6(1)(b)): 7 yıl, yasal vergi saklama süresi'],
          ['Arama talebi', 'Açık rıza: tamamlanana kadar, en fazla 24 ay'],
          ['İç işlem kaydı', 'Meşru menfaat (md. 6(1)(f)): düzenli kayıt tutma ve kötüye kullanımın tespiti: en fazla 24 ay'],
        ],
      },
      {
        type: 'list',
        title: 'Verileri kimlerle paylaşıyoruz',
        intro: 'Verilerinizi satmayız ve pazarlama amacıyla paylaşmayız. Veri işleyenlerimiz şunlardır:',
        items: [
          'E-posta hizmet sağlayıcımız; işleme AB içinde yapılır',
          'Bu web sitesinin barındırma sağlayıcısı',
          'Satın alma sırasında ve yalnızca sizin talebiniz üzerine: karşı taraf ve işleme dâhil olan avukat',
        ],
      },
      {
        type: 'callout',
        title: 'İlanlar hakkında',
        body: 'İlan veren olarak, ilgilenenlerin sizinle doğrudan iletişime geçebilmesi için adınızın ve telefon numaranızın ilanda gösterilmesine izin verebilirsiniz. Bu izni dilediğiniz zaman geri alabilirsiniz; bu durumda bilgileri ilandan kaldırırız.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Bülten',
        body: 'Bültenimize abone olursanız, açık rızanıza dayanarak e-posta adresinizi, seçtiğiniz dili ve abonelik ile onay zamanını yalnızca bülteni göndermek amacıyla işleriz. Abonelik iki adımlıdır: onay e-postasındaki düğmeye tıklayana kadar hiçbir şey göndermeyiz. Her e-postada tek tıkla abonelikten çıkabilirsiniz ve gönderimi hemen durdururuz. Gönderim için Resend hizmetini kullanırız.',
      },
      {
        type: 'list',
        title: 'Haklarınız',
        items: [
          'Hakkınızda işlediğimiz verilere erişim',
          'Düzeltme ve silme',
          'İşlemenin kısıtlanması veya işlemeye itiraz',
          'Veri taşınabilirliği',
          'Rızanızı dilediğiniz zaman geri alma',
          'Hollanda Veri Koruma Kurumu’na (Autoriteit Persoonsgegevens) şikâyette bulunma',
        ],
      },
      {
        type: 'prose',
        title: 'Gizlilik ile ilgili iletişim',
        paragraphs: [`Sorularınızı veya taleplerinizi şu adrese gönderebilirsiniz: ${COMPANY.email.primary}. En geç 30 gün içinde yanıt veririz.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Çerez bildirimi',
    metaDescription: `${SITE_HOST} hangi çerezleri kullanıyor ve tercihinizi nasıl değiştirebilirsiniz.`,
    eyebrow: 'Çerezler',
    title: 'Çerez',
    titleEm: 'bildirimi',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Bu web sitesi şu anda yalnızca teknik olarak zorunlu depolama kullanmaktadır. Reklam veya izleme betikleri çalıştırmıyor ve sosyal platformlarla hiçbir şey paylaşmıyoruz.',
        ],
      },
      {
        type: 'table',
        title: 'Neleri saklıyoruz',
        rows: [
          [
            'fodel:consent',
            'Çerezlere ilişkin tercihiniz (kabul edildi veya reddedildi). Tarayıcınızda saklanır ve bize ulaşmaz. Saklama süresi: 12 ay.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'İstatistikler',
        paragraphs: [
          'Bir gün ziyaretçi istatistikleri tutarsak, bunu yalnızca önceden alınmış açık rızanızla etkinleştiririz. Reddetmeniz siteyi kullanmanızı hiçbir şekilde kısıtlamaz.',
        ],
      },
      {
        type: 'prose',
        title: 'Tercihinizi değiştirme',
        paragraphs: [
          'Bu site için tarayıcıda saklanan verileri silerek tercihinizi dilediğiniz zaman değiştirebilirsiniz; ardından çerez bildirimi yeniden görünür.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Genel şartlar ve koşullar',
    metaDescription:
      'FODEL ilan ve aracılık hizmetinin koşulları: fiyatlar, komisyon, ilanın geri çekilmesi ve sorumluluk.',
    eyebrow: 'Koşullar',
    title: 'Genel şartlar',
    titleEm: 've koşullar',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Lütfen dikkat',
        body: 'Bu sayfa bir özettir. Bağlayıcı koşulların tam metni PDF olarak mevcuttur; farklılık hâlinde PDF esas alınır.',
      },
      {
        type: 'prose',
        title: '1. Hizmet',
        paragraphs: [
          'FODEL, Macaristan’daki gayrimenkulleri kendi çok dilli web sitelerinde ilan eder ve ayrı bir sözleşmeye dayanarak satışın tamamlanmasına yardımcı olur.',
          'İlan hizmeti münhasırlık içermez: satıcı mülkü başka kanallar aracılığıyla da sunabilir ve satabilir.',
        ],
      },
      {
        type: 'list',
        title: '2. İlan verme',
        ordered: true,
        items: [
          'Satıcı kayıt formunu doldurur.',
          'FODEL, seçilen paket için bir ödeme talebi gönderir.',
          'Satıcı ödemeyi banka havalesiyle yapar.',
          'Ödeme alındığında satıcıya fotoğraf yükleme hakkı tanınır.',
          'FODEL çeviriyi yapar ve ilanı yayımlar.',
        ],
      },
      {
        type: 'table',
        title: '3. Fiyatlar',
        intro: `Tüm fiyatlara ${pct(LISTING_VAT_PERCENT)} Hollanda KDV’si dâhildir. Tam liste için Fiyatlar sayfasına bakın.`,
        rows: [
          [`Ekonomik ilan (${cheap.months} ay)`, eur(cheap.priceEur, L)],
          [`Standart ilan (${normal.months} ay)`, `${tierPrices(normal)}`],
          ['Çeviri', `dil başına ${eur(extra('translation').priceEur, L)}`],
          [
            'Öne çıkarma',
            `aylık ${eur(extra('category-highlight').priceEur, L)} (en az ${minMonths} ay)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Komisyon',
        paragraphs: [
          'Komisyon yalnızca aşağıdaki koşulların tümü sağlandığında ödenir: yazılı bir satış sözleşmesi, FODEL tarafından yönlendirilen bir alıcı ve ödenmiş bir kapora.',
          `Komisyon net ${pct(COMMISSION.percent)} olup en az ${eur(COMMISSION.minimumEur, L)} tutarındadır; buna ${pct(COMMISSION.vatPercent)} Hollanda KDV’si eklenir.`,
          'İlgilenen kişi satıcıyla doğrudan iletişime geçerse ve satışın tamamlanmasında yardımımıza gerek kalmazsa, ilan ücreti dışında hiçbir ücret ödenmez.',
        ],
      },
      {
        type: 'prose',
        title: '5. İlanın geri çekilmesi',
        paragraphs: [
          'Satıcı ilanı süresi dolmadan geri çekebilir. Bu durumda önceden ödenmiş ilan ücretleri iade edilmez.',
        ],
      },
      {
        type: 'prose',
        title: '6. Sorumluluk',
        paragraphs: [
          'Mülke ilişkin bilgilerin doğruluğundan satıcı sorumludur. FODEL iletilen bilgileri aktarır ve bunların doğruluğu konusunda sorumluluk kabul etmez.',
          'Bu web sitesindeki çeviriler bilgilendirme amaçlıdır; bir uyuşmazlıkta Macarca sürüm esas alınır.',
        ],
      },
      {
        type: 'prose',
        title: '7. Cayma hakkı',
        paragraphs: [
          'Tüketici sıfatındaki satıcı, mesafeli sözleşmelerde yasal cayma hakkına sahiptir. Satıcı hizmetin derhâl ifasını açıkça talep ederse, cayma hakkı önceden sunulan hizmet oranında azalır.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Erişilebilirlik beyanı',
    metaDescription: `${SITE_HOST} erişilebilirlik düzeyi, izlediğimiz standart ve bize nasıl geri bildirimde bulunabileceğiniz.`,
    eyebrow: 'Erişilebilirlik',
    title: 'Erişilebilirlik',
    titleEm: 'beyanı',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Bu web sitesinin ekran okuyucu, klavye veya büyütme kullanan ziyaretçiler dâhil herkes tarafından kullanılabilmesini istiyoruz.',
          'Siteyi WCAG 2.2 AA düzeyine göre geliştiriyoruz. Ziyaretçilerimizin önemli bir kısmı emekli olduğundan yazı boyutu, kontrast ve klavyeyle kullanım önceliğimizdir.',
        ],
      },
      {
        type: 'list',
        title: 'Neler sağlanıyor',
        items: [
          'Tüm metinlerde kontrast oranı en az 4,5:1',
          'Görünür odak göstergesiyle tam klavye kullanımı',
          'Her sayfanın başında “İçeriğe geç” bağlantısı',
          'Tüm görseller için anlamlı alternatif metinler',
          'Bağlantılı etiketlere ve metin hâlinde hata mesajlarına sahip form alanları',
          '“Hareketi azalt” sistem ayarına uyum',
          'Site JavaScript olmadan da okunabilir ve kullanılabilir',
        ],
      },
      {
        type: 'prose',
        title: 'Bilinen sınırlamalar',
        paragraphs: ['Harita hizmeti gibi üçüncü taraf içeriklerin erişilebilirliği üzerinde etkimiz yoktur.'],
      },
      {
        type: 'prose',
        title: 'Geri bildirim',
        paragraphs: [
          `Bir engelle karşılaşırsanız bize şu adresten veya telefonla bildirin: ${COMPANY.email.primary}. Bildirimleri mümkün olan en kısa sürede çözüyoruz.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
