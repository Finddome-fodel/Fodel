/**
 * Páginas detalladas, español (trato de usted): servicios, inmuebles
 * agrícolas, guía de compra, vivir en Hungría, guía fotográfica. Las cifras
 * proceden de src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'es' as const;
const pct = (n: number) => `${n}\u00a0%`;
const des = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `desde ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_ES = {
  services: {
    metaTitle: 'Servicios: trámites, contrato y fotografía',
    metaDescription: `Contrato de compraventa bilingüe ${des('hu')}, representación mediante poder notarial, inscripción en el Registro de la Propiedad, certificado de eficiencia energética, fotografía inmobiliaria y tomas con dron.`,
    eyebrow: 'Servicios',
    title: 'Lo que hacemos más allá',
    titleEm: 'del anuncio',
    intro:
      'El anuncio es solo el primer paso. Con los servicios que figuran a continuación, nos encargamos por usted de todo el proceso de compraventa, conforme a las normas de ambos países.',
    sections: [
      {
        type: 'steps',
        title: 'Cómo se desarrolla la venta',
        items: [
          { n: '01', t: 'Contacto', b: 'Gestiones por teléfono y correo electrónico y comunicación con ambas partes, con intérpretes incluidos.' },
          { n: '02', t: 'Verificación del comprador', b: 'Comprobamos su trayectoria, su intención de compra y su solvencia.' },
          { n: '03', t: 'Visita', b: 'Concertamos las citas y le acompañamos con un miembro de nuestro equipo.' },
          { n: '04', t: 'Negociación', b: 'Apoyo en ambos idiomas, dentro de una horquilla de precios realista.' },
          { n: '05', t: 'Contrato', b: 'Contrato de compraventa bilingüe, redactado con un abogado.' },
          { n: '06', t: 'Cierre', b: 'Registro de la Propiedad, contratos de agua, gas y electricidad y, si es necesario, representación mediante poder notarial.' },
        ],
      },
      {
        type: 'table',
        title: 'Contrato de compraventa bilingüe',
        intro: 'Precios orientativos por combinación de idiomas. El precio final depende de la extensión del contrato.',
        rows: [
          ['Húngaro', des('hu')],
          ['Alemán–húngaro', des('de-hu')],
          ['Inglés–húngaro', des('en-hu')],
          ['Neerlandés–húngaro', des('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Servicios adicionales',
        intro: 'Para estos servicios elaboramos un presupuesto a medida:',
        items: [
          'Obtención del certificado de eficiencia energética: obligatorio en el anuncio según la normativa de la UE',
          'Fotografía inmobiliaria profesional',
          'Tomas con dron: especialmente eficaces para terrenos grandes y vistas',
          `Vídeo para el anuncio (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Representación mediante poder notarial',
        body: 'No necesita viajar a Hungría para firmar: con un poder notarial le representamos en la firma, ante el Registro de la Propiedad y en el cambio de titularidad de los contratos de agua, gas y electricidad.',
      },
      {
        type: 'prose',
        title: 'Cuándo se paga comisión',
        paragraphs: [
          `Solo cobramos comisión si FINDDOME ha aportado al comprador, existe un contrato de compraventa por escrito y se ha pagado la señal. La tarifa es del ${pct(COMMISSION.percent)} neto, con un mínimo de ${eur(COMMISSION.minimumEur, L)}, más un ${pct(COMMISSION.vatPercent)} de IVA neerlandés. La paga el vendedor, no el comprador.`,
        ],
      },
      {
        type: 'cta',
        title: '¿Tiene preguntas sobre el proceso?',
        body: '{hours} Pida que le llamemos sin coste alguno o escríbanos.',
        primary: { label: 'Contactar', to: 'contact' },
        secondary: { label: 'Preguntas frecuentes', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Inmuebles agrícolas: hasta ${AGRI_HECTARE_LIMIT} hectáreas en Hungría`,
    metaDescription: `Un ciudadano de la UE con cualificación agraria puede adquirir hasta ${AGRI_HECTARE_LIMIT} hectáreas de tierra en Hungría. FINDDOME se encarga de todo el procedimiento.`,
    eyebrow: 'Inmuebles agrícolas',
    title: 'Tierras agrícolas y',
    titleEm: 'fincas',
    intro:
      'El mercado de tierras húngaro tiene sus propias reglas. Quien conoce las condiciones accede a viñedos, tierras de cultivo, granjas y bosques.',
    sections: [
      {
        type: 'prose',
        title: `El límite de ${AGRI_HECTARE_LIMIT} hectáreas`,
        paragraphs: [
          `Un ciudadano de la UE con cualificación agraria puede adquirir en total ${AGRI_HECTARE_LIMIT} hectáreas de tierra en Hungría. Nos encargamos de todo el procedimiento.`,
          'El procedimiento consta de varios pasos ante las autoridades y comienza con el reconocimiento de su cualificación. Nuestro equipo le acompaña durante todo el proceso y prepara los documentos necesarios en ambos idiomas.',
        ],
      },
      {
        type: 'list',
        title: 'Qué adquieren nuestros clientes',
        items: [
          'Viñedos, con o sin bodega en funcionamiento',
          'Tierras de cultivo con derecho a ayudas de la UE',
          'Granjas con edificaciones anexas, aptas para la ganadería',
          'Bosques y fincas de uso mixto',
          'Grandes parcelas de una sola pieza como inversión',
        ],
      },
      {
        type: 'steps',
        title: 'El proceso',
        items: [
          { n: '01', t: 'Entrevista', b: 'Hablamos de sus planes y del presupuesto disponible.' },
          { n: '02', t: 'Reconocimiento de la cualificación', b: 'Nos ocupamos del reconocimiento de su cualificación agraria en Hungría.' },
          { n: '03', t: 'Búsqueda', b: 'Junto con nuestros socios, buscamos tierras que cumplan los requisitos.' },
          { n: '04', t: 'Autorizaciones', b: 'Solicitud de las autorizaciones necesarias para adquirir la tierra.' },
          { n: '05', t: 'Compra', b: 'Contrato bilingüe, inscripción en el Registro de la Propiedad y traspaso de las solicitudes de ayudas.' },
        ],
      },
      {
        type: 'callout',
        title: 'Importante',
        body: 'Las normas sobre la adquisición de tierras agrícolas cambian de vez en cuando y dependen de su situación concreta. Lo que aquí se expone tiene carácter informativo. Para un proyecto concreto, consulte siempre a nuestro equipo y a un jurista especializado.',
      },
      {
        type: 'cta',
        title: '¿Busca un inmueble agrícola?',
        body: 'Cuéntenos lo que desea; también buscamos más allá de los inmuebles anunciados.',
        primary: { label: 'Búsqueda gratuita', to: 'searchRequest' },
        secondary: { label: 'Nuestros inmuebles', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Comprar en Hungría: el proceso paso a paso',
    metaDescription:
      'Cómo es la compra de un inmueble en Hungría para un comprador extranjero: contrato, señal, Registro de la Propiedad, contratos de agua, gas y electricidad, y gastos que debe prever.',
    eyebrow: 'Para compradores',
    title: 'Comprar en',
    titleEm: 'Hungría',
    intro:
      'El proceso de compra en Hungría es muy previsible en cuanto se conocen sus pasos. Esta guía le lleva por ellos.',
    sections: [
      {
        type: 'steps',
        title: 'El proceso',
        items: [
          { n: '01', t: 'Selección', b: 'Elija entre nuestros inmuebles o envíe una solicitud de búsqueda gratuita.' },
          { n: '02', t: 'Visita', b: 'Organizamos el viaje y la visita, con intérprete.' },
          { n: '03', t: 'Oferta', b: 'Le ayudamos a presentar una oferta realista y a negociar.' },
          { n: '04', t: 'Contrato y señal', b: `Contrato de compraventa bilingüe, normalmente con una señal del ${pct(10)}.` },
          { n: '05', t: 'Precio de compra', b: 'El resto del precio, por transferencia bancaria, según lo pactado en el contrato.' },
          { n: '06', t: 'Entrega de llaves', b: 'Inscripción en el Registro de la Propiedad, contratos de suministros y entrega de llaves.' },
        ],
      },
      {
        type: 'list',
        title: 'Gastos además del precio de compra',
        items: [
          'Impuesto de transmisiones: el tipo depende del tipo de inmueble y de su situación',
          'Honorarios del abogado por la redacción y la contrafirma de la escritura',
          `Traducción del contrato bilingüe: ${des('hu')}, según la combinación de idiomas`,
          'Tasas del Registro de la Propiedad',
          'La posible comisión de FINDDOME: la paga el vendedor, no usted',
        ],
      },
      {
        type: 'prose',
        title: 'No necesita estar presente',
        paragraphs: [
          'Con un poder notarial le representamos en la firma, ante el Registro de la Propiedad y en el cambio de titularidad de los contratos de agua, gas y electricidad. Así, la compra puede realizarse aunque usted no pueda o no quiera viajar.',
        ],
      },
      {
        type: 'callout',
        title: 'Certificado de eficiencia energética',
        body: 'En Hungría es obligatorio el certificado de eficiencia energética, que según la normativa de la UE también debe figurar en el anuncio. En nuestros anuncios encontrará la calificación entre las características; «En trámite» significa que el certificado aún se está preparando.',
      },
      {
        type: 'cta',
        title: 'Empecemos',
        body: 'Consulte nuestros inmuebles o díganos qué busca. No le cuesta nada.',
        primary: { label: 'Nuestros inmuebles', to: 'properties' },
        secondary: { label: 'Búsqueda gratuita', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Vivir en Hungría: por qué los neerlandeses dan el paso',
    metaDescription:
      'Las cuatro razones por las que neerlandeses y belgas se trasladan a Hungría: relación calidad-precio, espacio, menor coste de vida y ubicación geográfica.',
    eyebrow: 'Contexto',
    title: 'Vivir en',
    titleEm: 'Hungría',
    intro:
      'Muchos neerlandeses y belgas eligen Hungría. En cientos de conversaciones con nuestros clientes, se repiten una y otra vez las mismas cuatro razones.',
    sections: [
      {
        type: 'prose',
        title: 'Relación calidad-precio',
        paragraphs: [
          `Los inmuebles rurales húngaros están entre los de mejor relación calidad-precio de Europa. En los Países Bajos, un solar de 125 m² cuesta fácilmente ${eur(88000, L)}, y una plaza de garaje, unos ${eur(100000, L)}. Por esa misma cantidad, en el campo húngaro se compra una amplia casa familiar, a menudo con un buen terreno.`,
        ],
      },
      {
        type: 'prose',
        title: 'Espacio',
        paragraphs: [
          'Los Países Bajos tienen 482 habitantes por km² y unos 17 millones de habitantes, y una parte importante del país es agua. La falta de espacio no es un problema abstracto, sino una experiencia diaria, y la razón que más se menciona.',
        ],
      },
      {
        type: 'prose',
        title: 'Coste de vida',
        paragraphs: [
          'Buena parte de nuestros compradores están jubilados o a punto de jubilarse. Para ellos, el menor coste de vida, la ausencia de impuesto sobre bienes inmuebles y una atención sanitaria asequible ofrecen, en conjunto, un nivel de vida que la misma pensión no les permitiría en los Países Bajos.',
        ],
      },
      {
        type: 'prose',
        title: 'Ubicación geográfica',
        paragraphs: [
          'Desde las inundaciones de 1953, los Países Bajos han construido un enorme sistema de defensa contra el agua. La preocupación por la subida del nivel del mar pesa en muchas decisiones: Hungría está en el corazón del continente, por encima del nivel del mar.',
        ],
      },
      {
        type: 'cta',
        title: 'Descúbralo usted mismo',
        body: 'Consulte nuestros inmuebles o deje que busquemos lo que tiene en mente.',
        primary: { label: 'Nuestros inmuebles', to: 'properties' },
        secondary: { label: 'Comprar en Hungría', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Guía fotográfica para anunciantes',
    metaDescription:
      'Unas buenas fotos son la mejor forma de vender rápido. La guía fotográfica de FINDDOME: luz, encuadre, resolución y los errores más frecuentes.',
    eyebrow: 'Para vendedores',
    title: 'Guía',
    titleEm: 'fotográfica',
    intro:
      'Los compradores extranjeros ven primero las fotos, y a menudo solo las fotos. Estas reglas valen más que cualquier texto de anuncio.',
    sections: photoGuideSections(L, {
      topTitle: 'Las seis reglas esenciales',
      calloutTitle: '¿Prefiere delegarlo?',
      calloutBody: (lines) =>
        `Recurra a un profesional. Puede elegirlo con un clic al publicar su anuncio: ${lines.join('; ')}. Ninguna de las dos es obligatoria; un miembro de nuestro equipo se pondrá en contacto con usted para concertar una cita.`,
      ctaTitle: '¿Listo para publicar su anuncio?',
      primary: 'Publicar un anuncio',
      secondary: 'Tarifas',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
