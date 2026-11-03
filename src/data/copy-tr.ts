/**
 * Page copy, Turkish.
 *
 * Formal "siz" register, plain professional real-estate Turkish. Suffixes
 * never attach to an interpolated number (vowel harmony depends on how the
 * number is read), so counts stand before a noun. The figures come from
 * src/config/company.ts, never from this file. Type-checked against the
 * Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'tr' as const;
const pct = (n: number) => `%${n}`;

export const TR = {
  home: {
    meta: {
      title: 'FINDDOME Emlak | Gayrimenkulünüzün ilanını Avrupa’da verin',
      description:
        'İlanınızı birkaç adımda yükleyin. Online ödemeden sonra sitemizde 28 dilde, münhasırlık sözleşmesi olmadan yayına girer.',
    },
    hero: {
      eyebrow: `2013’ten beri · ${foundedInLabel(L)}`,
      title: ['Gayrimenkulünüzün', 'ilanını', 'Avrupa’da verin'],
      emphasis: 1,
      body: 'İlanınızı birkaç adımda yükleyin. İnceleriz; online ödemeden sonra ilan sitemizde 28 dilde, münhasırlık sözleşmesi olmadan yayına girer. İlgilenenler doğrudan size ya da bize ulaşır.',
      primary: 'Gayrimenkullere göz atın',
      secondary: 'Ücretsiz gayrimenkul arama',
      featuredLabel: 'Öne çıkan',
    },
    audiences: [
      {
        eyebrow: 'Alıcılar için',
        title: 'Doğrudan sahibinden\ngayrimenkul',
        body: 'Otantik Macar evleri, çiftlikler, kır malikâneleri ve bağlar. Mülk sahibiyle doğrudan iletişime geçin ya da tüm süreci FINDDOME’a bırakın.',
        cta: 'Gayrimenkullere göz atın',
        to: 'properties',
      },
      {
        eyebrow: 'Satıcılar için',
        title: 'Macaristan’daki gayrimenkulünüz\nBatı Avrupa’da',
        body: `${REACH_COUNTRIES} ülkede, ${REACH_LANGUAGES} dilde ilan; münhasırlık sözleşmesi yok. Komisyon yalnızca alıcıyı biz getirirsek.`,
        cta: 'Daha fazla bilgi',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Seçki', title: 'Öne çıkan gayrimenkuller' },
    quote: '“Hollandalılar, Macaristan’da neler alınabildiğini ve hangi fiyata alınabildiğini görünce çoğu zaman gözlerine inanamıyor.”',
    quoteSource: `${BRAND.tr.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Nasıl işler', title: 'FINDDOME nasıl çalışır' },
    cta: {
      eyebrow: 'Bize ulaşın',
      title: 'Sizi memnuniyetle',
      titleEm: 'geri arayalım',
      body: `{hoursShort} · Geri arama size hiçbir ücrete mal olmaz.`,
    },
    referral: {
      eyebrow: 'Tavsiye programı',
      title: 'Bir ilan veren tavsiye edin,',
      titleEm: '%10 kazanın',
      body: 'Tavsiyenizle biri FINDDOME’da ilan verirse paketinde %10 indirim alır; biz de bir sonraki ilanınız için size %10 tanımlarız. Zaten bizimle ilan mı veriyorsunuz? Kendi tavsiye kodunuzu portalda Ayarlar bölümünde bulabilirsiniz.',
      steps: [
        'Aşağıdaki formla bir tanıdığınızı tavsiye edin ya da portaldaki kendi bağlantınızı paylaşın',
        'Ekibimizden biri kendisiyle iletişime geçer',
        'İlan verirse %10 tasarruf eder, biz de size %10 tanımlarız',
      ],
      formTitle: 'Bir tanıdığınızı tavsiye edin',
      fields: {
        referrerName: 'Adınız',
        referrerEmail: 'E-posta adresiniz',
        referredName: 'Tavsiye ettiğiniz kişinin adı',
        referredEmail: 'Tavsiye ettiğiniz kişinin e-posta adresi',
      },
      submit: 'Tavsiyeyi gönder',
      successTitle: 'Tavsiyeniz için teşekkürler!',
      successBody:
        'Tavsiyenizi aldık. Bir çalışma arkadaşımız tavsiye ettiğiniz kişiyle iletişime geçecek; sizi de e-postayla bilgilendireceğiz.',
    },
  },

  steps: [
    {
      num: '01',
      title: `${REACH_COUNTRIES} ülkede ilan`,
      body: `Hollanda, Belçika, Almanya, İngiltere ve diğer AB ülkelerinde ${REACH_LANGUAGES} dilde ilan veriyoruz; satıcıyla münhasırlık sözleşmesi yapmıyoruz.`,
    },
    {
      num: '02',
      title: 'Doğrudan iletişim',
      body: 'Birçok ilanda bizim bilgilerimizin yanında mülk sahibinin adı ve numarası da yer alır. Kendi aranızda anlaşırsanız kimse komisyon ödemez.',
    },
    {
      num: '03',
      title: 'Sürecin tamamı',
      body: 'İki dilli satış sözleşmesi, vekâletname ile temsil, tapuya tescil ve abonelik devirleri.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Kuruluş' },
    { value: String(REACH_COUNTRIES), label: 'Ülke' },
    { value: String(REACH_LANGUAGES), label: 'Dil' },
    { value: pct(COMMISSION.percent), label: 'Komisyon' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Satıcılar için | Macaristan’daki gayrimenkulünüz Batı Avrupa’da',
      description: `Macaristan’daki gayrimenkulünüzün ilanını ${REACH_COUNTRIES} ülkede, ${REACH_LANGUAGES} dilde verin; ${eur(69, L)} başlayan fiyatlarla ve münhasırlık olmadan. Komisyon yalnızca alıcıyı FINDDOME getirirse: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} KDV.`,
    },
    hero: {
      eyebrow: 'Satıcılar için',
      title: 'Gayrimenkulünüz',
      titleEm: 'Batı Avrupa’da',
      body: `FINDDOME modelinde gayrimenkulünüz ${REACH_COUNTRIES} ülkede, ${REACH_LANGUAGES} dilde ve münhasırlık sözleşmesi olmadan yayınlanır. Yalnızca ciddi alıcılarla çalışıyoruz.`,
      cta: 'İlan verin',
      secondary: 'Fiyatları görün',
    },
    benefits: {
      eyebrow: 'Avantajlar',
      title: 'Yabancı bir alıcı ne kazandırır',
      points: [
        'Kendi birikimiyle alan alıcılar: kredi ya da destek beklemek yok.',
        'Tek seferde banka havalesiyle ödeme; hızlı ve güvenli.',
        'Ciddi niyet: tek bir gösterim onlara iki güne ve 200–300 €’ya mal olur.',
        'Gerçekçi fiyatlar: makul olmayan pazarlık yok.',
        'FINDDOME, randevu verilmeden önce her alıcıyı bizzat değerlendirir.',
      ],
    },
    personas: {
      eyebrow: 'Alıcılar',
      title: 'Alıcılarımız kimler',
      items: [
        {
          title: 'Emekliler',
          body: 'Macaristan’da daha düşük yaşam maliyeti, vergi avantajları ve uygun fiyatlı sağlık hizmeti arıyorlar.',
        },
        {
          title: 'Aileler',
          body: 'Geniş alan, doğa ve kırsal yaşam arıyorlar. Çoğu zaman bir çiftlik, kır evi ya da yazlık.',
        },
        {
          title: 'Yatırımcılar',
          body: 'Ticari gayrimenkul, bağ ve tarım arazisi arıyorlar.',
        },
        {
          title: 'Yaşam tarzı için taşınanlar',
          body: 'Yüksek yaşam maliyetini ve kalabalığı geride bırakıp otantik bir Avrupa yaşam tarzı arıyorlar.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Adım adım', title: 'FINDDOME modeli' },
    commission: {
      eyebrow: 'Fiyatlar',
      title: 'Komisyon yalnızca\nbaşarılı satışta',
      body: `Alıcı sizinle doğrudan iletişime geçer ve yardımımıza ihtiyacınız olmazsa ilan ücreti dışında hiçbir şey ödemezsiniz. Satışa FINDDOME aracılık ederse: net ${pct(COMMISSION.percent)} (en az ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} Hollanda KDV’si.`,
      cta: 'Fiyatları görün',
    },
  },

  buyers: {
    meta: {
      title: 'Alıcılar için | Macaristan’da gayrimenkul satın almak',
      description:
        'Macaristan’da güvenle gayrimenkul satın almanın yolu: iki dilli sözleşme, vekâletname ile temsil ve tapuya tescil. Ayrıca ücretsiz gayrimenkul arama hizmeti.',
    },
    hero: {
      eyebrow: 'Alıcılar için',
      title: 'Macaristan’da satın alın,',
      titleEm: 'sürprizlerle karşılaşmadan',
      body: 'İlanlarımızın çoğunda mülk sahibinin adı yer alır. Doğrudan pazarlık edebilir ya da tüm süreci bize bırakabilirsiniz.',
      cta: 'Gayrimenkullere göz atın',
      secondary: 'Ücretsiz gayrimenkul arama',
    },
    services: {
      eyebrow: 'Neleri üstleniyoruz',
      title: 'Tam destek',
      points: [
        'Sizinle satıcı arasındaki iletişim, tercümanlar dahil.',
        'Sizin dilinizi konuşan bir çalışma arkadaşımızla gösterimler.',
        'Fiyat pazarlığında ve iki dilli sözleşmenin hazırlanmasında destek.',
        'Vekâletname ile temsil: imza için Macaristan’a gitmeniz gerekmez.',
        'Tapuya tescil ve abonelik devirleri.',
      ],
    },
    reasons: {
      eyebrow: 'Neden Macaristan',
      title: 'Batı Avrupalı alıcılar ne arıyor',
    },
  },

  about: {
    meta: {
      title: 'Hakkımızda | İki dünya arasında bir köprü',
      description:
        '2013’ten beri Macaristan’daki satıcılarla Batı Avrupalı alıcıları buluşturuyoruz. Gizlilik içinde, şeffaf ve münhasırlık sözleşmesi olmadan.',
    },
    hero: {
      eyebrow: 'Hakkımızda',
      title: 'İki dünya arasında',
      titleEm: 'bir köprü',
      body: '2013’ten beri Macaristan’daki satıcıların doğru yabancı alıcıyı bulmasına yardımcı oluyoruz: gizlilik içinde, etkili biçimde ve münhasırlık sözleşmesi olmadan.',
    },
    origin: {
      eyebrow: 'Başlangıç · Almere-Buiten, 2013',
      quote:
        '“Almere-Buiten’de yaşarken Hollandalıların otantik bir Avrupa yaşam tarzını ne kadar özlediğini görüyorduk; Macaristan’da ise en güzel gayrimenkuller fark edilmeden sahiplerini bekliyordu.”',
    },
    values: {
      eyebrow: 'Neyi savunuyoruz',
      title: 'Üzerine inşa ettiklerimiz',
      items: [
        {
          num: '01',
          title: 'Gizlilik',
          body: 'Satıcıların ve alıcıların bilgilerini mümkün olan en büyük özenle ele alırız. Kişisel bilgiler yalnızca onayla yayınlanır.',
        },
        {
          num: '02',
          title: 'Şeffaflık',
          body: 'Gizli maliyet yok. Fiyatlarımız ve komisyonumuz bu sitede yayınlanır; her adımda sizi bilgilendiririz.',
        },
        {
          num: '03',
          title: 'İki kültürü tanımak',
          body: 'Her iki pazarı da içeriden tanıyoruz. Ekibimiz Felemenkçe, Almanca, İngilizce, Fransızca ve Macarca konuşuyor.',
        },
      ],
    },
    approach: {
      eyebrow: 'Yaklaşımımız',
      title: 'Büyük bir ofis değiliz.',
      titleEm: 'Gücümüz de burada.',
      points: [
        'Her müşteriyle kişisel iletişim: çağrı merkezi yok, anonim gişe yok.',
        'Her iki kültürü de içeriden tanır, gayrimenkulü hem Hollandalı hem Macar gözüyle değerlendiririz.',
        'Gayrimenkul ile alıcıyı buluşturmak bizim sorumluluğumuzdur, tesadüf değil.',
        'Münhasırlık olmadan çalışıyoruz, çünkü sonuçlarla ikna etmeyi tercih ediyoruz.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'Kurduğumuz',
      titleEm: 'köprü',
      paragraphs: [
        'FINDDOME, Hollanda’da yaşayan Macarlar tarafından kuruldu. 2013’te Almere-Buiten’de başladık; orada pek çok Hollandalı ve Belçikalının otantik bir Macar evi satın almak istediğini, ama nereden başlayacağını bilmediğini fark ettik.',
        `Bugün ${REACH_COUNTRIES} ülkede, ${REACH_LANGUAGES} dilde ilan veriyor ve her işlemi baştan sona yönetiyoruz: iki dilli satış sözleşmesi, vekâletname ile temsil ve tapuya tescil. Ofisimiz Lahey’de.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'İletişim | Sizi memnuniyetle geri arayalım',
      description: `Hafta içi ${COMPANY.hours.weekdays.from}–${COMPANY.hours.weekdays.to} saatleri arasında bizi arayın ya da geri arama isteyin. Görüşme size hiçbir ücrete mal olmaz.`,
    },
    hero: { eyebrow: 'İletişim', title: 'Sizi memnuniyetle', titleEm: 'geri arayalım' },
    formTitle: 'Geri arama isteyin',
    submit: 'Geri arama iste',
    subjects: [
      'Bir gayrimenkul hakkında soru',
      'İlan verme',
      'Fiyat bilgisi isteme',
      'Geri arama talebi',
      'Diğer',
    ],
    note: `Geri arama size hiçbir ücrete mal olmaz: görüşme ücretini biz öderiz. Hafta sonları dahil ${COMPANY.hours.callback.to} saatine kadar geri arıyoruz.`,
  },
} satisfies CopyShape;
