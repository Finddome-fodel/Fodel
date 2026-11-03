/**
 * FAQ, Turkish (formal siz). Buyer-facing, translated from the English set (src/data/faq-en.ts):
 * same ids, same order; every figure comes from src/config/company.ts.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'tr' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

const pct = (n: number) => `%${n}`;

export const FAQ_TR = [
  {
    id: 'direct-from-the-owner',
    question: '“Doğrudan sahibinden” ne anlama geliyor?',
    answer: [
      'Portföyümüzün büyük bölümünde mülk sahibinin adını ve telefon numarasını kendi iletişim bilgilerimizin yanında yayımlıyoruz. Satıcıyla doğrudan iletişime geçebilirsiniz.',
      'Doğrudan iletişime geçip satın almayı kendi aranızda ayarlarsanız kimse komisyon ödemez: ne siz ne de satıcı. Bu durumda yalnızca ilan için ücret alırız.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Aracılık hizmetinizin ücreti nedir?',
    answer: [
      `Komisyonumuz net ${pct(COMMISSION.percent)} olup en az ${eur(COMMISSION.minimumEur, L)} tutarındadır; buna ${pct(COMMISSION.vatPercent)} Hollanda KDV’si eklenir. Komisyonu siz değil, Macar satıcı öder.`,
      'Yalnızca üç koşulun tümü sağlandığında fatura keseriz: yazılı bir satış sözleşmesi vardır, alıcıyı FINDDOME yönlendirmiştir ve kapora ödenmiştir.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'AB vatandaşı olarak Macaristan’da mülk satın alabilir miyim?',
    answer: [
      'Evet. AB vatandaşı olarak Macaristan’da ev ve arsayı pratikte bir Macar vatandaşıyla aynı koşullarda satın alırsınız. Macaristan’daki mülklerin neredeyse %100’ü tam mülkiyetli arazi üzerindedir. Hollanda’daki erfpacht gibi uzun süreli kiralama düzenlemeleri nadirdir.',
      `Tarım arazileri için ayrı kurallar geçerlidir. Tarım alanında mesleki yeterliliğe sahip bir AB vatandaşı Macaristan’da en fazla ${AGRI_HECTARE_LIMIT} hektar edinebilir; bu süreci baştan sona biz yürütürüz.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'İmza için Macaristan’a gitmem gerekiyor mu?',
    answer: [
      'Hayır. Vekâletname ile sizi Macaristan’da temsil edebiliriz; bu nedenle imza için gelmenize gerek yoktur.',
      'Macar tapu siciline tescili ve abonelik devirlerini de biz üstleniriz.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Satış sözleşmesi hangi dilde hazırlanır?',
    answer: [
      'İki dilli sözleşmeler hazırlatırız; böylece imzaladığınız metni okuyabilirsiniz.',
      `Fiyat rehberi: Macarca başlangıç fiyatı ${price('hu')}, Almanca–Macarca ve İngilizce–Macarca başlangıç fiyatı ${price('de-hu')}, Hollandaca–Macarca başlangıç fiyatı ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'Satın alma sürecinde FINDDOME tam olarak neleri üstleniyor?',
    answer: [
      '- Telefon ve e-posta ile danışmanlık, iki taraf arasındaki iletişim',
      '- Yüz yüze görüşmeler ve yerinde mülk gezileri',
      '- Sizin dilinizi konuşan ve size eşlik eden bir çalışma arkadaşımız',
      '- Fiyat pazarlığında destek',
      '- Çok dilli sözleşmenin hazırlanması',
      '- Satın alma sürecinin tamamının yürütülmesi',
      '- Yeni malikin tescili ve abonelik devirleri',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Batı Avrupalı alıcılar neden Macaristan’ı seçiyor?',
    answer: [
      '- Mülk fiyatları ve yaşam maliyeti belirgin biçimde daha düşük',
      '- Macaristan’da emlak vergisi genellikle alınmıyor',
      '- Daha fazla güneş ve daha ılıman bir iklim',
      '- Ülke deniz seviyesinin üzerinde, kıtanın ortasında yer alıyor',
      '- Macaristan bir AB üye devleti',
      '- Mülklerin neredeyse tamamı tam mülkiyetli arazi üzerinde',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Macaristan’daki bir mülkün enerji sertifikası var mı?',
    answer: [
      'Evet. Macaristan’da enerji performans sertifikası (energiatanúsítvány) zorunludur ve ilanda belirtilmelidir. İlanlarımızda sınıf, özellikler arasında yer alır; “hazırlanıyor” ifadesi sertifikanın henüz hazırlanmakta olduğunu gösterir.',
      'Satıcı isterse sertifikanın hazırlanmasını biz organize edebiliriz.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'Arama hizmeti nedir ve ücreti nedir?',
    answer: [
      'Arama hizmeti ücretsizdir. Ne aradığınızı (tür, bölge, bütçe ve istekler) bize söylersiniz; biz de bu sitedeki mülklerle sınırlı kalmadan sizin için ararız.',
      'Macarca konuşan çalışma arkadaşlarımız pazarlıkta yardımcı olur ve sözleşmenin hukuka uygun biçimde hazırlanmasını sağlar. Uygun bir şey çıktığı anda size e-posta gönderilir.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Hangi bölgelerde çalışıyorsunuz?',
    answer: [
      'Odak noktamız Baranya, Tolna, Zala, Somogy ve Veszprém illeriyle Transdanubya bölgesi, ayrıca Balaton Gölü ve Balaton Yaylası.',
      'Ovada ve Budapeşte havalimanına ulaşımı kolay bölgelerde de mülklerimiz var.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Macarca bilmiyorum. Bu bir sorun mu?',
    answer: [
      'Hayır. Her ilanda mülk sahibinin hangi dilleri konuştuğu yazar; böylece bunu önceden bilirsiniz.',
      'Ekibimiz Hollandaca, Almanca, İngilizce, Fransızca ve Macarca konuşur ve mülk gezisinde size eşlik eder.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Size ne zaman ulaşabilirim?',
    answer: [
      `Hafta içi ${COMPANY.hours.weekdays.from} ile ${COMPANY.hours.weekdays.to} arasında. Geri arama talep ederseniz, hafta sonları dâhil en geç saat ${COMPANY.hours.callback.to} olana dek ararız.`,
      'Geri arama size hiçbir ücrete mal olmaz. Arama ücretini biz öderiz.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
