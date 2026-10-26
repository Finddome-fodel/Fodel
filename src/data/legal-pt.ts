/**
 * Legal pages, European Portuguese (formal third person, no "você"). A faithful translation of the Dutch pages
 * (src/data/pages-legal.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. It needs the client's and a lawyer's sign-off before
 * launch, like the Hungarian and Dutch originals. Every sentence that leans on
 * Dutch or Hungarian law (GDPR roles, Dutch VAT, the Dutch regulator, the
 * right of withdrawal, the ODR platform) is listed in Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'pt' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '27 de julho de 2026';
const notice =
  'Esta é uma tradução para sua conveniência. Em caso de divergência, prevalece o original neerlandês (em matérias de direito neerlandês) ou húngaro.';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
const minMonths = (extra('homepage-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_PT = {
  imprint: {
    metaTitle: 'Ficha técnica: dados da empresa',
    metaDescription: `Dados da empresa ${COMPANY.names.legal}: sede, número de IVA, número KvK e contactos.`,
    eyebrow: 'Ficha técnica',
    title: 'Dados da',
    titleEm: 'empresa',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Dados do prestador de serviços',
        rows: [
          ['Denominação social', COMPANY.names.legal],
          ['Sede', addressLine(COMPANY.address, L)],
          ['Número de IVA', COMPANY.registration.vat],
          ['Número KvK (Câmara de Comércio neerlandesa)', kvk],
          ['Representante', COMPANY.principal],
          ['E-mail', COMPANY.email.primary],
          ['Telefone', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['Fundada', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: 'Contas bancárias',
        rows: [
          ['Países Baixos', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['Hungria', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: 'Litígios',
        body: 'Em caso de litígio de consumo, pode também recorrer à plataforma europeia de RLL: ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: 'Política de privacidade',
    metaDescription:
      'Como a FODEL trata os seus dados pessoais: que dados tratamos, durante quanto tempo os conservamos e que direitos tem ao abrigo do RGPD.',
    eyebrow: 'Privacidade',
    title: 'Política de',
    titleEm: 'privacidade',
    intro:
      'Esta política descreve como tratamos os dados pessoais que nos fornece através deste site, em conformidade com o RGPD.',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: 'Responsável pelo tratamento',
        rows: [
          ['Responsável', COMPANY.names.legal],
          ['Morada', addressLine(COMPANY.address, L)],
          ['E-mail', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: 'Que dados tratamos',
        intro: 'Apenas os dados que introduz nos nossos formulários:',
        items: [
          'Nome, endereço de e-mail e número de telefone: para podermos responder ao seu pedido',
          'O assunto e o conteúdo da sua mensagem',
          'Para um anúncio: os dados do imóvel e os seus dados de faturação',
          'Para um pedido de pesquisa: os seus critérios de pesquisa',
          'Para a administração interna: quando e que formulário preencheu e quando iniciou sessão no portal, sem guardar o endereço IP',
        ],
      },
      {
        type: 'table',
        title: 'Fundamento jurídico e prazo de conservação',
        rows: [
          ['Contacto e pedido de chamada', 'Consentimento (art. 6.º, n.º 1, alínea a), do RGPD): 12 meses'],
          ['Encomenda de anúncio', 'Execução de um contrato (art. 6.º, n.º 1, alínea b)): 7 anos, conservação fiscal obrigatória'],
          ['Pedido de pesquisa', 'Consentimento: até à conclusão, no máximo 24 meses'],
          ['Registo interno de atividades', 'Interesse legítimo (art. 6.º, n.º 1, alínea f)): boa administração e deteção de abusos: no máximo 24 meses'],
        ],
      },
      {
        type: 'list',
        title: 'Com quem partilhamos dados',
        intro: 'Não vendemos os seus dados nem os partilhamos para fins de marketing. Os nossos subcontratantes são:',
        items: [
          'O nosso fornecedor de e-mail, com tratamento dentro da UE',
          'O fornecedor de alojamento deste site',
          'Em caso de compra, e apenas a seu pedido: a outra parte e o advogado envolvido',
        ],
      },
      {
        type: 'callout',
        title: 'Sobre os anúncios',
        body: 'Como anunciante, pode autorizar-nos a mostrar o seu nome e telefone no anúncio, para que os interessados o contactem diretamente. Pode retirar essa autorização a qualquer momento; nesse caso removemos os dados do anúncio.',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: 'Newsletter',
        body: 'Se subscrever a nossa newsletter, tratamos o seu endereço de e-mail, a língua escolhida e a data de subscrição e de confirmação, exclusivamente para lhe enviar a newsletter, com base no seu consentimento. A subscrição tem dois passos: não enviamos nada até clicar no botão do e-mail de confirmação. Em cada e-mail pode cancelar a subscrição com um clique, e paramos de imediato. Para o envio utilizamos o serviço Resend.',
      },
      {
        type: 'list',
        title: 'Os seus direitos',
        items: [
          'Acesso aos dados que tratamos sobre si',
          'Retificação e apagamento',
          'Limitação do tratamento ou oposição ao mesmo',
          'Portabilidade dos dados',
          'Retirar o seu consentimento a qualquer momento',
          'Apresentar reclamação à autoridade neerlandesa de proteção de dados (Autoriteit Persoonsgegevens)',
        ],
      },
      {
        type: 'prose',
        title: 'Contacto sobre privacidade',
        paragraphs: [`Pode enviar perguntas ou pedidos para ${COMPANY.email.primary}. Respondemos no prazo máximo de 30 dias.`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Política de cookies',
    metaDescription: `Que cookies o ${SITE_HOST} utiliza e como alterar a sua escolha.`,
    eyebrow: 'Cookies',
    title: 'Política de',
    titleEm: 'cookies',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'De momento, este site utiliza apenas armazenamento tecnicamente necessário. Não utilizamos scripts de publicidade ou de rastreamento e não partilhamos nada com redes sociais.',
        ],
      },
      {
        type: 'table',
        title: 'O que guardamos',
        rows: [
          [
            'fodel:consent',
            'A sua escolha relativamente aos cookies (aceites ou recusados). Fica guardada no seu navegador e não nos chega. Conservação: 12 meses.',
          ],
        ],
      },
      {
        type: 'prose',
        title: 'Estatísticas',
        paragraphs: [
          'Se algum dia recolhermos estatísticas de visitantes, só as ativaremos com o seu consentimento prévio e explícito. Recusar não limita de forma alguma a utilização do site.',
        ],
      },
      {
        type: 'prose',
        title: 'Alterar a sua escolha',
        paragraphs: [
          'Pode alterar a sua escolha a qualquer momento apagando os dados do navegador guardados para este site; o aviso de cookies volta então a aparecer.',
        ],
      },
    ],
  },

  terms: {
    metaTitle: 'Termos e condições',
    metaDescription:
      'As condições do serviço de publicidade e mediação da FODEL: preços, comissão, retirada e responsabilidade.',
    eyebrow: 'Termos',
    title: 'Termos e',
    titleEm: 'condições',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: 'Atenção',
        body: 'Esta página é um resumo. Os termos completos e vinculativos estão disponíveis em PDF; em caso de divergência, prevalece o PDF.',
      },
      {
        type: 'prose',
        title: '1. O serviço',
        paragraphs: [
          'A FODEL publicita imóveis húngaros nos seus próprios sites multilingues e, mediante acordo separado, presta apoio na conclusão da venda.',
          'O serviço de publicidade não tem exclusividade: o vendedor pode também oferecer e vender o imóvel através de outros canais.',
        ],
      },
      {
        type: 'list',
        title: '2. Publicar um anúncio',
        ordered: true,
        items: [
          'O vendedor preenche o formulário de registo.',
          'A FODEL envia um pedido de pagamento para o pacote escolhido.',
          'O vendedor paga por transferência bancária.',
          'Após a receção, o vendedor recebe o direito de carregar fotografias.',
          'A FODEL trata da tradução e publica o anúncio.',
        ],
      },
      {
        type: 'table',
        title: '3. Preços',
        intro: `Todos os preços incluem ${LISTING_VAT_PERCENT}% de IVA neerlandês. Consulte a página Preços para a visão completa.`,
        rows: [
          [`Anúncio económico (${cheap.months} meses)`, eur(cheap.priceEur, L)],
          [`Anúncio padrão (${normal.months} meses)`, `${eur(normal.priceEur, L)} / ${eur(normal.priceEurAbove, L)}`],
          ['Tradução', `${eur(extra('translation').priceEur, L)} por língua`],
          [
            'Destaque',
            `${eur(extra('category-highlight').priceEur, L)}–${extra('homepage-highlight').priceEur} por mês (mín. ${minMonths} meses)`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. Comissão',
        paragraphs: [
          'A comissão só é devida quando se verificam todas as condições seguintes: um contrato de compra e venda escrito, um comprador apresentado pela FODEL e um sinal pago.',
          `A comissão é de ${COMMISSION.percent}% líquida, com um mínimo de ${eur(COMMISSION.minimumEur, L)}, acrescida de ${COMMISSION.vatPercent}% de IVA neerlandês.`,
          'Se o interessado contactar diretamente o vendedor e a nossa ajuda na conclusão não for necessária, nada é devido além do preço do anúncio.',
        ],
      },
      {
        type: 'prose',
        title: '5. Retirada do anúncio',
        paragraphs: [
          'O vendedor pode retirar o anúncio antes da data de expiração. Nesse caso, os valores do anúncio já pagos não são reembolsados.',
        ],
      },
      {
        type: 'prose',
        title: '6. Responsabilidade',
        paragraphs: [
          'O vendedor é responsável pela exatidão dos dados sobre o imóvel. A FODEL reproduz os dados fornecidos e não se responsabiliza pela sua exatidão.',
          'As traduções neste site são meramente informativas; em caso de litígio, prevalece a versão húngara.',
        ],
      },
      {
        type: 'prose',
        title: '7. Direito de livre resolução',
        paragraphs: [
          'O vendedor que seja consumidor tem o direito legal de livre resolução nos contratos à distância. Se o vendedor pedir expressamente a execução imediata, o direito de livre resolução é reduzido na proporção do serviço já prestado.',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: 'Declaração de acessibilidade',
    metaDescription: `O nível de acessibilidade do ${SITE_HOST}, a norma que seguimos e como nos enviar comentários.`,
    eyebrow: 'Acessibilidade',
    title: 'Declaração de',
    titleEm: 'acessibilidade',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          'Queremos que este site possa ser usado por todos, incluindo visitantes que utilizam um leitor de ecrã, o teclado ou ampliação.',
          'Construímos o site segundo as WCAG 2.2, nível AA. Uma parte considerável dos nossos visitantes é reformada, por isso o tamanho do texto, o contraste e a utilização por teclado têm prioridade.',
        ],
      },
      {
        type: 'list',
        title: 'O que já está implementado',
        items: [
          'Todo o texto tem uma relação de contraste de, pelo menos, 4,5:1',
          'Utilização completa por teclado com indicação visível do foco',
          'Uma ligação «saltar para o conteúdo» no topo de cada página',
          'Textos alternativos significativos para todas as imagens',
          'Campos de formulário com etiquetas associadas e mensagens de erro em texto',
          'Respeito pela definição do sistema «reduzir movimento»',
          'O site é legível e utilizável sem JavaScript',
        ],
      },
      {
        type: 'prose',
        title: 'Limitações conhecidas',
        paragraphs: ['Não temos influência sobre a acessibilidade de conteúdos de terceiros, como um serviço de mapas.'],
      },
      {
        type: 'prose',
        title: 'Comentários',
        paragraphs: [
          `Se encontrar alguma barreira, informe-nos através de ${COMPANY.email.primary} ou por telefone. Resolvemos as comunicações o mais depressa possível.`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
