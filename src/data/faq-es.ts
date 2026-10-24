/**
 * Preguntas frecuentes, español (trato de usted). Para compradores, según el
 * modelo de la versión neerlandesa: todas las cifras proceden de
 * src/config/company.ts; aquí no se añade nada nuevo.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'es' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);
const pct = (n: number) => `${n}\u00a0%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const FAQ_ES = [
  {
    id: 'directamente-del-propietario',
    question: '¿Qué significa «directamente del propietario»?',
    answer: [
      'En buena parte de nuestros inmuebles publicamos, junto a nuestros propios datos de contacto, el nombre y el número de teléfono del propietario. Así puede ponerse en contacto directamente con el vendedor.',
      'Si contacta con él directamente y gestiona usted mismo la compra, nadie paga comisión, ni usted ni el vendedor. En ese caso, solo cobramos por el anuncio.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'comision',
    question: '¿Cuánto cuesta su intermediación?',
    answer: [
      `Nuestra comisión es del ${pct(COMMISSION.percent)} neto, con un mínimo de ${eur(COMMISSION.minimumEur, L)}, más un ${pct(COMMISSION.vatPercent)} de IVA neerlandés. La paga el vendedor húngaro, no usted.`,
      'Solo se cobra si se cumplen las tres condiciones: existe un contrato de compraventa por escrito, FODEL ha aportado al comprador y se ha pagado la señal.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'comprar-como-ciudadano-ue',
    question: '¿Puedo comprar un inmueble en Hungría como ciudadano de la UE?',
    answer: [
      'Sí. Como ciudadano de la UE, puede comprar casas y terrenos en Hungría prácticamente en las mismas condiciones que un húngaro. Casi el 100 % de los inmuebles húngaros se asienta sobre suelo en plena propiedad. El derecho de superficie a largo plazo, como el erfpacht neerlandés, es poco habitual.',
      `Para las tierras agrícolas rigen normas especiales. Un ciudadano de la UE con cualificación agraria puede adquirir hasta ${AGRI_HECTARE_LIMIT} hectáreas en Hungría; nos encargamos de todo el procedimiento.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'viajar-para-firmar',
    question: '¿Tengo que viajar a Hungría para firmar?',
    answer: [
      'No. Podemos representarle en Hungría mediante un poder notarial, de modo que no necesita desplazarse para la firma.',
      'También nos ocupamos de la inscripción en el Registro de la Propiedad húngaro y del cambio de titularidad de los contratos de agua, gas y electricidad.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'contrato-bilingue',
    question: '¿En qué idioma se redacta el contrato de compraventa?',
    answer: [
      'Encargamos contratos de compraventa bilingües, para que entienda lo que firma.',
      `Precios orientativos: en húngaro, desde ${price('hu')}; alemán–húngaro e inglés–húngaro, desde ${price('de-hu')}; neerlandés–húngaro, desde ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'de-que-se-encarga-fodel',
    question: '¿De qué se encarga FODEL en una compra?',
    answer: [
      '- Las gestiones por teléfono y correo electrónico, y la comunicación entre ambas partes',
      '- Las citas en persona y las visitas al inmueble',
      '- Un miembro de nuestro equipo que le acompaña sobre el terreno',
      '- Apoyo en la negociación del precio',
      '- La preparación del contrato multilingüe',
      '- Todos los trámites de la compra',
      '- La inscripción del nuevo propietario y el cambio de titularidad de los contratos de agua, gas y electricidad',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'por-que-hungria',
    question: '¿Por qué eligen Hungría los compradores de Europa Occidental?',
    answer: [
      '- La vivienda y el coste de la vida son bastante más bajos',
      '- Por lo general, Hungría no cobra impuesto sobre bienes inmuebles',
      '- Más sol y un clima más agradable',
      '- El país está por encima del nivel del mar, en el centro del continente',
      '- Hungría es un Estado miembro de la UE',
      '- Casi todos los inmuebles se asientan sobre suelo en plena propiedad',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'certificado-energetico',
    question: '¿Tienen certificado energético los inmuebles húngaros?',
    answer: [
      'Sí. En Hungría es obligatorio el certificado de eficiencia energética (energiatanúsítvány), que debe figurar en el anuncio. En nuestros anuncios, la calificación energética aparece entre las características; «En trámite» significa que el certificado aún se está preparando.',
      'Si el vendedor lo desea, podemos encargarnos de obtener el certificado.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'servicio-de-busqueda',
    question: '¿Qué es el servicio de búsqueda y cuánto cuesta?',
    answer: [
      'El servicio de búsqueda es gratuito. Nos indica lo que busca (tipo de inmueble, zona, presupuesto y preferencias) y buscamos por usted, también fuera de los inmuebles que aparecen en este sitio web.',
      'Nuestros compañeros de habla húngara le ayudan en la negociación y velan por que el contrato se redacte correctamente. Recibirá un correo en cuanto aparezca un inmueble adecuado.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'que-zonas',
    question: '¿En qué zonas ofrecen inmuebles?',
    answer: [
      'Estamos presentes sobre todo en Transdanubia, en los condados de Baranya, Tolna, Zala, Somogy y Veszprém, así como en los alrededores del lago Balaton y en las tierras altas del Balaton.',
      'También tenemos inmuebles en la Gran Llanura y en zonas bien comunicadas con el aeropuerto de Budapest.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'barrera-del-idioma',
    question: 'No hablo húngaro. ¿Es un problema?',
    answer: [
      'No. Cada anuncio indica los idiomas que habla el propietario, para que lo sepa de antemano.',
      'Nuestro equipo habla neerlandés, alemán, inglés, francés y húngaro, y le acompaña en la visita.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'cuando-localizarnos',
    question: '¿Cuándo puedo contactar con ustedes?',
    answer: [
      `Los días laborables, entre las ${hour(COMPANY.hours.weekdays.from)} y las ${hour(COMPANY.hours.weekdays.to)}. Si nos pide que le llamemos, devolvemos la llamada hasta las ${hour(COMPANY.hours.callback.to)}, también los fines de semana.`,
      'La llamada no le cuesta nada: corre de nuestra cuenta.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
