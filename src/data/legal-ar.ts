/**
 * Legal pages, Arabic, Modern Standard (Latin digits). A faithful translation of the English
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

const L = 'ar' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 يوليو 2026';
const notice =
  'هذه ترجمة لتيسير الاطلاع. وفي حال وجود أي اختلاف، تكون الحجية للنسخة الهنغارية أو الإنجليزية (وفي مسائل القانون الهولندي للأصل الهولندي).';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
/** Every tier price of a package, e.g. "€ 129 / € 179" (the tier is set by the listing's forint price). */
const tierPrices = (pkg: typeof normal) =>
  legacyTiers(pkg.priceEur, pkg.priceEurAbove, pkg.thresholdHuf).map((tier) => eur(tier.priceEur, L)).join(' / ');
// Only the category highlight is sold since November 2026; the homepage is an editorial choice.
const minMonths = (extra('category-highlight') as { minMonths?: number }).minMonths ?? 3;

/** Arabic month count: 1 شهر، 2 شهران، 3–10 أشهر، 11+ شهرًا. */
const months = (n: number) =>
  n === 1 ? 'شهر واحد' : n === 2 ? 'شهران' : n <= 10 ? `${n} أشهر` : `${n} شهرًا`;

export const LEGAL_AR = {
  imprint: {
    metaTitle: 'بيانات الشركة',
    metaDescription: `بيانات شركة ${COMPANY.names.legal}: العنوان المسجّل، ورقم ضريبة القيمة المضافة، ورقم KvK، وبيانات الاتصال.`,
    eyebrow: 'البيانات القانونية',
    title: 'بيانات',
    titleEm: 'الشركة',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'بيانات مقدّم الخدمة',
        rows: [
          ['اسم الشركة', COMPANY.names.legal],
          ['العنوان المسجّل', addressLine(COMPANY.address, L)],
          ['رقم ضريبة القيمة المضافة', COMPANY.registration.vat],
          ['رقم KvK (غرفة التجارة الهولندية)', kvk],
          ['الممثّل', COMPANY.principal],
          ['البريد الإلكتروني', COMPANY.email.primary],
          ['الهاتف', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['سنة التأسيس', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'الحسابات المصرفية',
        rows: [
          ['هولندا', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['هنغاريا', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'النزاعات',
        body: 'في حال نزاع استهلاكي يمكنك أيضًا اللجوء إلى منصة تسوية النزاعات الأوروبية عبر الإنترنت (ODR): ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'سياسة الخصوصية',
    metaDescription:
      'كيف تتعامل FODEL مع بياناتك الشخصية: ما البيانات التي نعالجها، وكم من الوقت نحتفظ بها، وما الحقوق المكفولة لك بموجب اللائحة العامة لحماية البيانات (GDPR).',
    eyebrow: 'الخصوصية',
    title: 'سياسة',
    titleEm: 'الخصوصية',
    intro:
      'تصف هذه السياسة كيف نتعامل، وفقًا للائحة العامة لحماية البيانات (GDPR)، مع البيانات الشخصية التي تقدّمها لنا عبر هذا الموقع.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'المسؤول عن معالجة البيانات',
        rows: [
          ['المسؤول عن المعالجة', COMPANY.names.legal],
          ['العنوان', addressLine(COMPANY.address, L)],
          ['البريد الإلكتروني', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'البيانات التي نعالجها',
        intro: 'فقط البيانات التي تُدخلها بنفسك في نماذجنا:',
        items: [
          'الاسم وعنوان البريد الإلكتروني ورقم الهاتف: لنتمكن من الرد على استفسارك',
          'موضوع رسالتك ومحتواها',
          'للإعلان: بيانات العقار وبيانات الفوترة الخاصة بك',
          'لطلب البحث: معايير البحث الخاصة بك',
          'للسجلات الداخلية: متى ملأت أي نموذج، ومتى سجّلت الدخول إلى البوابة، دون حفظ عنوان IP',
        ],
      },
      {
        type: 'table',
        title: 'الأساس القانوني ومدة الاحتفاظ',
        rows: [
          ['التواصل وطلب معاودة الاتصال', 'الموافقة (المادة 6(1)(a) من GDPR): 12 شهرًا'],
          ['طلب الإعلان', 'تنفيذ عقد (المادة 6(1)(b)): 7 سنوات، وهي مدة الاحتفاظ الضريبية القانونية'],
          ['طلب البحث', 'الموافقة: حتى إنجازه، وبحد أقصى 24 شهرًا'],
          ['سجل النشاط الداخلي', 'المصلحة المشروعة (المادة 6(1)(f)): حسن تنظيم السجلات وكشف إساءة الاستخدام: بحد أقصى 24 شهرًا'],
        ],
      },
      {
        type: 'list',
        title: 'مع من نشارك البيانات',
        intro: 'لا نبيع بياناتك ولا نشاركها لأغراض تسويقية. الجهات التي تعالج البيانات لحسابنا هي:',
        items: [
          'مزوّد خدمة البريد الإلكتروني لدينا، مع المعالجة داخل الاتحاد الأوروبي',
          'مزوّد استضافة هذا الموقع',
          'عند الشراء، وبناءً على طلبك فقط: الطرف الآخر والمحامي المعني',
        ],
      },
      {
        type: 'callout',
        title: 'بخصوص الإعلانات',
        body: 'بصفتك معلنًا، يمكنك أن تأذن لنا بعرض اسمك ورقم هاتفك مع الإعلان، ليتمكن المهتمون من التواصل معك مباشرة. ويمكنك سحب هذا الإذن في أي وقت؛ وعندها نحذف هذه البيانات من الإعلان.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'النشرة الإخبارية',
        body: 'إذا اشتركت في نشرتنا الإخبارية، فإننا نعالج، بناءً على موافقتك، عنوان بريدك الإلكتروني واللغة التي اخترتها ووقت الاشتراك والتأكيد، وذلك لغرض إرسال النشرة فقط. يتم الاشتراك على خطوتين: لا نرسل شيئًا قبل أن تنقر على الزر في رسالة التأكيد. ويمكنك في كل رسالة إلغاء الاشتراك بنقرة واحدة، فنتوقف فورًا. ونستخدم خدمة Resend للإرسال.',
      },
      {
        type: 'list',
        title: 'حقوقك',
        items: [
          'الاطلاع على البيانات التي نعالجها عنك',
          'التصحيح والمحو',
          'تقييد المعالجة أو الاعتراض عليها',
          'قابلية نقل البيانات',
          'سحب موافقتك في أي وقت',
          'تقديم شكوى إلى هيئة حماية البيانات الهولندية (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'التواصل بشأن الخصوصية',
        paragraphs: [`يمكنك إرسال أسئلتك أو طلباتك إلى ${COMPANY.email.primary}. ونرد في غضون 30 يومًا على الأكثر.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'سياسة ملفات تعريف الارتباط',
    metaDescription: `ما ملفات تعريف الارتباط التي يستخدمها ${SITE_HOST}، وكيف تغيّر اختيارك.`,
    eyebrow: 'ملفات تعريف الارتباط',
    title: 'سياسة',
    titleEm: 'ملفات تعريف الارتباط',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'يستخدم هذا الموقع حاليًا التخزين الضروري تقنيًا فقط. لا نشغّل أي نصوص برمجية للإعلانات أو التتبّع، ولا نشارك أي شيء مع منصات التواصل الاجتماعي.',
        ],
      },
      {
        type: 'table',
        title: 'ما نخزّنه',
        rows: [
          [
            'fodel:consent',
            'اختيارك بشأن ملفات تعريف الارتباط (مقبول أو مرفوض). يُحفظ في متصفحك ولا يصل إلينا. مدة الاحتفاظ: 12 شهرًا.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'الإحصاءات',
        paragraphs: [
          'إذا قمنا يومًا بجمع إحصاءات عن الزوار، فلن نفعّلها إلا بموافقتك المسبقة والصريحة. ولا يحدّ الرفض من استخدامك للموقع بأي شكل.',
        ],
      },
      {
        type: 'prose',
        title: 'تغيير اختيارك',
        paragraphs: [
          'يمكنك تغيير اختيارك في أي وقت بحذف بيانات المتصفح المحفوظة لهذا الموقع؛ وعندها يظهر إشعار ملفات تعريف الارتباط مجددًا.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'الشروط والأحكام العامة',
    metaDescription:
      'شروط خدمة الإعلان والوساطة لدى FODEL: الأسعار، والعمولة، وسحب الإعلان، والمسؤولية.',
    eyebrow: 'الشروط',
    title: 'الشروط',
    titleEm: 'والأحكام العامة',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'يُرجى الانتباه',
        body: 'هذه الصفحة ملخّص. الشروط الكاملة الملزمة متاحة بصيغة PDF؛ وفي حال وجود اختلاف، تكون الحجية لملف PDF.',
      },
      {
        type: 'prose',
        title: '1. الخدمة',
        paragraphs: [
          'تعلن FODEL عن العقارات الهنغارية على مواقعها الإلكترونية متعددة اللغات، وتساعد بموجب اتفاق منفصل في إتمام عملية البيع.',
          'لا تنطوي خدمة الإعلان على أي حصرية: يحق للبائع عرض العقار وبيعه عبر قنوات أخرى أيضًا.',
        ],
      },
      {
        type: 'list',
        title: '2. نشر الإعلان',
        ordered: true,
        items: [
          'يملأ البائع نموذج التسجيل.',
          'ترسل FODEL طلب دفع للباقة المختارة.',
          'يدفع البائع بالتحويل المصرفي.',
          'عند استلام المبلغ، يُمنح البائع صلاحية رفع الصور.',
          'تتولى FODEL الترجمة وتنشر الإعلان.',
        ],
      },
      {
        type: 'table',
        title: '3. الأسعار',
        intro: `تشمل جميع الأسعار ضريبة القيمة المضافة الهولندية بنسبة ${LISTING_VAT_PERCENT}%. للاطلاع على النظرة الكاملة، راجع صفحة الأسعار.`,
        rows: [
          [`إعلان اقتصادي (${months(cheap.months)})`, eur(cheap.priceEur, L)],
          [`إعلان قياسي (${months(normal.months)})`, `${tierPrices(normal)}`],
          ['الترجمة', `${eur(extra('translation').priceEur, L)} لكل لغة`],
          [
            'الإبراز',
            `${eur(extra('category-highlight').priceEur, L)} شهريًا (بحد أدنى ${months(minMonths)})`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. العمولة',
        paragraphs: [
          'لا تُستحق العمولة إلا عند تحقق جميع الشروط التالية: عقد بيع مكتوب، ومشترٍ قدّمته FODEL، وعربون مدفوع.',
          `تبلغ العمولة ${COMMISSION.percent}% صافيًا بحد أدنى ${eur(COMMISSION.minimumEur, L)}، تُضاف إليها ضريبة القيمة المضافة الهولندية بنسبة ${COMMISSION.vatPercent}%.`,
          'إذا تواصل المهتم مع البائع مباشرةً ولم تكن هناك حاجة إلى مساعدتنا في إتمام البيع، فلا يُستحق شيء سوى رسوم الإعلان.',
        ],
      },
      {
        type: 'prose',
        title: '5. سحب الإعلان',
        paragraphs: [
          'يحق للبائع سحب الإعلان قبل تاريخ انتهائه. ولا تُستردّ في هذه الحالة رسوم الإعلان المدفوعة.',
        ],
      },
      {
        type: 'prose',
        title: '6. المسؤولية',
        paragraphs: [
          'البائع مسؤول عن صحة البيانات المتعلقة بالعقار. وتعرض FODEL البيانات المقدّمة إليها ولا تتحمّل أي مسؤولية عن صحتها.',
          'الترجمات على هذا الموقع لأغراض إعلامية؛ وفي حال النزاع تكون الحجية للنسخة الهنغارية.',
        ],
      },
      {
        type: 'prose',
        title: '7. حق العدول',
        paragraphs: [
          'يتمتع البائع الذي يُعدّ مستهلكًا بحق العدول القانوني في العقود المبرمة عن بُعد. وإذا طلب البائع صراحةً التنفيذ الفوري، يتقلّص حق العدول بنسبة الخدمة التي قُدّمت بالفعل.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'بيان إمكانية الوصول',
    metaDescription: `مستوى إمكانية الوصول في ${SITE_HOST}، والمعيار الذي نتبعه، وكيفية إرسال ملاحظاتك إلينا.`,
    eyebrow: 'إمكانية الوصول',
    title: 'بيان',
    titleEm: 'إمكانية الوصول',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'نريد أن يتمكن الجميع من استخدام هذا الموقع، بمن فيهم الزوار الذين يستخدمون قارئ الشاشة أو لوحة المفاتيح أو التكبير.',
          'نبني الموقع وفق معيار WCAG 2.2 بالمستوى AA. ونظرًا لأن نسبة كبيرة من زوارنا متقاعدون، فإن حجم النص والتباين والتشغيل بلوحة المفاتيح تحظى بالأولوية.',
        ],
      },
      {
        type: 'list',
        title: 'ما تم توفيره',
        items: [
          'نسبة تباين لا تقل عن 4.5:1 لجميع النصوص',
          'تشغيل كامل بلوحة المفاتيح مع مؤشر تركيز مرئي',
          'رابط «انتقل إلى المحتوى» في أعلى كل صفحة',
          'نصوص بديلة ذات معنى لجميع الصور',
          'حقول نماذج بتسميات مرتبطة ورسائل خطأ نصية',
          'احترام إعداد النظام «تقليل الحركة»',
          'الموقع مقروء وقابل للاستخدام دون JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'قيود معروفة',
        paragraphs: ['لا نملك تأثيرًا على إمكانية الوصول إلى محتوى الجهات الخارجية، مثل خدمة الخرائط.'],
      },
      {
        type: 'prose',
        title: 'الملاحظات',
        paragraphs: [
          `إذا واجهت عائقًا، فأخبرنا عبر ${COMPANY.email.primary} أو بالهاتف. ونعالج البلاغات بأسرع ما يمكن.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
