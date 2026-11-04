/**
 * Turkish email copy. Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`). Formal "siz" throughout; suffixes never
 * attach to an interpolated value (Turkish vowel harmony), so names, numbers
 * and titles stand in neutral positions.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const TR = {
  common: {
    greeting: (name: string) => `Sayın ${name},`,
    greetingNoName: 'Sayın ilan sahibi,',
    signOff: 'Saygılarımızla,\nFINDDOME EMLAK',
    questions: 'Bir sorunuz varsa bu e-postayı yanıtlamanız yeterli.',
    linkFallback: 'Düğme çalışmazsa bu adresi tarayıcınıza kopyalayın:',
  },

  registrationConfirm: {
    subject: 'Şifrenizi belirleyin | FINDDOME',
    preheader: 'Tek tıkla ilanınızı hazırlamaya başlayabilirsiniz.',
    heading: 'Şifrenizi belirleyin',
    intro: 'Kaydınız için teşekkür ederiz. Hesabınız neredeyse hazır; yalnızca şifre eksik.',
    cta: 'Şifre belirle',
    next: 'Ardından ilanınıza hemen devam edebilirsiniz: paket, bilgiler, fotoğraflar. İlanı ancak siz gönderdikten sonra inceliyoruz.',
    expiry: 'Bağlantı 7 gün geçerlidir. Kaydı siz yapmadıysanız bu e-postayı dikkate almayın: hesap oluşturulmaz.',
  },

  accountExists: {
    subject: 'Zaten bir FINDDOME hesabınız var',
    preheader: 'Giriş yapın veya yeni bir şifre belirleyin.',
    heading: 'Bu adres için zaten bir hesap var',
    body: 'Az önce biri bu e-posta adresiyle FINDDOME web sitesine kaydolmaya çalıştı. Bu adres için zaten bir hesap bulunduğundan yeni bir hesap oluşturmadık.',
    cta: 'Giriş yap',
    reset: 'Şifrenizi mi unuttunuz? Yenisini isteyin',
    ignore: 'Bu siz değilseniz yapmanız gereken bir şey yok: hesabınız değişmedi.',
  },

  invite: {
    subject: 'FINDDOME portalına davet',
    preheader: 'Şifrenizi belirleyin ve ilan veren portalına giriş yapın.',
    heading: 'FINDDOME portalına davet edildiniz',
    body: (role: string) =>
      `FINDDOME sizi, gayrimenkul ilanlarını yönettiğiniz portala ${role} katılmaya davet ediyor.`,
    roleAdmin: 'yönetici olarak',
    roleOwner: 'ilan veren olarak',
    cta: 'Daveti kabul et',
    expiry: 'Bağlantı 7 gün geçerlidir ve bir kez kullanılabilir.',
  },

  welcome: {
    subject: 'FINDDOME portalına hoş geldiniz',
    preheader: 'Hesabınız etkin. İlk ilanınızı nasıl vereceğiniz aşağıda.',
    heading: (name: string) => `Hoş geldiniz, ${name}`,
    body: 'Hesabınız etkin. Portalda ilanınızı hazırlar, fotoğraf yükler ve inceleme sürecini takip edersiniz.',
    stepsTitle: 'İhtiyacınız olanlar',
    steps: [
      'Gayrimenkulün fotoğrafları: en az bir tane, ama ne kadar çok olursa o kadar iyi',
      'Temel bilgiler: kullanım alanı, arsa büyüklüğü, satış fiyatı',
      'Gayrimenkulü özel kılan şeyler hakkında birkaç cümle',
    ],
    cta: 'Portala git',
  },

  submissionReceived: {
    subject: (ref: string) => `İlanınızı aldık (#${ref})`,
    preheader: 'İnceleyip size e-postayla bilgi vereceğiz.',
    heading: 'İlanınız alındı',
    body: (title: string, ref: string) =>
      `“${title}” başlıklı ilanınızı (#${ref}) aldık. Ekibimizden biri ilanı inceleyecek; karar verilir verilmez size e-postayla bilgi vereceğiz.`,
    timing: 'İnceleme genellikle iki iş gününden uzun sürmez.',
    note: 'İnceleme sırasında ilanı düzenleyemezsiniz. Bir değişiklik istersek ilan hemen yeniden düzenlemeye açılır.',
  },

  changesRequested: {
    subject: (ref: string) => `Değişiklik gerekiyor (#${ref})`,
    preheader: 'Küçük bir değişiklikle ilan yayına girebilir.',
    heading: 'Sizden bir değişiklik rica ediyoruz',
    body: (title: string, ref: string) =>
      `Ekibimizin “${title}” başlıklı ilanınızla (#${ref}) ilgili notu şöyle:`,
    after: 'İlan yeniden düzenlenebilir. Değişikliği yapıp ilanı tekrar gönderin; süreç kaldığı yerden devam eder.',
    cta: 'İlanı düzenle',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Onaylandı (#${ref}): yalnızca ödeme kaldı`,
    preheader: 'İlanınız onaylandı; ödeme ulaşır ulaşmaz yayına girer.',
    heading: 'İlanınız onaylandı',
    body: (title: string, ref: string) =>
      `Güzel haber: “${title}” başlıklı ilanınızı (#${ref}) inceledik ve onayladık. Yalnızca ödeme kaldı. Ödeme ulaşır ulaşmaz ilan hemen yayına girer.`,
    orderTitle: 'İlan ücreti',
    discountLabel: 'Tavsiye indirimi (%10)',
    totalLabel: 'Ödenecek tutar',
    ctaCard: 'Kartla öde',
    cardNote: 'Ödeme, Stripe’ın güvenli ortamında yapılır. FINDDOME kart bilgilerinizi görmez ve saklamaz.',
    bankTitle: 'Veya banka havalesiyle',
    bankNote: (ref: string) =>
      `Lütfen havale açıklamasına şu referans numarasını yazın: ${ref}. Ödeme ulaşır ulaşmaz ekibimizden biri ilanı yayına alır.`,
    vatNote: 'Tüm tutarlara %21 Hollanda KDV’si dahildir.',
  },

  approvedPublished: {
    subject: (ref: string) => `Onaylandı ve yayında (#${ref})`,
    preheader: 'İlanınız zaten yayında; lütfen ilan ücretini 14 gün içinde ödeyin.',
    heading: 'İlanınız artık yayında',
    body: (title: string, ref: string) => `“${title}” başlıklı ilanı (#${ref}) onayladık ve hemen yayına aldık.`,
    viewCta: 'İlanı görüntüle',
    orderTitle: 'İlan ücreti',
    discountLabel: 'Tavsiye indirimi (%10)',
    totalLabel: 'Ödenecek tutar',
    dueLabel: 'Son ödeme tarihi',
    ctaCard: 'Kartla öde',
    cardNote: 'Ödeme, Stripe’ın güvenli ortamında yapılır. FINDDOME kart bilgilerinizi görmez ve saklamaz.',
    bankTitle: 'Banka havalesi',
    bankNote: (ref: string) => `Lütfen havale açıklamasına şu referans numarasını yazın: ${ref}.`,
    vatNote: 'Tüm tutarlara %21 Hollanda KDV’si dahildir.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Ödeme onayı (#${ref})`,
    preheader: 'Teşekkürler, ödemenizi aldık.',
    heading: 'Teşekkürler, ödemeniz ulaştı',
    body: (title: string, ref: string) =>
      `“${title}” başlıklı ilanın (#${ref}) ödemesini aldık. İlan yayında ve şu adreste görüntülenebilir: ${SITE_HOST}.`,
    orderTitle: 'Döküm',
    discountLabel: 'Tavsiye indirimi (%10)',
    totalLabel: 'Ödenen tutar',
    vatNote: 'Tutara %21 Hollanda KDV’si dahildir. Faturayı ayrı bir e-postayla alacaksınız.',
    paidAtLabel: 'Ödeme tarihi',
  },

  published: {
    subject: (ref: string) => `İlanınız yayında (#${ref})`,
    preheader: `İlan artık şu adreste görüntülenebilir: ${SITE_HOST}.`,
    heading: 'İlanınız yayında',
    body: (title: string, ref: string) =>
      `“${title}” başlıklı ilanınız (#${ref}) yayında ve sekiz ülkedeki alıcılara ulaşıyor (${SITE_HOST}).`,
    cta: 'İlanı görüntüle',
    next: 'Biri ilgilendiği anda bilgilerini size hemen e-postayla gönderiyoruz. İlanınızın durumunu portalda her zaman görebilirsiniz.',
  },
  approvedFree: {
    subject: (ref: string) => `İlanınız ücretsiz olarak onaylandı (#${ref})`,
    preheader: `İlan artık yayında (${SITE_HOST}) ve herhangi bir ödeme yapmanız gerekmiyor.`,
    heading: 'İlanınız ücretsiz olarak yayında',
    body: (title: string, ref: string) =>
      `“${title}” başlıklı ilanınızı (#${ref}) onayladık; ilan artık yayında (${SITE_HOST}). Bu sefer yayın için ücret almıyoruz, dolayısıyla yapmanız gereken bir şey yok.`,
    waived: 'Daha önce gönderdiğimiz ödeme talebi bu nedenle iptal edilmiştir; lütfen ödemeyin.',
    cta: 'İlanı görüntüle',
    next: 'Biri ilgilendiği anda bilgilerini size hemen e-postayla gönderiyoruz. İlanınızın durumunu portalda her zaman görebilirsiniz.',
  },

  newEnquiry: {
    subject: (ref: string) => `Yeni talep (#${ref})`,
    preheader: 'Biri gayrimenkulünüzle ilgileniyor.',
    heading: 'İlanınıza yeni bir yanıt geldi',
    body: (title: string, ref: string) =>
      `Biri “${title}” başlıklı ilanınıza (#${ref}) yanıt verdi:`,
    labels: { name: 'Ad soyad', email: 'E-posta', phone: 'Telefon' },
    messageTitle: 'Mesajı',
    advice: 'Mümkünse iki gün içinde iletişime geçin: hızlı yanıt, satışın gerçekleşmesinde açık ara en önemli etkendir.',
  },

  passwordReset: {
    subject: 'Şifrenizi sıfırlayın | FINDDOME portalı',
    preheader: 'Bağlantı bir saat geçerlidir.',
    heading: 'Şifrenizi sıfırlayın',
    body: 'FINDDOME portalı hesabınızın şifresini sıfırlama talebi aldık. Yeni bir şifre belirlemek için aşağıdaki düğmeye tıklayın.',
    cta: 'Yeni şifre belirle',
    expiry: 'Bağlantı bir saat geçerlidir ve bir kez kullanılabilir.',
    ignore: 'Bunu siz istemediyseniz bu e-postayı dikkate almayın. Şifreniz değişmez ve hiçbir şey olmaz.',
  },

  referralRegistered: {
    subject: 'Tavsiyenizi aldık | FINDDOME',
    preheader: 'Ekibimizden biri tavsiye ettiğiniz kişiyle yakında iletişime geçecek.',
    heading: 'Tavsiyeniz için teşekkürler',
    body: (referredName: string) =>
      `Tavsiye ettiğiniz kişinin bilgilerini aldık: ${referredName}. Ekibimizden biri kendisiyle iletişime geçecek; ilan verildiğinde bir sonraki ilanınızın ücretinden %10 indirim tanımlayacağız.`,
    note: 'İndirim, ilan veren ödemeyi yaptıktan sonra elle tanımlanır. Mümkün olur olmaz size haber vereceğiz.',
  },

  valuationReceived: {
    heading: 'Değerleme talebinizi aldık',
    body: 'Ekibimizden biri gayrimenkul bilgilerini ve veri tabanını kontrol eder, ardından size piyasa verilerine dayalı tahmini değerlemeyi e-postayla gönderir.',
  },

  valuationReady: {
    subject: 'Değerlemeniz hazır | FINDDOME',
    preheader: 'Gayrimenkulünüz için tahmini bir değer hesapladık.',
    heading: 'Değerlemeniz hazır',
    body: (range: string) =>
      `Verilen bilgiler ve karşılaştırılabilir gayrimenkuller esas alındığında tahmini değerimiz: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Bu tahmin yol göstericidir; bir değerleme raporu değildir ve resmî değerlemenin yerini tutmaz. ${n} karşılaştırılabilir gayrimenkule dayanmaktadır.`,
    disclaimer:
      'Bu tahmin yol göstericidir; bir değerleme raporu değildir ve resmî değerlemenin yerini tutmaz.',
    cta: 'Hemen ilan verin',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Verilen bilgiler esas alındığında piyasa verilerine dayalı tahmini değer: ${range}.`,
    mid: 'Orta değer',
    basis: 'Veri tabanı',
    rateDate: 'Kur tarihi',
    source: 'Kaynak',
    factorsHeading: 'Etkenler',
    dirPlus: 'Değeri artırır',
    dirMinus: 'Değeri düşürür',
    dirUnsure: 'Belirsiz',
    visit: 'Gábor’un ziyaretini talep edin',
    judicial: 'Resmî değerleme talep edin',
  },

  valuationDeclined: {
    subject: 'Değerleme talebiniz | FINDDOME',
    preheader: 'Ekibimizden biri sizinle bizzat iletişime geçecek.',
    heading: 'Talebiniz için teşekkürler',
    body: 'Verilen bilgilere göre güvenilir bir tahmin için şu anda yeterli karşılaştırılabilir gayrimenkulümüz yok. Ekibimizden biri sizinle bizzat iletişime geçecek.',
  },

  valuationNeedsInfo: {
    subject: 'Değerleme: birkaç bilgiye daha ihtiyacımız var',
    preheader: 'Tahmin için biraz daha bilgiye ihtiyacımız var.',
    heading: 'Birkaç bilgiye daha ihtiyacımız var',
    body: 'Değerleme talebiniz için teşekkür ederiz. Tahmin için ekibimizden biri sizden şunları rica ediyor:',
    after: 'Eksik bilgileri bu e-postayı yanıtlayarak gönderin. Bilgiler elimize ulaşır ulaşmaz tahmini hazırlayacağız.',
  },

  rejected: {
    subject: (ref: string) => `İlanınız yayınlanamıyor (#${ref})`,
    preheader: 'İncelemenin sonucu ve açıklaması.',
    heading: 'İlanı yayınlayamıyoruz',
    body: (title: string, ref: string) =>
      `Üzgünüz: inceleme sonucunda ekibimiz “${title}” başlıklı ilanınızı (#${ref}) onaylamadı. Açıklama:`,
    refund: 'İlan ücretini zaten ödediyseniz iade için sizinle ayrıca iletişime geçeceğiz.',
    after: 'Bir sorunuz varsa veya bir yanlış anlaşılma olduğunu düşünüyorsanız bu e-postayı yanıtlamanız yeterli.',
  },

  invoiceIssued: {
    subject: (number: string) => `Fatura no. ${number}`,
    preheader: 'Fatura hazır; bağlantıdan görüntüleyebilir veya indirebilirsiniz.',
    heading: 'Faturanız hazır',
    body: (title: string, ref: string, number: string) =>
      `“${title}” başlıklı ilanınız (#${ref}) için ${number} numaralı fatura hazır.`,
    cta: 'Faturayı görüntüle',
  },

  creditNoteIssued: {
    subject: (number: string) => `İade faturası no. ${number}`,
    preheader: 'Önceki faturanız için bir iade faturası düzenledik.',
    heading: 'İade faturası hazır',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `“${title}” başlıklı ilanınız (#${ref}) için düzenlenen ${correctsNumber} numaralı faturaya karşılık ${number} numaralı iade faturasını düzenledik.`,
    cta: 'İade faturasını görüntüle',
  },

  serviceRequested: {
    subject: 'Talebinizi aldık | FINDDOME',
    preheader: 'Ekibimizden biri tarih belirlemek için sizinle iletişime geçecek.',
    heading: 'Talebinizi aldık',
    body: (service: string, price: string) => `Teşekkürler, talebinizi kaydettik: ${service} (${price}).`,
    next: 'Ekibimizden biri tarih belirlemek için sizinle iletişime geçecek.',
    payment: 'Ödeme bilgisini tarihi belirlerken vereceğiz. Şu anda hiçbir ödeme yapmıyorsunuz.',
    cancel: 'Fikrinizi mi değiştirdiniz? Bu e-postayı yanıtlamanız yeterli.',
  },

  valuationPaid: {
    subject: 'Ödeme onayı | FINDDOME değerleme',
    preheader: 'Teşekkürler, ödemeniz ulaştı.',
    heading: 'Teşekkürler, ödemeniz ulaştı',
    body: (service: string) => `Şu hizmetin ödemesini aldık: “${service}”.`,
    orderTitle: 'Kalem',
    totalLabel: 'Ödenen tutar',
    paidAtLabel: 'Ödeme tarihi',
    next: 'Ekibimizden biri sonraki adımlar hakkında yakında sizinle iletişime geçecek.',
    invoice: 'Fatura mı gerekiyor? Bu e-postayı yanıtlamanız yeterli.',
  },

  judicialRequested: {
    subject: 'Resmî değerleme talebi | FINDDOME',
    preheader: 'Ekibimizden biri seçenekler hakkında sizinle iletişime geçecek.',
    heading: 'Talebinizi aldık',
    body: 'Teşekkürler, bir bilirkişi tarafından resmî (mahkeme tarafından atanan) değerleme istediğinizi kaydettik. Bu, web sitemizdeki piyasa verilerine dayalı tahmini değerlemeyle aynı şey değildir: yetkili bir bilirkişi tarafından, fiyat teklifine dayalı olarak yapılır.',
    next: 'Ekibimizden biri seçenekler ve fiyat teklifi hakkında sizinle iletişime geçecek.',
  },
} satisfies PublicEmailCopy;
