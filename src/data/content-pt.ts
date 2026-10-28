/**
 * Long-form pages, European Portuguese (formal third person, no "você"): services, agricultural property, buying
 * guide, moving to Hungary, photo guide. Figures come from src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'pt' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `desde ${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)}`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_PT = {
  services: {
    metaTitle: 'Serviços: gestão da venda, contratos, fotografia',
    metaDescription: `Contrato de compra e venda bilingue ${from('hu')}, representação por procuração, registo predial, certificado energético, fotografia do imóvel e imagens de drone.`,
    eyebrow: 'Serviços',
    title: 'O que fazemos além',
    titleEm: 'do anúncio',
    intro:
      'O anúncio é apenas o primeiro passo. Com os serviços abaixo tratamos de todo o processo de compra por si, de acordo com as regras de ambos os países.',
    sections: [
      {
        type: 'steps',
        title: 'Como decorre a venda',
        items: [
          { n: '01', t: 'Contacto', b: 'Aconselhamento por telefone e e-mail, comunicação com ambas as partes, incluindo intérpretes.' },
          { n: '02', t: 'Verificação dos compradores', b: 'Verificamos o perfil, a intenção de compra e a capacidade financeira.' },
          { n: '03', t: 'Visita', b: 'Marcamos as visitas e acompanhamo-lo, com um colega que fala a sua língua.' },
          { n: '04', t: 'Negociação', b: 'Apoio em ambas as línguas, dentro de uma margem de preço realista.' },
          { n: '05', t: 'Contrato', b: 'Um contrato de compra e venda bilingue, elaborado com um advogado.' },
          { n: '06', t: 'Escritura', b: 'Registo predial, serviços e, se necessário, representação por procuração.' },
        ],
      },
      {
        type: 'table',
        title: 'Contrato de compra e venda bilingue',
        intro: 'Preços indicativos por combinação de línguas. O preço final depende da extensão do contrato.',
        rows: [
          ['Húngaro', from('hu')],
          ['Alemão–húngaro', from('de-hu')],
          ['Inglês–húngaro', from('en-hu')],
          ['Neerlandês–húngaro', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: 'Serviços adicionais',
        intro: 'Para estes preparamos um orçamento personalizado:',
        items: [
          'Pedido do certificado energético: obrigatório no anúncio segundo as regras da UE',
          'Fotografia imobiliária profissional',
          'Imagens de drone: especialmente eficazes para grandes terrenos e vistas',
          `Vídeo com o anúncio (${eur(video, L)})`,
        ],
      },
      {
        type: 'callout',
        title: 'Representação por procuração',
        body: 'Não precisa de viajar até à Hungria para assinar: com uma procuração representamo-lo na assinatura, no registo predial e na transferência dos serviços.',
      },
      {
        type: 'prose',
        title: 'Quando é devida a comissão',
        paragraphs: [
          `Só cobramos comissão quando a FINDDOME apresentou o comprador, existe um contrato de compra e venda escrito e o sinal foi pago. A taxa é de ${COMMISSION.percent}% líquida, com um mínimo de ${eur(COMMISSION.minimumEur, L)}, acrescida de ${COMMISSION.vatPercent}% de IVA neerlandês. Quem paga é o vendedor, não o comprador.`,
        ],
      },
      {
        type: 'cta',
        title: 'Dúvidas sobre o processo',
        body: '{hours} Peça uma chamada gratuita ou escreva-nos.',
        primary: { label: 'Contacte-nos', to: 'contact' },
        secondary: { label: 'Perguntas frequentes', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `Imóveis agrícolas: até ${AGRI_HECTARE_LIMIT} hectares na Hungria`,
    metaDescription: `Um cidadão da UE com qualificação agrícola pode adquirir até ${AGRI_HECTARE_LIMIT} hectares de terreno na Hungria. A FINDDOME trata de todo o processo.`,
    eyebrow: 'Imóveis agrícolas',
    title: 'Terras agrícolas e',
    titleEm: 'propriedades rurais',
    intro:
      'O mercado fundiário húngaro tem regras próprias. Quem conhece as condições tem acesso a vinhas, terras aráveis, quintas e floresta.',
    sections: [
      {
        type: 'prose',
        title: `O limite de ${AGRI_HECTARE_LIMIT} hectares`,
        paragraphs: [
          `Um cidadão da UE com qualificação agrícola pode adquirir na Hungria até ${AGRI_HECTARE_LIMIT} hectares de terreno no total. Tratamos desse procedimento por completo.`,
          'O processo tem várias etapas junto das autoridades e começa com o reconhecimento da sua qualificação. A nossa equipa acompanha-o em todo o processo e prepara os documentos nas duas línguas.',
        ],
      },
      {
        type: 'list',
        title: 'O que os nossos clientes adquirem',
        items: [
          'Vinhas, com ou sem adega em funcionamento',
          'Terras aráveis, elegíveis para apoios da UE',
          'Quintas com anexos, adequadas para criação de gado',
          'Florestas e propriedades de uso misto',
          'Parcelas contíguas maiores como investimento',
        ],
      },
      {
        type: 'steps',
        title: 'O processo',
        items: [
          { n: '01', t: 'Consulta', b: 'Analisamos os seus planos e o orçamento disponível.' },
          { n: '02', t: 'Reconhecimento da qualificação', b: 'Tratamos do reconhecimento da sua qualificação agrícola na Hungria.' },
          { n: '03', t: 'Pesquisa', b: 'Com os nossos parceiros procuramos terrenos que cumpram as condições.' },
          { n: '04', t: 'Autorizações', b: 'Pedido das autorizações necessárias para adquirir o terreno.' },
          { n: '05', t: 'Compra', b: 'Contrato bilingue, registo predial, transferência dos direitos a subsídios.' },
        ],
      },
      {
        type: 'callout',
        title: 'Importante',
        body: 'As regras de aquisição de terrenos agrícolas mudam periodicamente e dependem da sua situação concreta. O que aqui se escreve é meramente informativo. Para um projeto concreto, consulte-nos sempre a nós e a um advogado especializado.',
      },
      {
        type: 'cta',
        title: 'Procura um imóvel agrícola?',
        body: 'Diga-nos o que procura: também pesquisamos para além dos imóveis que anunciamos.',
        primary: { label: 'Pesquisa de imóvel gratuita', to: 'searchRequest' },
        secondary: { label: 'Os nossos imóveis', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: 'Comprar na Hungria: o processo passo a passo',
    metaDescription:
      'Como decorre uma compra na Hungria para um comprador estrangeiro: contrato, sinal, registo predial, serviços e os custos a prever.',
    eyebrow: 'Para compradores',
    title: 'Comprar na',
    titleEm: 'Hungria',
    intro:
      'O processo de compra húngaro é bastante previsível quando se conhecem as etapas. Este guia acompanha-o em cada uma delas.',
    sections: [
      {
        type: 'steps',
        title: 'O processo',
        items: [
          { n: '01', t: 'Escolha', b: 'Escolhe entre os nossos imóveis ou faz um pedido de pesquisa gratuito.' },
          { n: '02', t: 'Visita', b: 'Organizamos a viagem e a visita, com intérprete.' },
          { n: '03', t: 'Proposta', b: 'Ajudamo-lo a fazer uma proposta realista e a negociar.' },
          { n: '04', t: 'Contrato e sinal', b: 'Um contrato de compra e venda bilingue, normalmente com um sinal de 10%.' },
          { n: '05', t: 'Preço de compra', b: 'O restante do preço por transferência bancária, conforme o contrato.' },
          { n: '06', t: 'Entrega', b: 'Registo predial, serviços, entrega das chaves.' },
        ],
      },
      {
        type: 'list',
        title: 'Custos além do preço de compra',
        items: [
          'Imposto de transmissão: a taxa depende do tipo de imóvel e da sua situação',
          'Honorários do advogado pela redação e autenticação da escritura',
          `Tradução do contrato bilingue: ${from('hu')}, consoante a combinação linguística`,
          'Emolumentos do registo predial',
          'Eventual comissão à FINDDOME: é paga pelo vendedor, não por si',
        ],
      },
      {
        type: 'prose',
        title: 'Não precisa de estar presente',
        paragraphs: [
          'Mediante procuração representamo-lo na assinatura, no registo predial e na transferência dos serviços. Assim, a compra pode avançar mesmo que não possa ou não queira viajar.',
        ],
      },
      {
        type: 'callout',
        title: 'Certificado energético',
        body: 'Na Hungria é obrigatório o certificado energético, que segundo as regras da UE também tem de constar do anúncio. Nos nossos anúncios encontra a classe nas características; “pendente” significa que o certificado ainda está a ser emitido.',
      },
      {
        type: 'cta',
        title: 'Vamos começar?',
        body: 'Veja os imóveis ou diga-nos o que procura. Não lhe custa nada.',
        primary: { label: 'Os nossos imóveis', to: 'properties' },
        secondary: { label: 'Pesquisa de imóvel gratuita', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: 'Mudar-se para a Hungria: porque é que os neerlandeses dão o passo',
    metaDescription:
      'As quatro razões pelas quais compradores neerlandeses e belgas se mudam para a Hungria: relação qualidade-preço, espaço, custo de vida mais baixo e localização.',
    eyebrow: 'Contexto',
    title: 'Mudar-se para a',
    titleEm: 'Hungria',
    intro:
      'Muitos neerlandeses e belgas escolhem a Hungria. Em centenas de conversas com os nossos clientes surgem sempre as mesmas quatro razões.',
    sections: [
      {
        type: 'prose',
        title: 'Relação qualidade-preço',
        paragraphs: [
          'Os imóveis rurais húngaros estão entre os de melhor relação qualidade-preço da Europa. Nos Países Baixos, um lote de construção de 125 m² custa facilmente 88 000\u00a0€ e uma garagem cerca de 100 000\u00a0€. Pelo mesmo valor, no interior da Hungria compra uma moradia familiar espaçosa, muitas vezes com bastante terreno.',
        ],
      },
      {
        type: 'prose',
        title: 'Espaço',
        paragraphs: [
          'Os Países Baixos têm uma densidade populacional de 482 habitantes por km², com cerca de 17 milhões de habitantes, e uma parte considerável do país é água. A falta de espaço não é um problema abstrato, mas uma experiência diária, e é a razão mais referida.',
        ],
      },
      {
        type: 'prose',
        title: 'Custo de vida',
        paragraphs: [
          'Grande parte dos nossos compradores está reformada ou perto disso. Para eles, o custo de vida mais baixo, a ausência de imposto sobre imóveis e cuidados de saúde acessíveis traduzem-se num nível de vida que a mesma pensão não garantiria nos Países Baixos.',
        ],
      },
      {
        type: 'prose',
        title: 'Localização',
        paragraphs: [
          'Desde as cheias catastróficas de 1953, os Países Baixos construíram um enorme sistema de defesa contra inundações. A preocupação com a subida do nível do mar pesa em muitas decisões: a Hungria fica no centro do continente, acima do nível do mar.',
        ],
      },
      {
        type: 'cta',
        title: 'Hora de explorar',
        body: 'Veja os nossos imóveis ou deixe-nos procurar o que tem em mente.',
        primary: { label: 'Os nossos imóveis', to: 'properties' },
        secondary: { label: 'Comprar na Hungria', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: 'Guia de fotografia para anunciantes',
    metaDescription:
      'Boas fotografias são a ferramenta mais importante para vender depressa. O guia de fotografia FINDDOME: luz, orientação, resolução e os erros mais comuns.',
    eyebrow: 'Para vendedores',
    title: 'Guia de',
    titleEm: 'fotografia',
    intro:
      'Os interessados estrangeiros veem primeiro as fotografias, muitas vezes só as fotografias. Estas regras valem mais do que qualquer texto do anúncio.',
    sections: photoGuideSections(L, {
      topTitle: 'As seis regras mais importantes',
      calloutTitle: 'Prefere delegar?',
      calloutBody: (lines) =>
        `Recorra a um profissional. Pode escolher esta opção com um clique ao publicar o anúncio: ${lines.join('; ')}. Ambos são opcionais; um membro da nossa equipa entrará em contacto consigo para marcar uma data.`,
      ctaTitle: 'Pronto para anunciar o seu imóvel?',
      primary: 'Publicar anúncio',
      secondary: 'Preços',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
