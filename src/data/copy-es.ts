/**
 * Contenido de las páginas, español (trato de usted).
 *
 * Para compradores y vendedores hispanohablantes, escrito a partir de los
 * mismos hechos que los textos húngaro y neerlandés: las cifras proceden de
 * src/config/company.ts, nunca de este archivo. El compilador lo compara con
 * el texto húngaro: si falta una clave, el build falla.
 */

import { COMPANY, COMMISSION, formatHours, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'es' as const;
const pct = (n: number) => `${n}\u00a0%`;
const hour = (hhmm: string) => {
  const [h, m] = hhmm.split(':');
  return `${Number(h)}:${m}`;
};

export const ES = {
  home: {
    meta: {
      title: 'FODEL Inmobiliaria | Comprar un inmueble en Hungría directamente al propietario',
      description:
        'Casas, fincas y casas señoriales en Hungría, a menudo directamente al propietario. Acompañamiento personal y contratos de compraventa bilingües.',
    },
    hero: {
      eyebrow: `Desde 2013 · ${foundedInLabel(L)}`,
      title: ['Inmuebles', 'en Hungría', 'directamente del propietario'],
      emphasis: 1,
      body: 'En buena parte de nuestros inmuebles figura el propietario. Puede negociar directamente con él o dejar todo el proceso en nuestras manos.',
      primary: 'Ver inmuebles',
      secondary: 'Búsqueda gratuita',
      featuredLabel: 'Destacado',
    },
    audiences: [
      {
        eyebrow: 'Para compradores',
        title: 'Inmuebles directamente\ndel propietario',
        body: 'Auténticas casas, fincas, casas señoriales y viñedos húngaros. Contacte directamente con el propietario o deje que FODEL gestione todo el proceso.',
        cta: 'Ver inmuebles',
        to: 'properties',
      },
      {
        eyebrow: 'Para vendedores',
        title: 'Su inmueble húngaro\nen Europa Occidental',
        body: `Publique su anuncio en ${REACH_LANGUAGES} idiomas y ${REACH_COUNTRIES} países, sin contrato de exclusividad. Solo se paga comisión si nosotros aportamos al comprador.`,
        cta: 'Más información',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Selección', title: 'Inmuebles destacados' },
    quote:
      '«Los neerlandeses a menudo no dan crédito cuando descubren lo que se puede comprar en Hungría, y a qué precio».',
    quoteSource: `${BRAND.es.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Cómo funciona', title: 'Así funciona FODEL' },
    cta: {
      eyebrow: 'Contacto',
      title: 'Le llamamos',
      titleEm: 'con mucho gusto',
      body: `${formatHours(L)} · La llamada de vuelta es gratuita.`,
    },
    referral: {
      eyebrow: 'Programa de recomendación',
      title: 'Recomiende a un anunciante',
      titleEm: `y reciba un ${pct(10)}`,
      body: `Si alguien publica un anuncio en FODEL por recomendación suya, obtiene un ${pct(10)} de descuento en su paquete y a usted le abonamos un ${pct(10)} en su próximo anuncio. ¿Ya anuncia con nosotros? Encontrará su código de recomendación en el portal, en «Instellingen» (Ajustes).`,
      steps: [
        'Recomiende a un conocido con el formulario de abajo o comparta su enlace personal del portal',
        'Un miembro de nuestro equipo se pone en contacto con esa persona',
        `Si publica un anuncio, se ahorra un ${pct(10)} y a usted le abonamos un ${pct(10)}`,
      ],
      formTitle: 'Recomendar a un conocido',
      fields: {
        referrerName: 'Su nombre',
        referrerEmail: 'Su correo electrónico',
        referredName: 'Nombre de la persona recomendada',
        referredEmail: 'Correo electrónico de la persona recomendada',
      },
      submit: 'Enviar recomendación',
    },
  },

  steps: [
    {
      num: '01',
      title: `Anuncios en ${REACH_COUNTRIES} países`,
      body: `Difundimos los anuncios en ${REACH_LANGUAGES} idiomas en los Países Bajos, Bélgica, Alemania, Inglaterra y otros países de la UE, sin contrato de exclusividad con el vendedor.`,
    },
    {
      num: '02',
      title: 'Contacto directo',
      body: 'Muchos anuncios indican, junto a nuestros datos de contacto, el nombre y el teléfono del propietario. Si llegan a un acuerdo entre ustedes, nadie paga comisión.',
    },
    {
      num: '03',
      title: 'Gestión integral',
      body: 'Contrato de compraventa bilingüe, representación mediante poder notarial, inscripción en el Registro de la Propiedad y cambio de titularidad de los contratos de agua, gas y electricidad.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Fundación' },
    { value: String(REACH_COUNTRIES), label: 'Países' },
    { value: String(REACH_LANGUAGES), label: 'Idiomas' },
    { value: pct(COMMISSION.percent), label: 'Comisión' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Vendedores | Su inmueble húngaro en Europa Occidental',
      description: `Publique su inmueble húngaro en ${REACH_LANGUAGES} idiomas y ${REACH_COUNTRIES} países, desde ${eur(69, L)} y sin exclusividad. Comisión solo si FODEL aporta al comprador: ${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} de IVA neerlandés.`,
    },
    hero: {
      eyebrow: 'Para vendedores',
      title: 'Su inmueble',
      titleEm: 'en Europa Occidental',
      body: `Con el modelo FODEL, su inmueble se publica en ${REACH_LANGUAGES} idiomas y ${REACH_COUNTRIES} países, sin contrato de exclusividad. Solo trabajamos con compradores serios.`,
      cta: 'Publicar un anuncio',
      secondary: 'Ver tarifas',
    },
    benefits: {
      eyebrow: 'Las ventajas',
      title: 'Lo que aporta un comprador extranjero',
      points: [
        'Compradores que pagan con fondos propios: sin esperar un préstamo ni una ayuda pública.',
        'Pago en una sola vez por transferencia bancaria, rápido y seguro.',
        `Verdadera intención de compra: una visita les cuesta dos días y entre ${eur(200, L)} y ${eur(300, L)}.`,
        'Precios realistas: sin regateos excesivos.',
        'FODEL valora personalmente a cada comprador antes de cualquier cita.',
      ],
    },
    personas: {
      eyebrow: 'Los compradores',
      title: 'Quién compra a través de FODEL',
      items: [
        {
          title: 'Jubilados',
          body: 'Buscan gastos más bajos, ventajas fiscales y una atención sanitaria asequible en Hungría.',
        },
        {
          title: 'Familias',
          body: 'Buscan espacio, naturaleza y vida en el campo. A menudo, una finca, una granja o una casa de vacaciones.',
        },
        {
          title: 'Inversores',
          body: 'Buscan locales comerciales, viñedos y tierras agrícolas.',
        },
        {
          title: 'Expatriados en busca de otro estilo de vida',
          body: 'Dejan atrás el alto coste de la vivienda y el ajetreo, y buscan un estilo de vida europeo auténtico.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Paso a paso', title: 'El modelo FODEL' },
    commission: {
      eyebrow: 'Tarifas',
      title: 'Comisión solo\ncuando se cierra la venta',
      body: `Si el comprador le contacta directamente y no necesita nuestra ayuda, no paga nada más que la tarifa del anuncio. Si FODEL interviene en la venta: ${pct(COMMISSION.percent)} neto (mín. ${eur(COMMISSION.minimumEur, L)}) + ${pct(COMMISSION.vatPercent)} de IVA neerlandés.`,
      cta: 'Ver tarifas',
    },
  },

  buyers: {
    meta: {
      title: 'Compradores | Comprar un inmueble en Hungría',
      description:
        'Compre un inmueble en Hungría con total seguridad: contrato bilingüe, representación mediante poder notarial e inscripción en el Registro de la Propiedad. Además, un servicio de búsqueda gratuito.',
    },
    hero: {
      eyebrow: 'Para compradores',
      title: 'Comprar en Hungría',
      titleEm: 'sin sorpresas',
      body: 'En muchos de nuestros inmuebles figura el propietario. Puede negociar directamente o dejar todo el proceso en nuestras manos.',
      cta: 'Ver inmuebles',
      secondary: 'Búsqueda gratuita',
    },
    services: {
      eyebrow: 'De qué nos encargamos',
      title: 'Un acompañamiento integral',
      points: [
        'La comunicación entre usted y el vendedor, con intérpretes incluidos.',
        'Las visitas, con un miembro de nuestro equipo que le acompaña.',
        'Ayuda en la negociación del precio y en la redacción del contrato bilingüe.',
        'Representación mediante poder notarial: no necesita viajar a Hungría para firmar.',
        'Inscripción en el Registro de la Propiedad y cambio de titularidad de los contratos de agua, gas y electricidad.',
      ],
    },
    reasons: {
      eyebrow: 'Por qué Hungría',
      title: 'Lo que buscan los compradores de Europa Occidental',
    },
  },

  about: {
    meta: {
      title: 'Sobre nosotros | Un puente entre dos mundos',
      description:
        'Desde 2013 ponemos en contacto a vendedores húngaros con compradores de Europa Occidental. Con discreción, transparencia y sin contrato de exclusividad.',
    },
    hero: {
      eyebrow: 'Sobre nosotros',
      title: 'Un puente entre',
      titleEm: 'dos mundos',
      body: 'Desde 2013 ayudamos a los vendedores húngaros a encontrar al comprador extranjero adecuado: con discreción, eficacia y sin contrato de exclusividad.',
    },
    origin: {
      eyebrow: 'Los inicios · Almere-Buiten, 2013',
      quote:
        '«Viviendo en Almere-Buiten, vimos cuánto anhelan los neerlandeses un estilo de vida europeo auténtico, mientras en Hungría los inmuebles más bonitos esperan a un propietario sin que nadie se fije en ellos».',
    },
    values: {
      eyebrow: 'Nuestros principios',
      title: 'En qué nos basamos',
      items: [
        {
          num: '01',
          title: 'Discreción',
          body: 'Tratamos los datos de vendedores y compradores con el máximo cuidado. Los datos personales solo se publican con su consentimiento.',
        },
        {
          num: '02',
          title: 'Transparencia',
          body: 'Sin costes ocultos. Nuestras tarifas y nuestra comisión están publicadas en este sitio web, y le mantenemos informado en cada paso.',
        },
        {
          num: '03',
          title: 'Bilingüismo',
          body: 'Conocemos ambos mercados desde dentro. Nuestro equipo habla neerlandés, alemán, inglés, francés y húngaro.',
        },
      ],
    },
    approach: {
      eyebrow: 'Nuestro enfoque',
      title: 'No somos una gran agencia.',
      titleEm: 'Esa es nuestra fuerza.',
      points: [
        'Cada cliente tiene un interlocutor personal: sin centralitas ni ventanillas anónimas.',
        'Conocemos ambas culturas desde dentro y valoramos cada inmueble tanto con mirada neerlandesa como húngara.',
        'Unir un inmueble con su comprador es responsabilidad nuestra, no cuestión de suerte.',
        'Trabajamos sin exclusividad, porque preferimos convencer con resultados.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'El puente que',
      titleEm: 'hemos construido',
      paragraphs: [
        'FODEL fue fundada por húngaros residentes en los Países Bajos. Empezamos en 2013 en Almere-Buiten, donde vimos que muchos neerlandeses y belgas querían comprar una auténtica casa húngara sin saber por dónde empezar.',
        `Hoy publicamos anuncios en ${REACH_COUNTRIES} países y ${REACH_LANGUAGES} idiomas, y acompañamos cada operación de principio a fin: contrato de compraventa bilingüe, representación mediante poder notarial e inscripción en el Registro de la Propiedad. Nuestra oficina está en La Haya.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Contacto | Le llamamos con mucho gusto',
      description: `Llámenos los días laborables entre las ${hour(COMPANY.hours.weekdays.from)} y las ${hour(COMPANY.hours.weekdays.to)}, o pida que le llamemos. La llamada no le cuesta nada.`,
    },
    hero: { eyebrow: 'Contacto', title: 'Le llamamos', titleEm: 'con mucho gusto' },
    formTitle: 'Solicitar una llamada',
    subjects: [
      'Pregunta sobre un inmueble',
      'Publicar un anuncio',
      'Solicitud de tarifas',
      'Solicitud de llamada',
      'Otro',
    ],
    note: `La llamada no le cuesta nada: corre de nuestra cuenta. Devolvemos las llamadas hasta las ${hour(COMPANY.hours.callback.to)}, también los fines de semana.`,
  },
} satisfies CopyShape;
