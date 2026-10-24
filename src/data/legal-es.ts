/**
 * Páginas legales, español (trato de usted). Traducción fiel de las páginas
 * neerlandesas (src/data/pages-legal.ts): mismas secciones, mismas cifras,
 * mismo sentido.
 *
 * ⚠️ Traducción de cortesía. Debe validarla el cliente junto con un jurista
 * antes del lanzamiento, igual que los originales húngaro y neerlandés. Las
 * frases que se apoyan en el derecho neerlandés o húngaro (funciones RGPD,
 * IVA neerlandés, autoridad neerlandesa, derecho de desistimiento, plataforma
 * de resolución de litigios en línea) figuran en Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import { nOf } from '~/i18n/plural';
import type { LegalKey } from '~/data/pages-legal';

const L = 'es' as const;
const pct = (n: number) => `${n}\u00a0%`;
const months = (n: number) => nOf(L, n, 'mes', 'meses');
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 de julio de 2026';
const notice =
  'Esta versión es una traducción facilitada por comodidad. En caso de discrepancia, prevalece el original neerlandés (en las cuestiones sujetas al derecho neerlandés) o el húngaro.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_ES = {
  imprint: {
    metaTitle: 'Aviso legal: datos de la empresa',
    metaDescription: `Datos de la empresa ${COMPANY.names.legal}: domicilio social, número de IVA, número KvK y datos de contacto.`,
    eyebrow: 'Aviso legal',
    title: 'Datos de',
    titleEm: 'la empresa',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Información del prestador del servicio',
        rows: [
          ['Razón social', COMPANY.names.legal],
          ['Domicilio social', addressLine(COMPANY.address, L)],
          ['N.º de IVA', COMPANY.registration.vat],
          ['Número KvK (Registro Mercantil neerlandés)', kvk],
          ['Representante', COMPANY.principal],
          ['Correo electrónico', COMPANY.email.primary],
          ['Teléfono', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Año de fundación', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Cuentas bancarias',
        rows: [
          ['Países Bajos', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Hungría', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Litigios',
        body: 'En caso de litigio de consumo, también puede recurrir a la plataforma europea de resolución de litigios en línea: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Política de privacidad',
    metaDescription:
      'Cómo trata FODEL sus datos personales: qué datos tratamos, cuánto tiempo los conservamos y qué derechos le reconoce el RGPD.',
    eyebrow: 'Privacidad',
    title: 'Política de',
    titleEm: 'privacidad',
    intro:
      'Esta política describe cómo tratamos los datos personales que nos facilita a través de este sitio web, de conformidad con el RGPD.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Responsable del tratamiento',
        rows: [
          ['Responsable', COMPANY.names.legal],
          ['Dirección', addressLine(COMPANY.address, L)],
          ['Correo electrónico', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Los datos que tratamos',
        intro: 'Solo los datos que usted mismo introduce en nuestros formularios:',
        items: [
          'Nombre, correo electrónico y teléfono: para poder responder a su solicitud',
          'El asunto y el contenido de su mensaje',
          'En un anuncio: los datos del inmueble y sus datos de facturación',
          'En una solicitud de búsqueda: sus criterios de búsqueda',
          'Para la gestión interna: cuándo y qué formulario rellenó y cuándo inició sesión en el portal, sin registrar direcciones IP',
        ],
      },
      {
        type: 'table',
        title: 'Base jurídica y plazo de conservación',
        rows: [
          ['Contacto y solicitud de llamada', 'Consentimiento (art. 6, apdo. 1, letra a, del RGPD): 12 meses'],
          ['Contratación de un anuncio', 'Ejecución de un contrato (art. 6, apdo. 1, letra b): 7 años, plazo legal de conservación fiscal'],
          ['Solicitud de búsqueda', 'Consentimiento: hasta que concluya, 24 meses como máximo'],
          ['Registro de actividad interno', 'Interés legítimo (art. 6, apdo. 1, letra f): gestión ordenada y detección de abusos: 24 meses como máximo'],
        ],
      },
      {
        type: 'list',
        title: 'Con quién compartimos los datos',
        intro: 'No vendemos sus datos ni los compartimos con fines de marketing. Nuestros encargados del tratamiento son:',
        items: [
          'Nuestro proveedor de correo electrónico, con tratamiento dentro de la UE',
          'El proveedor de alojamiento de este sitio web',
          'En caso de compra, y solo a petición suya: la otra parte y el abogado correspondiente',
        ],
      },
      {
        type: 'callout',
        title: 'Sobre los anuncios',
        body: 'Como anunciante, puede autorizarnos a mostrar su nombre y su número de teléfono junto al anuncio, para que los interesados puedan contactar con usted directamente. Puede retirar esta autorización en cualquier momento; en ese caso, eliminaremos esos datos del anuncio.',
      },
      // BORRADOR: pendiente de revisión jurídica (boletín, 2026-10).
      {
        type: 'callout',
        title: 'Boletín',
        body: 'Si se suscribe a nuestro boletín, tratamos su dirección de correo electrónico, el idioma elegido y la hora de la suscripción y de la confirmación, únicamente para enviarle el boletín y sobre la base de su consentimiento. La suscripción se realiza en dos pasos: no enviamos nada hasta que usted haga clic en el botón del correo de confirmación. En cada correo puede darse de baja con un solo clic, y dejamos de enviarlo de inmediato. Para el envío utilizamos el servicio Resend.',
      },
      {
        type: 'list',
        title: 'Sus derechos',
        items: [
          'Acceso a los datos que tratamos sobre usted',
          'Rectificación y supresión',
          'Limitación del tratamiento u oposición a este',
          'Portabilidad de los datos',
          'Retirada de su consentimiento en cualquier momento',
          'Presentación de una reclamación ante la autoridad neerlandesa de protección de datos (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Contacto en materia de privacidad',
        paragraphs: [`Puede enviar sus preguntas o solicitudes a ${COMPANY.email.primary}. Respondemos en un plazo máximo de 30 días.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Política de cookies',
    metaDescription: `Las cookies que utiliza ${SITE_HOST} y cómo cambiar su elección.`,
    eyebrow: 'Cookies',
    title: 'Política de',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Por ahora, este sitio web solo utiliza almacenamiento de datos técnicamente necesario. No ejecutamos scripts publicitarios ni de seguimiento y no compartimos nada con redes sociales.',
        ],
      },
      {
        type: 'table',
        title: 'Qué guardamos',
        rows: [
          [
            'fodel:consent',
            'Su elección sobre las cookies (aceptadas o rechazadas). Se guarda en su navegador y no nos llega a nosotros. Plazo de conservación: 12 meses.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Estadísticas',
        paragraphs: [
          'Si algún día midiéramos las visitas, solo lo activaríamos con su consentimiento previo y expreso. Rechazarlo no limita en absoluto el uso del sitio web.',
        ],
      },
      {
        type: 'prose',
        title: 'Cambiar su elección',
        paragraphs: [
          'Puede cambiar su elección en cualquier momento borrando los datos que su navegador ha guardado para este sitio web; el aviso de cookies volverá a aparecer.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Condiciones generales',
    metaDescription:
      'Las condiciones del servicio de anuncios e intermediación de FODEL: tarifas, comisión, desistimiento y responsabilidad.',
    eyebrow: 'Condiciones',
    title: 'Condiciones',
    titleEm: 'generales',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Tenga en cuenta',
        body: 'Esta página es un resumen. Las condiciones completas y aplicables están disponibles en PDF; en caso de discrepancia, prevalece el PDF.',
      },
      {
        type: 'prose',
        title: '1. El servicio',
        paragraphs: [
          'FODEL publica anuncios de inmuebles húngaros en sus propios sitios web multilingües y, en virtud de un acuerdo independiente, participa en la tramitación de la venta.',
          'El servicio de anuncios no es exclusivo: el vendedor también puede ofrecer y vender el inmueble por otros canales.',
        ],
      },
      {
        type: 'list',
        title: '2. Publicar un anuncio',
        ordered: true,
        items: [
          'El vendedor rellena el formulario de registro.',
          'FODEL envía una solicitud de pago por el paquete elegido.',
          'El vendedor paga por transferencia bancaria.',
          'Una vez recibido el pago, el vendedor puede subir fotos.',
          'FODEL se encarga de la traducción y publica el anuncio.',
        ],
      },
      {
        type: 'table',
        title: '3. Tarifas',
        intro: `Todos los precios incluyen un ${pct(LISTING_VAT_PERCENT)} de IVA neerlandés. Consulte la página de tarifas para ver el resumen completo.`,
        rows: [
          [`Anuncio económico (${months(cheap.months)})`, eur(cheap.priceEur, L)],
          [`Anuncio normal (${months(normal.months)})`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Traducción', `${eur(extra('translation').priceEur, L)} por idioma`],
          [
            'Destacado',
            `De ${extra('category-highlight').priceEur} a ${eur(extra('homepage-highlight').priceEur, L)} al mes (mín. ${months(minMonths)})`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Comisión',
        paragraphs: [
          'Solo se devenga comisión si se cumplen todas las condiciones siguientes: contrato de compraventa por escrito, comprador aportado por FODEL y señal pagada.',
          `La comisión es del ${pct(COMMISSION.percent)} neto, con un mínimo de ${eur(COMMISSION.minimumEur, L)}, más un ${pct(COMMISSION.vatPercent)} de IVA neerlandés.`,
          'Si el interesado se dirige directamente al vendedor y no se necesita nuestra ayuda en la tramitación, no se debe nada aparte de la tarifa del anuncio.',
        ],
      },
      {
        type: 'prose',
        title: '5. Retirar el anuncio',
        paragraphs: [
          'El vendedor puede retirar el anuncio antes de su fecha de vencimiento. En ese caso, la tarifa del anuncio ya pagada no se reembolsa.',
        ],
      },
      {
        type: 'prose',
        title: '6. Responsabilidad',
        paragraphs: [
          'El vendedor es responsable de la exactitud de la información sobre el inmueble. FODEL reproduce la información facilitada y no asume ninguna responsabilidad sobre su exactitud.',
          'Las traducciones de este sitio web tienen carácter informativo; en caso de litigio, prevalece la versión húngara.',
        ],
      },
      {
        type: 'prose',
        title: '7. Derecho de desistimiento',
        paragraphs: [
          'Un vendedor que sea consumidor dispone del derecho legal de desistimiento en los contratos celebrados a distancia. Si solicita expresamente la ejecución inmediata, el derecho de desistimiento se reduce en proporción al servicio ya prestado.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Declaración de accesibilidad',
    metaDescription: `El nivel de accesibilidad de ${SITE_HOST}, la norma aplicada y cómo hacernos llegar sus comentarios.`,
    eyebrow: 'Accesibilidad',
    title: 'Declaración de',
    titleEm: 'accesibilidad',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Queremos que este sitio web pueda utilizarlo todo el mundo, también quienes usan un lector de pantalla, el teclado o la ampliación de pantalla.',
          'Desarrollamos el sitio conforme a la norma WCAG 2.2, nivel AA. Una parte importante de nuestros visitantes está jubilada, por lo que el tamaño del texto, el contraste y la navegación con teclado tienen prioridad.',
        ],
      },
      {
        type: 'list',
        title: 'Qué hemos implementado',
        items: [
          'Todo el texto tiene una relación de contraste mínima de 4,5:1',
          'Navegación completa con teclado e indicador de foco visible',
          'Un enlace «Ir al contenido» en la parte superior de cada página',
          'Textos alternativos significativos en todas las imágenes',
          'Campos de formulario con etiquetas asociadas y mensajes de error en texto',
          'Respeto del ajuste del sistema «Reducir movimiento»',
          'El sitio web es legible y utilizable sin JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Limitaciones conocidas',
        paragraphs: ['No podemos influir en la accesibilidad de contenidos de terceros, como un servicio de mapas.'],
      },
      {
        type: 'prose',
        title: 'Sus comentarios',
        paragraphs: [
          `¿Ha encontrado algún obstáculo? Comuníquenoslo en ${COMPANY.email.primary} o por teléfono. Atendemos los avisos lo antes posible.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
