/**
 * English email copy (British). Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`): a template missing here stops this file
 * compiling, so a reader in European Portuguese never gets a Hungarian or Dutch email.
 * The office notices (admin*) stay Hungarian and are not repeated.
 *
 * Tone: formal "you", plain sentences, no exclamation marks. Many sellers are
 * retired; clarity outranks warmth, and both outrank marketing voice.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const PT = {
  common: {
    greeting: (name: string) => `Olá, ${name},`,
    greetingNoName: 'Caro anunciante,',
    signOff: 'Com os melhores cumprimentos,\nFODEL Imobiliária',
    questions: 'Se tiver alguma dúvida, basta responder a este e-mail.',
    linkFallback: 'Se o botão não funcionar, copie este endereço para o navegador:',
  },

  registrationConfirm: {
    subject: 'Defina a sua palavra-passe | FODEL',
    preheader: 'Um clique e pode preparar o seu anúncio.',
    heading: 'Defina a sua palavra-passe',
    intro: 'Obrigado pelo seu registo. A sua conta está quase pronta; só falta a palavra-passe.',
    cta: 'Definir palavra-passe',
    next: 'Depois pode continuar de imediato com o seu anúncio: pacote, dados, fotografias. Só o analisamos depois de o submeter.',
    expiry: 'A ligação é válida durante 7 dias. Se não foi o próprio a registar-se, pode ignorar este e-mail: não será criada nenhuma conta.',
  },

  accountExists: {
    subject: 'Já tem uma conta FODEL',
    preheader: 'Inicie sessão ou defina uma nova palavra-passe.',
    heading: 'Este endereço já tem uma conta',
    body: 'Alguém acabou de tentar registar-se no site da FODEL com este endereço de e-mail. Já existe uma conta associada, pelo que não criámos uma nova.',
    cta: 'Iniciar sessão',
    reset: 'Esqueceu-se da palavra-passe? Peça uma nova',
    ignore: 'Se não foi o próprio, não precisa de fazer nada: a sua conta mantém-se inalterada.',
  },

  invite: {
    subject: 'Convite para o portal FODEL',
    preheader: 'Defina a sua palavra-passe e inicie sessão no portal de anunciantes.',
    heading: 'Foi convidado para o portal FODEL',
    body: (role: string) =>
      `A FODEL convida-o a aderir ao portal ${role}, onde se gerem os anúncios de imóveis.`,
    roleAdmin: 'como administrador',
    roleOwner: 'como anunciante',
    cta: 'Aceitar convite',
    expiry: 'A ligação é válida durante 7 dias e só pode ser usada uma vez.',
  },

  welcome: {
    subject: 'Bem-vindo ao portal FODEL',
    preheader: 'A sua conta está ativa. Veja como publicar o seu primeiro anúncio.',
    heading: (name: string) => `Bem-vindo, ${name}`,
    body: 'A sua conta está ativa. No portal compõe o anúncio, carrega fotografias e acompanha a análise.',
    stepsTitle: 'O que vai precisar',
    steps: [
      'Fotografias do imóvel: pelo menos uma, mas quantas mais, melhor',
      'Os dados básicos: área, dimensão do terreno, preço pedido',
      'Algumas frases sobre o que torna o imóvel especial',
    ],
    cta: 'Ir para o portal',
  },

  submissionReceived: {
    subject: (ref: string) => `Recebemos o seu anúncio (#${ref})`,
    preheader: 'Vamos analisá-lo e informá-lo por e-mail.',
    heading: 'O seu anúncio foi recebido',
    body: (title: string, ref: string) =>
      `Recebemos o seu anúncio “${title}” (#${ref}). Um membro da nossa equipa irá analisá-lo e, assim que houver uma decisão, receberá um e-mail.`,
    timing: 'A análise não costuma demorar mais de dois dias úteis.',
    note: 'Durante a análise não pode editar o anúncio. Se lhe pedirmos uma alteração, volta a ficar aberto de imediato.',
  },

  changesRequested: {
    subject: (ref: string) => `Alteração necessária (#${ref})`,
    preheader: 'Uma pequena alteração e o anúncio pode ser publicado.',
    heading: 'Pedimos-lhe que faça uma alteração',
    body: (title: string, ref: string) =>
      `A nossa equipa tem o seguinte comentário sobre o seu anúncio “${title}” (#${ref}):`,
    after: 'O anúncio pode voltar a ser editado. Faça a alteração e envie-o novamente; o processo continua depois normalmente.',
    cta: 'Editar anúncio',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `Aprovado (#${ref}): só falta o pagamento`,
    preheader: 'O seu anúncio foi aprovado e fica online assim que o pagamento chegar.',
    heading: 'O seu anúncio foi aprovado',
    body: (title: string, ref: string) =>
      `Boas notícias: analisámos e aprovámos o seu anúncio “${title}” (#${ref}). Só falta o pagamento. Assim que chegar, o anúncio fica imediatamente online.`,
    orderTitle: 'Preço do anúncio',
    discountLabel: 'Desconto de recomendação (10%)',
    totalLabel: 'A pagar',
    ctaCard: 'Pagar com cartão',
    cardNote: 'O pagamento é feito no ambiente seguro da Stripe. A FODEL não vê nem guarda os dados do seu cartão.',
    bankTitle: 'Ou por transferência bancária',
    bankNote: (ref: string) =>
      `Indique o número de referência na transferência: ${ref}. Assim que chegar, um membro da nossa equipa publica o anúncio.`,
    vatNote: 'Todos os montantes incluem IVA neerlandês de 21%.',
  },

  approvedPublished: {
    subject: (ref: string) => `Aprovado e online (#${ref})`,
    preheader: 'O seu anúncio já está online; pague o preço do anúncio no prazo de 14 dias.',
    heading: 'O seu anúncio já está online',
    body: (title: string, ref: string) => `Aprovámos o anúncio “${title}” (#${ref}) e publicámo-lo de imediato.`,
    viewCta: 'Ver anúncio',
    orderTitle: 'Preço do anúncio',
    discountLabel: 'Desconto de recomendação (10%)',
    totalLabel: 'A pagar',
    dueLabel: 'Pagar até',
    ctaCard: 'Pagar com cartão',
    cardNote: 'O pagamento é feito no ambiente seguro da Stripe. A FODEL não vê nem guarda os dados do seu cartão.',
    bankTitle: 'Transferência bancária',
    bankNote: (ref: string) => `Indique o número de referência na transferência: ${ref}.`,
    vatNote: 'Todos os montantes incluem IVA neerlandês de 21%.',
  },

  paymentReceipt: {
    subject: (ref: string) => `Confirmação de pagamento (#${ref})`,
    preheader: 'Obrigado, recebemos o seu pagamento.',
    heading: 'Obrigado, o seu pagamento chegou',
    body: (title: string, ref: string) =>
      `Recebemos o pagamento do anúncio “${title}” (#${ref}). O anúncio está online e visível em ${SITE_HOST}.`,
    orderTitle: 'Discriminação',
    discountLabel: 'Desconto de recomendação (10%)',
    totalLabel: 'Montante pago',
    vatNote: 'O montante inclui IVA neerlandês de 21%. Receberá a fatura num e-mail separado.',
    paidAtLabel: 'Data de pagamento',
  },

  published: {
    subject: (ref: string) => `O seu anúncio está online (#${ref})`,
    preheader: `O anúncio está agora visível em ${SITE_HOST}.`,
    heading: 'O seu anúncio está online',
    body: (title: string, ref: string) =>
      `O seu anúncio “${title}” (#${ref}) está em ${SITE_HOST} e chega a compradores em oito países.`,
    cta: 'Ver anúncio',
    next: 'Assim que alguém mostrar interesse, enviamos-lhe de imediato os seus dados por e-mail. No portal pode ver sempre o estado do seu anúncio.',
  },

  newEnquiry: {
    subject: (ref: string) => `Novo pedido de informação (#${ref})`,
    preheader: 'Alguém está interessado no seu imóvel.',
    heading: 'Nova resposta ao seu anúncio',
    body: (title: string, ref: string) =>
      `Alguém respondeu ao seu anúncio “${title}” (#${ref}):`,
    labels: { name: 'Nome', email: 'E-mail', phone: 'Telefone' },
    messageTitle: 'A mensagem',
    advice: 'Se possível, entre em contacto no prazo de dois dias: uma resposta rápida é, de longe, o fator mais importante para que a venda se concretize.',
  },

  passwordReset: {
    subject: 'Redefinir a palavra-passe | Portal FODEL',
    preheader: 'A ligação é válida durante uma hora.',
    heading: 'Redefina a sua palavra-passe',
    body: 'Recebemos um pedido para redefinir a palavra-passe da sua conta no portal FODEL. Clique no botão abaixo para definir uma nova.',
    cta: 'Definir nova palavra-passe',
    expiry: 'A ligação é válida durante uma hora e só pode ser usada uma vez.',
    ignore: 'Se não fez este pedido, ignore este e-mail. A sua palavra-passe mantém-se e nada acontece.',
  },

  referralRegistered: {
    subject: 'Recebemos a sua recomendação | FODEL',
    preheader: 'Um membro da nossa equipa entrará em breve em contacto com a pessoa que recomendou.',
    heading: 'Obrigado pela recomendação',
    body: (referredName: string) =>
      `Recebemos os dados de ${referredName}. Um membro da nossa equipa entrará em contacto e, assim que o anúncio for publicado, creditaremos 10% de desconto no preço do seu próximo anúncio.`,
    note: 'O crédito é aplicado manualmente, depois de o anunciante pagar. Avisá-lo-emos assim que for possível.',
  },

  valuationReceived: {
    heading: 'Recebemos o seu pedido de avaliação',
    body: 'Um membro da nossa equipa verifica os dados do imóvel e a base de dados e depois envia-lhe por e-mail a avaliação indicativa, baseada no mercado.',
  },

  valuationReady: {
    subject: 'A sua avaliação está pronta | FODEL',
    preheader: 'Fizemos uma estimativa indicativa do seu imóvel.',
    heading: 'A sua avaliação está pronta',
    body: (range: string) =>
      `Com base nos dados fornecidos e em imóveis comparáveis, a nossa estimativa indicativa é: ${range}.`,
    disclaimerWithCount: (n: number) =>
      `Esta estimativa é indicativa, não é um relatório de avaliação e não substitui uma avaliação oficial. Baseia-se em imóveis comparáveis: ${n}.`,
    /** When an admin priced it by hand: there is no comparable count to cite. */
    disclaimer:
      'Esta estimativa é indicativa, não é um relatório de avaliação e não substitui uma avaliação oficial.',
    cta: 'Anuncie agora',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `Com base nos dados fornecidos, o valor indicativo de mercado é: ${range}.`,
    mid: 'Valor médio',
    basis: 'Base de dados',
    rateDate: 'Data da taxa de câmbio',
    source: 'Fonte',
    factorsHeading: 'Fatores',
    dirPlus: 'Aumenta o valor',
    dirMinus: 'Reduz o valor',
    dirUnsure: 'Incerto',
    visit: 'Pedir uma visita do Gábor',
    judicial: 'Pedir uma avaliação oficial',
  },

  valuationDeclined: {
    subject: 'O seu pedido de avaliação | FODEL',
    preheader: 'Um membro da nossa equipa entrará pessoalmente em contacto consigo.',
    heading: 'Obrigado pelo seu pedido',
    body: 'Com base nos dados fornecidos, temos de momento poucos imóveis comparáveis para uma estimativa fiável. Um membro da nossa equipa entrará pessoalmente em contacto consigo.',
  },

  valuationNeedsInfo: {
    subject: 'Avaliação: precisamos de mais alguns dados',
    preheader: 'Precisamos de mais algumas informações para a estimativa.',
    heading: 'Precisamos de mais alguns dados',
    body: 'Obrigado pelo seu pedido de avaliação. Para a estimativa, um membro da nossa equipa pede-lhe o seguinte:',
    after: 'Responda a este e-mail com os dados em falta. Assim que os tivermos, faremos a estimativa.',
  },

  rejected: {
    subject: (ref: string) => `Não é possível publicar o seu anúncio (#${ref})`,
    preheader: 'O resultado da análise e a explicação.',
    heading: 'Não podemos publicar o anúncio',
    body: (title: string, ref: string) =>
      `Lamentamos: após análise, a nossa equipa não aprovou o seu anúncio “${title}” (#${ref}). A explicação:`,
    refund: 'Se já pagou o anúncio, entraremos em contacto consigo separadamente sobre o reembolso.',
    after: 'Se tiver alguma pergunta ou achar que houve um mal-entendido, basta responder a este e-mail.',
  },

  invoiceIssued: {
    subject: (number: string) => `Fatura ${number}`,
    preheader: 'A fatura está pronta; pode vê-la ou descarregá-la através da ligação.',
    heading: 'A sua fatura está pronta',
    body: (title: string, ref: string, number: string) =>
      `A fatura ${number} do seu anúncio “${title}” (#${ref}) está pronta.`,
    cta: 'Ver fatura',
  },

  creditNoteIssued: {
    subject: (number: string) => `Nota de crédito ${number}`,
    preheader: 'Emitimos uma nota de crédito relativa à sua fatura anterior.',
    heading: 'Nota de crédito pronta',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `Emitimos a nota de crédito ${number} relativa à fatura ${correctsNumber} do seu anúncio “${title}” (#${ref}).`,
    cta: 'Ver nota de crédito',
  },

  serviceRequested: {
    subject: 'Recebemos o seu pedido | FODEL',
    preheader: 'Um membro da nossa equipa entrará em contacto consigo para marcar uma data.',
    heading: 'Recebemos o seu pedido',
    body: (service: string, price: string) => `Obrigado, registámos o seu pedido: ${service} (${price}).`,
    next: 'Um membro da nossa equipa entrará em contacto consigo para marcar uma data.',
    payment: 'Informá-lo-emos sobre o pagamento quando marcarmos a data. Agora não paga nada.',
    cancel: 'Mudou de ideias? Basta responder a este e-mail.',
  },

  valuationPaid: {
    subject: 'Confirmação de pagamento | Avaliação FODEL',
    preheader: 'Obrigado, o seu pagamento chegou.',
    heading: 'Obrigado, o seu pagamento chegou',
    body: (service: string) => `Recebemos o pagamento de “${service}”.`,
    orderTitle: 'Item',
    totalLabel: 'Montante pago',
    paidAtLabel: 'Pago em',
    next: 'Um membro da nossa equipa entrará em breve em contacto consigo sobre os próximos passos.',
    invoice: 'Precisa de fatura? Basta responder a este e-mail.',
  },

  judicialRequested: {
    subject: 'Pedido de avaliação oficial | FODEL',
    preheader: 'Um membro da nossa equipa entrará em contacto consigo sobre as opções.',
    heading: 'Recebemos o seu pedido',
    body: 'Obrigado, registámos que pretende uma avaliação oficial (judicial) por um perito. Não é o mesmo que a avaliação indicativa, baseada no mercado, do nosso site: é realizada por um perito autorizado, mediante orçamento.',
    next: 'Um membro da nossa equipa entrará em contacto consigo sobre as opções e o orçamento.',
  },
} satisfies PublicEmailCopy;
