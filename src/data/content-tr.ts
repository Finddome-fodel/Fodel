/**
 * Long-form pages, Turkish: services, agricultural property, buying guide,
 * moving to Hungary, photo guide. Figures come from src/config/company.ts.
 * Suffixes never attach to an interpolated value.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'tr' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `başlangıç ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_TR = {
  services: {
    metaTitle: 'Hizmetler: satış süreci, sözleşmeler, fotoğraf çekimi',
    metaDescription: `İki dilli satış sözleşmesi (${from('hu')}), vekâletname ile temsil, tapuya tescil, enerji kimlik belgesi, gayrimenkul fotoğrafçılığı ve drone çekimi.`,
    eyebrow: 'Hizmetler',
    title: 'İlanın ötesinde',
    titleEm: 'neler yapıyoruz',
    intro:
      'İlan yalnızca ilk adımdır. Aşağıdaki hizmetlerle, her iki ülkenin kurallarına uyarak satın alma sürecinin tamamını üstleniyoruz.',
    sections: [
      {
        type: 'steps',
        title: 'Satış nasıl yürütülür',
        items: [
          { n: '01', t: 'İletişim', b: 'Telefon ve e-posta ile danışmanlık, tercümanlar dahil her iki tarafla iletişim.' },
          { n: '02', t: 'Alıcı değerlendirmesi', b: 'Alıcının geçmişini, satın alma niyetini ve mali durumunu kontrol ederiz.' },
          { n: '03', t: 'Gösterim', b: 'Randevuları ayarlar ve sizin dilinizi konuşan bir çalışma arkadaşımızla birlikte sizinle geliriz.' },
          { n: '04', t: 'Pazarlık', b: 'Gerçekçi bir fiyat aralığında, iki dilde destek.' },
          { n: '05', t: 'Sözleşme', b: 'Bir avukatla hazırlanan iki dilli satış sözleşmesi.' },
          { n: '06', t: 'Tamamlama', b: 'Tapu, abonelikler ve gerektiğinde vekâletname ile temsil.' },
        ],
      },
      {
        type: 'table',
        title: 'İki dilli satış sözleşmesi',
        intro: 'Dil kombinasyonuna göre yaklaşık fiyatlar. Nihai fiyat sözleşmenin uzunluğuna bağlıdır.',
        rows: [
          ['Macarca', from('hu')],
          ['Almanca–Macarca', from('de-hu')],
          ['İngilizce–Macarca', from('en-hu')],
          ['Felemenkçe–Macarca', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Ek hizmetler',
        intro: 'Bu hizmetler için size özel teklif hazırlarız:',
        items: [
          'Enerji kimlik belgesi başvurusu: AB kurallarına göre ilanda bulunması zorunludur',
          'Profesyonel gayrimenkul fotoğrafçılığı',
          'Drone çekimi: özellikle büyük araziler ve manzaralar için etkilidir',
          `İlana video (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Vekâletname ile temsil',
        body: 'İmza için Macaristan’a gitmeniz gerekmez: vekâletnameyle imzada, tapuda ve aboneliklerin devrinde sizi temsil ederiz.',
      },
      {
        type: 'prose',
        title: 'Komisyon ne zaman ödenir',
        paragraphs: [
          `Komisyonu yalnızca alıcıyı FINDDOME getirdiyse, yazılı bir satış sözleşmesi varsa ve kapora ödendiyse alırız. Oran net %${COMMISSION.percent}, en az ${eur(COMMISSION.minimumEur, L)}; buna %${COMMISSION.vatPercent} Hollanda KDV’si eklenir. Ödemeyi alıcı değil, satıcı yapar.`,
        ],
      },
      {
        type: 'cta',
        title: 'Süreçle ilgili sorular',
        body: '{hours} Ücretsiz geri arama isteyin ya da bize yazın.',
        primary: { label: 'Bize ulaşın', to: 'contact' },
        secondary: { label: 'Sıkça sorulan sorular', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Tarımsal gayrimenkul: Macaristan’da en fazla ${AGRI_HECTARE_LIMIT} hektar`,
    metaDescription: `Tarımsal niteliğe sahip bir AB vatandaşı Macaristan’da en fazla ${AGRI_HECTARE_LIMIT} hektar arazi edinebilir. FINDDOME tüm süreci yönetir.`,
    eyebrow: 'Tarımsal gayrimenkul',
    title: 'Tarım arazileri ve',
    titleEm: 'kır malikâneleri',
    intro:
      'Macaristan arazi piyasasının kendine özgü kuralları vardır. Koşulları bilen, bağlara, tarlalara, çiftliklere ve ormanlara erişim kazanır.',
    sections: [
      {
        type: 'prose',
        title: `${AGRI_HECTARE_LIMIT} hektar sınırı`,
        paragraphs: [
          `Tarımsal niteliğe sahip bir AB vatandaşı Macaristan’da toplam ${AGRI_HECTARE_LIMIT} hektar arazi edinebilir. Bu süreci baştan sona biz yürütürüz.`,
          'Süreç, resmî makamlar nezdinde birkaç adımdan oluşur ve niteliğinizin tanınmasıyla başlar. Ekibimiz tüm süreç boyunca size rehberlik eder ve belgeleri iki dilde hazırlar.',
        ],
      },
      {
        type: 'list',
        title: 'Müşterilerimiz neler ediniyor',
        items: [
          'Faal bir şarap mahzeniyle ya da mahzensiz bağlar',
          'AB desteğinden yararlanabilen tarlalar',
          'Hayvancılığa uygun, müştemilatlı çiftlikler',
          'Ormanlar ve karma kullanımlı araziler',
          'Yatırım amaçlı, bitişik büyük parseller',
        ],
      },
      {
        type: 'steps',
        title: 'Süreç',
        items: [
          { n: '01', t: 'Danışma', b: 'Planlarınızı ve mevcut bütçenizi konuşuruz.' },
          { n: '02', t: 'Niteliğin tanınması', b: 'Tarımsal niteliğinizin Macaristan’da tanınmasını sağlarız.' },
          { n: '03', t: 'Arama', b: 'Ortaklarımızla birlikte koşulları karşılayan arazileri ararız.' },
          { n: '04', t: 'İzinler', b: 'Arazi edinimi için gereken izinlere başvururuz.' },
          { n: '05', t: 'Satın alma', b: 'İki dilli sözleşme, tapuya tescil, destek haklarının devri.' },
        ],
      },
      {
        type: 'callout',
        title: 'Önemli',
        body: 'Tarım arazisi edinimine ilişkin kurallar zaman zaman değişir ve kişisel koşullarınıza bağlıdır. Burada yazılanlar yalnızca bilgi amaçlıdır. Somut bir plan için her zaman bize ve uzman bir avukata danışın.',
      },
      {
        type: 'cta',
        title: 'Tarımsal gayrimenkul mü arıyorsunuz',
        body: 'Ne istediğinizi bize söyleyin; ilanını verdiğimiz gayrimenkullerin ötesinde de arıyoruz.',
        primary: { label: 'Ücretsiz gayrimenkul arama', to: 'searchRequest' },
        secondary: { label: 'Gayrimenkullerimiz', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Macaristan’da satın almak: adım adım süreç',
    metaDescription:
      'Yabancı bir alıcı için Macaristan’da satın alma nasıl işler: sözleşme, kapora, tapu, abonelikler ve beklenen maliyetler.',
    eyebrow: 'Alıcılar için',
    title: 'Macaristan’da',
    titleEm: 'satın almak',
    intro:
      'Adımları bildiğinizde Macaristan’daki satın alma süreci oldukça öngörülebilirdir. Bu rehber sizi adım adım yönlendirir.',
    sections: [
      {
        type: 'steps',
        title: 'Süreç',
        items: [
          { n: '01', t: 'Seçim', b: 'Gayrimenkullerimiz arasından seçim yaparsınız ya da ücretsiz bir arama talebi bırakırsınız.' },
          { n: '02', t: 'Gösterim', b: 'Seyahati ve gösterimi tercümanla birlikte organize ederiz.' },
          { n: '03', t: 'Teklif', b: 'Gerçekçi bir teklif vermenize ve pazarlık etmenize yardımcı oluruz.' },
          { n: '04', t: 'Sözleşme ve kapora', b: 'İki dilli satış sözleşmesi, genellikle %10 kaporayla.' },
          { n: '05', t: 'Satış bedeli', b: 'Kalan satış bedeli, sözleşmede belirtildiği şekilde banka havalesiyle.' },
          { n: '06', t: 'Teslim', b: 'Tapuya tescil, abonelikler, anahtar teslimi.' },
        ],
      },
      {
        type: 'list',
        title: 'Satış bedeline ek maliyetler',
        items: [
          'Devir vergisi: oran, gayrimenkulün türüne ve durumunuza bağlıdır',
          'Sözleşmenin hazırlanması ve onaylanması için avukatlık ücreti',
          `İki dilli sözleşmenin çevirisi: dil kombinasyonuna göre ${from('hu')}`,
          'Tapu harçları',
          'FINDDOME’a ödenecek olası komisyon: bunu siz değil, satıcı öder',
        ],
      },
      {
        type: 'prose',
        title: 'Orada bulunmanız gerekmez',
        paragraphs: [
          'Vekâletnameyle imzada, tapuda ve aboneliklerin devrinde sizi temsil ederiz. Böylece seyahat edemeseniz ya da etmek istemeseniz de satın alma gerçekleşebilir.',
        ],
      },
      {
        type: 'callout',
        title: 'Enerji kimlik belgesi',
        body: 'Macaristan’da enerji kimlik belgesi zorunludur ve AB kurallarına göre ilanda da yer almalıdır. İlanlarımızda enerji sınıfını özellikler arasında bulabilirsiniz; “hazırlanıyor” ifadesi belgenin henüz hazırlandığı anlamına gelir.',
      },
      {
        type: 'cta',
        title: 'Başlayalım mı',
        body: 'Gayrimenkullere göz atın ya da ne aradığınızı bize söyleyin. Size hiçbir ücrete mal olmaz.',
        primary: { label: 'Gayrimenkullerimiz', to: 'properties' },
        secondary: { label: 'Ücretsiz gayrimenkul arama', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Macaristan’a taşınmak: Hollandalılar bu adımı neden atıyor',
    metaDescription:
      'Hollandalı ve Belçikalı alıcıların Macaristan’a taşınmasının dört nedeni: fiyat-değer dengesi, geniş alan, daha düşük yaşam maliyeti ve konum.',
    eyebrow: 'Arka plan',
    title: 'Macaristan’a',
    titleEm: 'taşınmak',
    intro:
      'Pek çok Hollandalı ve Belçikalı Macaristan’ı seçiyor. Müşterilerimizle yaptığımız yüzlerce görüşmede aynı dört neden tekrar tekrar karşımıza çıkıyor.',
    sections: [
      {
        type: 'prose',
        title: 'Fiyat-değer dengesi',
        paragraphs: [
          'Macaristan’daki kırsal gayrimenkuller, Avrupa’nın en uygun fiyatlıları arasındadır. Hollanda’da 125 m²’lik bir imarlı arsa kolayca 88.000 €, bir garaj ise yaklaşık 100.000 € tutar. Aynı parayla Macar kırsalında, çoğu zaman geniş bir arazisi de olan ferah bir aile evi alabilirsiniz.',
        ],
      },
      {
        type: 'prose',
        title: 'Geniş alan',
        paragraphs: [
          'Yaklaşık 17 milyon nüfuslu Hollanda’nın nüfus yoğunluğu km² başına 482 kişidir ve ülkenin önemli bir kısmı sudur. Yer darlığı soyut bir sorun değil, gündelik bir deneyimdir ve en sık dile getirilen nedendir.',
        ],
      },
      {
        type: 'prose',
        title: 'Yaşam maliyeti',
        paragraphs: [
          'Alıcılarımızın büyük bölümü emekli ya da emekliliğe yakın. Onlar için daha düşük yaşam maliyeti, emlak vergisinin olmaması ve uygun fiyatlı sağlık hizmeti bir araya geldiğinde, aynı emekli maaşının Hollanda’da sağlayamayacağı bir yaşam standardı ortaya çıkar.',
        ],
      },
      {
        type: 'prose',
        title: 'Konum',
        paragraphs: [
          '1953’teki sel felaketinden bu yana Hollanda devasa bir taşkın koruma sistemi inşa etti. Deniz seviyesinin yükselmesine ilişkin kaygı pek çok kararda rol oynuyor: Macaristan kıtanın ortasında, deniz seviyesinin üzerinde yer alır.',
        ],
      },
      {
        type: 'cta',
        title: 'Keşfetme zamanı',
        body: 'Gayrimenkullerimize göz atın ya da aklınızdakini sizin için arayalım.',
        primary: { label: 'Gayrimenkullerimiz', to: 'properties' },
        secondary: { label: 'Macaristan’da satın almak', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'İlan verenler için fotoğraf rehberi',
    metaDescription:
      'İyi fotoğraflar hızlı satışın en önemli aracıdır. FINDDOME fotoğraf rehberi: ışık, yön, çözünürlük ve en sık yapılan hatalar.',
    eyebrow: 'Satıcılar için',
    title: 'Fotoğraf',
    titleEm: 'rehberi',
    intro:
      'Yabancı ilgililer önce fotoğrafları görür, çoğu zaman yalnızca fotoğrafları. Bu kurallar herhangi bir ilan metninden daha fazlasını yapar.',
    sections: photoGuideSections(L, {
      topTitle: 'En önemli altı kural',
      calloutTitle: 'Bir profesyonele bırakmayı mı tercih edersiniz',
      calloutBody: (lines) =>
        `Bir profesyonelle çalışın. Bunu ilanınızı verirken tek tıkla seçebilirsiniz: ${lines.join('; ')}. İkisi de isteğe bağlıdır; ekibimizden biri tarih belirlemek için sizinle iletişime geçer.`,
      ctaTitle: 'Gayrimenkulünüzün ilanını vermeye hazır mısınız',
      primary: 'İlan verin',
      secondary: 'Fiyatlar',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
