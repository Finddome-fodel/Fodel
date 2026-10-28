/**
 * Textos de los correos en español (trato de usted). El compilador los
 * comprueba frente al archivo húngaro (`satisfies PublicEmailCopy`): si falta
 * una plantilla, este archivo no compila y nadie recibe un correo en húngaro o
 * en neerlandés. Los avisos a la oficina (admin*) siguen en húngaro y no se
 * incluyen aquí.
 *
 * Tono: sobrio, frases cortas, sin exclamaciones. Muchos vendedores están
 * jubilados: la claridad va antes que la calidez, y ambas antes que el tono
 * publicitario. Comillas españolas «…», sin espacio antes de «:» ni de «?».
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const ES = {
  common: {
    greeting: (name: string) => `Hola, ${name}:`,
    greetingNoName: 'Hola:',
    signOff: 'Atentamente,\nFINDDOME Inmobiliaria',
    questions: '¿Alguna pregunta? Basta con responder a este correo.',
    linkFallback: '¿No funciona el botón? Copie esta dirección en su navegador:',
  },

  registrationConfirm: {
    subject: 'Defina su contraseña | FINDDOME',
    preheader: 'Un clic y podrá preparar su anuncio.',
    heading: 'Defina su contraseña',
    intro: 'Gracias por registrarse. Su cuenta está casi lista; solo falta la contraseña.',
    cta: 'Definir la contraseña',
    next: 'Después pasará directamente a su anuncio: paquete, datos y fotos. No lo revisaremos hasta que nos lo envíe.',
    expiry: 'El enlace es válido durante 7 días. Si no se ha registrado usted, ignore este correo: no se creará ninguna cuenta.',
  },

  accountExists: {
    subject: 'Ya tiene una cuenta en FINDDOME',
    preheader: 'Inicie sesión o defina una contraseña nueva.',
    heading: 'Ya existe una cuenta con esta dirección',
    body: 'Alguien acaba de intentar registrarse en el sitio web de FINDDOME con esta dirección de correo electrónico. Como ya existe una cuenta con ella, no hemos creado una nueva.',
    cta: 'Iniciar sesión',
    reset: '¿Ha olvidado su contraseña? Solicite una nueva',
    ignore: '¿No ha sido usted? No tiene que hacer nada: su cuenta sigue igual.',
  },

  invite: {
    subject: 'Invitación al portal de FINDDOME',
    preheader: 'Defina su contraseña y acceda al área de anunciantes.',
    heading: 'Le invitamos al portal de FINDDOME',
    body: (role: string) =>
      `FINDDOME le invita a unirse al portal ${role}, donde se gestionan anuncios inmobiliarios.`,
    roleAdmin: 'como administrador',
    roleOwner: 'como anunciante',
    cta: 'Aceptar la invitación',
    expiry: 'El enlace es válido durante 7 días y solo puede utilizarse una vez.',
  },

  welcome: {
    subject: 'Bienvenido al portal de FINDDOME',
    preheader: 'Su cuenta está activa. Así publicará su primer anuncio.',
    heading: (name: string) => `Le damos la bienvenida, ${name}`,
    body: 'Su cuenta está activa. En el portal puede preparar su anuncio, subir las fotos y seguir su revisión.',
    stepsTitle: 'Qué necesitará',
    steps: [
      'Fotos del inmueble: como mínimo una, pero cuantas más, mejor',
      'Los datos básicos: superficie habitable, superficie de la parcela y precio de venta',
      'Unas frases sobre lo que hace especial el inmueble',
    ],
    cta: 'Ir al portal',
  },

  submissionReceived: {
    subject: (ref: string) => `Hemos recibido su anuncio (#${ref})`,
    preheader: 'Lo revisamos y le responderemos por correo electrónico.',
    heading: 'Hemos recibido su anuncio',
    body: (title: string, ref: string) =>
      `Hemos recibido su anuncio «${title}» (#${ref}). Un miembro de nuestro equipo lo revisará y, en cuanto se tome una decisión, se la comunicaremos por correo electrónico.`,
    timing: 'La revisión no suele durar más de dos días laborables.',
    note: 'Durante la revisión no puede modificar el anuncio. Si le pedimos algún cambio, volverá a estar editable de inmediato.',
  },

  changesRequested: {
    subject: (ref: string) => `Es necesario un cambio (#${ref})`,
    preheader: 'Un pequeño cambio y el anuncio podrá publicarse.',
    heading: 'Le pedimos un cambio',
    body: (title: string, ref: string) =>
      `Sobre su anuncio «${title}» (#${ref}), nuestro compañero le hace la siguiente observación:`,
    after: 'El anuncio vuelve a ser editable. Haga el cambio y envíelo de nuevo; después, todo seguirá su curso normal.',
    cta: 'Modificar el anuncio',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Aprobado (#${ref}): solo falta el pago`,
    preheader: 'Su anuncio está aprobado y se publicará en cuanto recibamos el pago.',
    heading: 'Su anuncio está aprobado',
    body: (title: string, ref: string) =>
      `Buenas noticias: hemos revisado y aprobado su anuncio «${title}» (#${ref}). Solo falta el pago. En cuanto lo recibamos, el anuncio se publicará de inmediato.`,
    orderTitle: 'Coste del anuncio',
    discountLabel: 'Descuento por recomendación (10 %)',
    totalLabel: 'Importe pendiente',
    ctaCard: 'Pagar con tarjeta',
    cardNote: 'El pago se realiza en el entorno seguro de Stripe. FINDDOME no ve ni guarda los datos de su tarjeta.',
    bankTitle: 'O por transferencia bancaria',
    bankNote: (ref: string) =>
      `Indique esta referencia en la transferencia: ${ref}. En cuanto llegue, nuestro equipo publicará el anuncio.`,
    vatNote: 'Todos los importes indicados incluyen un 21 % de IVA neerlandés.',
  },

  approvedPublished: {
    subject: (ref: string) => `Aprobado y publicado (#${ref})`,
    preheader: 'Su anuncio ya está publicado; abone la tarifa en un plazo de 14 días.',
    heading: 'Su anuncio está publicado',
    body: (title: string, ref: string) => `Hemos aprobado el anuncio «${title}» (#${ref}) y lo hemos publicado de inmediato.`,
    viewCta: 'Ver el anuncio',
    orderTitle: 'Coste del anuncio',
    discountLabel: 'Descuento por recomendación (10 %)',
    totalLabel: 'Importe pendiente',
    dueLabel: 'Fecha límite de pago',
    ctaCard: 'Pagar con tarjeta',
    cardNote: 'El pago se realiza en el entorno seguro de Stripe. FINDDOME no ve ni guarda los datos de su tarjeta.',
    bankTitle: 'Transferencia bancaria',
    bankNote: (ref: string) => `Indique esta referencia en la transferencia: ${ref}.`,
    vatNote: 'Todos los importes indicados incluyen un 21 % de IVA neerlandés.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Confirmación de pago (#${ref})`,
    preheader: 'Gracias, hemos recibido su pago.',
    heading: 'Gracias, hemos recibido su pago',
    body: (title: string, ref: string) =>
      `Hemos recibido el pago del anuncio «${title}» (#${ref}). El anuncio está publicado y puede verse en ${SITE_HOST}.`,
    orderTitle: 'Detalle',
    discountLabel: 'Descuento por recomendación (10 %)',
    totalLabel: 'Importe pagado',
    vatNote: 'El importe incluye un 21 % de IVA neerlandés. Recibirá la factura en un correo aparte.',
    paidAtLabel: 'Fecha de pago',
  },

  published: {
    subject: (ref: string) => `Su anuncio está publicado (#${ref})`,
    preheader: `El anuncio ya puede verse en ${SITE_HOST}.`,
    heading: 'Su anuncio está publicado',
    body: (title: string, ref: string) =>
      `Su anuncio «${title}» (#${ref}) está en ${SITE_HOST} y llega a compradores de ocho países.`,
    cta: 'Ver el anuncio',
    next: 'En cuanto alguien muestre interés, le enviaremos de inmediato un correo con sus datos de contacto. Puede consultar en todo momento el estado de su anuncio en el portal.',
  },

  newEnquiry: {
    subject: (ref: string) => `Nueva consulta (#${ref})`,
    preheader: 'Alguien está interesado en su inmueble.',
    heading: 'Nueva respuesta a su anuncio',
    body: (title: string, ref: string) =>
      `Alguien ha respondido a su anuncio «${title}» (#${ref}):`,
    labels: { name: 'Nombre', email: 'Correo electrónico', phone: 'Teléfono' },
    messageTitle: 'Su mensaje',
    advice: 'Le recomendamos ponerse en contacto con esta persona en un plazo de dos días: responder rápido es, con diferencia, lo que más influye en que una venta salga adelante.',
  },

  passwordReset: {
    subject: 'Restablecer la contraseña | Portal de FINDDOME',
    preheader: 'El enlace es válido durante una hora.',
    heading: 'Restablecer la contraseña',
    body: 'Hemos recibido una solicitud para restablecer la contraseña de su cuenta en el portal de FINDDOME. Haga clic en el botón de abajo para definir una nueva.',
    cta: 'Definir una contraseña nueva',
    expiry: 'El enlace es válido durante una hora y solo puede utilizarse una vez.',
    ignore: '¿No ha hecho usted esta solicitud? Ignore este correo. Su contraseña no cambiará y no ocurrirá nada.',
  },

  referralRegistered: {
    subject: 'Hemos recibido su recomendación | FINDDOME',
    preheader: 'Un miembro de nuestro equipo se pondrá pronto en contacto con la persona recomendada.',
    heading: 'Gracias por la recomendación',
    body: (referredName: string) =>
      `Hemos recibido los datos de contacto de ${referredName}. Un miembro de nuestro equipo se pondrá en contacto con esta persona y, en cuanto publique su anuncio, le descontaremos un 10 % del coste de su próximo anuncio.`,
    note: 'El descuento se aplica manualmente, después de que el anunciante haya pagado. Le avisaremos en cuanto sea posible.',
  },

  valuationReceived: {
    heading: 'Hemos recibido su solicitud de valoración',
    body: 'Un miembro de nuestro equipo revisará los datos del inmueble y nuestra base de datos y, después, le enviará por correo electrónico la valoración orientativa, basada en el mercado.',
  },

  valuationReady: {
    subject: 'Su valoración está lista | FINDDOME',
    preheader: 'Hemos preparado una valoración orientativa de su inmueble.',
    heading: 'Su valoración está lista',
    body: (range: string) =>
      `Según los datos facilitados y los inmuebles comparables, nuestra valoración orientativa es: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Esta valoración es orientativa: no es una tasación ni sustituye a una tasación oficial. Se basa en ${n} ${n === 1 ? 'inmueble comparable' : 'inmuebles comparables'}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Esta valoración es orientativa: no es una tasación ni sustituye a una tasación oficial.',
    cta: 'Publicar un anuncio',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Según los datos facilitados, el valor orientativo, basado en el mercado, es: ${range}.`,
    mid: 'Valor medio',
    basis: 'Base de datos',
    rateDate: 'Fecha del tipo de cambio',
    source: 'Fuente',
    factorsHeading: 'Factores',
    dirPlus: 'Aumenta el valor',
    dirMinus: 'Reduce el valor',
    dirUnsure: 'Incierto',
    visit: 'Solicitar la visita de Gábor',
    judicial: 'Solicitar una tasación oficial',
  },

  valuationDeclined: {
    subject: 'Su solicitud de valoración | FINDDOME',
    preheader: 'Un miembro de nuestro equipo se pondrá en contacto con usted personalmente.',
    heading: 'Gracias por su solicitud',
    body: 'Con los datos facilitados, ahora mismo disponemos de muy pocos inmuebles comparables para una valoración fiable. Un miembro de nuestro equipo se pondrá en contacto con usted personalmente.',
  },

  valuationNeedsInfo: {
    subject: 'Valoración: nos faltan algunos datos',
    preheader: 'Necesitamos algo más de información para la valoración.',
    heading: 'Nos faltan algunos datos',
    body: 'Gracias por su solicitud de valoración. Para prepararla, nuestro compañero le pide lo siguiente:',
    after: 'Responda a este correo con los datos que faltan. En cuanto los recibamos, prepararemos la valoración.',
  },

  rejected: {
    subject: (ref: string) => `Su anuncio no puede publicarse (#${ref})`,
    preheader: 'El resultado de la revisión y los motivos.',
    heading: 'No podemos publicar el anuncio',
    body: (title: string, ref: string) =>
      `Lo sentimos: tras la revisión, nuestro compañero no ha aprobado su anuncio «${title}» (#${ref}). Los motivos son los siguientes:`,
    refund: '¿Ya ha pagado el anuncio? Nos pondremos en contacto con usted por separado para el reembolso.',
    after: '¿Tiene alguna pregunta o cree que se trata de un malentendido? Basta con responder a este correo.',
  },

  invoiceIssued: {
    subject: (number: string) => `Factura ${number}`,
    preheader: 'La factura está lista; puede consultarla o descargarla con el enlace.',
    heading: 'Su factura está lista',
    body: (title: string, ref: string, number: string) =>
      `La factura ${number} correspondiente a su anuncio «${title}» (#${ref}) está lista.`,
    cta: 'Ver la factura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Factura rectificativa ${number}`,
    preheader: 'Hemos emitido una factura rectificativa de su factura anterior.',
    heading: 'Factura rectificativa disponible',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Para la factura ${correctsNumber} de su anuncio «${title}» (#${ref}) hemos emitido la factura rectificativa ${number}.`,
    cta: 'Ver la factura rectificativa',
  },

  serviceRequested: {
    subject: 'Hemos recibido su solicitud | FINDDOME',
    preheader: 'Un miembro de nuestro equipo se pondrá en contacto con usted para concertar una cita.',
    heading: 'Hemos recibido su solicitud',
    body: (service: string, price: string) => `Gracias, hemos registrado su solicitud: ${service} (${price}).`,
    next: 'Un miembro de nuestro equipo se pondrá en contacto con usted para concertar una cita.',
    payment: 'Le informaremos sobre el pago al concertar la cita. Por ahora no paga nada.',
    cancel: '¿Ha cambiado de opinión? Basta con responder a este correo.',
  },

  valuationPaid: {
    subject: 'Confirmación de pago | Valoración FINDDOME',
    preheader: 'Gracias, hemos recibido su pago.',
    heading: 'Gracias, hemos recibido su pago',
    body: (service: string) => `Hemos recibido el pago de «${service}».`,
    orderTitle: 'Concepto',
    totalLabel: 'Importe pagado',
    paidAtLabel: 'Pagado el',
    next: 'Un miembro de nuestro equipo se pondrá pronto en contacto con usted sobre los siguientes pasos.',
    invoice: '¿Necesita una factura? Basta con responder a este correo.',
  },

  judicialRequested: {
    subject: 'Solicitud de tasación oficial | FINDDOME',
    preheader: 'Un miembro de nuestro equipo se pondrá en contacto con usted para explicarle las opciones.',
    heading: 'Hemos recibido su solicitud',
    body: 'Gracias, hemos registrado que desea una tasación oficial (judicial) realizada por un perito. Es distinta de la valoración orientativa, basada en el mercado, que ofrecemos en nuestro sitio web: la realiza un perito habilitado, previo presupuesto.',
    next: 'Un miembro de nuestro equipo se pondrá en contacto con usted para explicarle las opciones y el presupuesto.',
  },
} satisfies PublicEmailCopy;
