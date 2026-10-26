/**
 * Page copy, European Portuguese (formal third person, no "você").
 *
 * Written for buyers and sellers in the UK, Ireland and the rest of the
 * English-speaking market, from the same facts as the Hungarian and Dutch
 * copy: the figures come from src/config/company.ts, never from this file.
 * Type-checked against the Hungarian copy, so a missing key fails the build.
 */

import { COMPANY, COMMISSION, formatHours, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'pt' as const;

export const PT = {
  home: {
    meta: {
      title: 'FODEL Real Estates | Compre um imóvel na Hungria diretamente ao proprietário',
      description:
        'Casas, quintas e propriedades rurais na Hungria, muitas vezes diretamente ao proprietário. Acompanhamento na sua língua e contratos de compra e venda bilingues.',
    },
    hero: {
      eyebrow: `Desde 2013 · ${foundedInLabel(L)}`,
      title: ['Imóveis', 'na Hungria', 'diretamente ao proprietário'],
      emphasis: 1,
      body: 'Muitos dos nossos anúncios indicam o proprietário. Pode negociar diretamente com ele ou deixar todo o processo connosco.',
      primary: 'Ver imóveis',
      secondary: 'Pesquisa de imóvel gratuita',
      featuredLabel: 'Em destaque',
    },
    audiences: [
      {
        eyebrow: 'Para compradores',
        title: 'Imóveis diretamente\nao proprietário',
        body: 'Casas húngaras autênticas, quintas, propriedades rurais e vinhas. Contacte diretamente o proprietário ou deixe a FODEL tratar de todo o processo.',
        cta: 'Ver imóveis',
        to: 'properties',
      },
      {
        eyebrow: 'Para vendedores',
        title: 'O seu imóvel húngaro\nna Europa Ocidental',
        body: `Anuncie em ${REACH_LANGUAGES} línguas em ${REACH_COUNTRIES} países, sem contrato de exclusividade. Comissão apenas se formos nós a encontrar o comprador.`,
        cta: 'Saiba mais',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: 'Escolha', title: 'Imóveis em destaque' },
    quote: '“Os neerlandeses muitas vezes nem acreditam no que veem quando descobrem o que se pode comprar na Hungria, e por quanto.”',
    quoteSource: `${BRAND.pt.name} · ${SITE_HOST}`,
    how: { eyebrow: 'Como funciona', title: 'Como funciona a FODEL' },
    cta: {
      eyebrow: 'Contacte-nos',
      title: 'Teremos todo o gosto',
      titleEm: 'em ligar-lhe',
      body: `${formatHours(L)} · A chamada não lhe custa nada.`,
    },
    referral: {
      eyebrow: 'Programa de recomendação',
      title: 'Recomende um anunciante,',
      titleEm: 'receba 10%',
      body: 'Se alguém publicar um anúncio na FODEL por recomendação sua, recebe 10% de desconto no pacote e nós creditamos-lhe 10% no seu próximo anúncio. Já anuncia connosco? Encontra o seu código de recomendação em Definições, no portal.',
      steps: [
        'Recomende um conhecido através do formulário abaixo ou partilhe a sua ligação pessoal a partir do portal',
        'Um membro da nossa equipa entra em contacto com essa pessoa',
        'Se publicar um anúncio, poupa 10% e nós creditamos-lhe 10%',
      ],
      formTitle: 'Recomende um conhecido',
      fields: {
        referrerName: 'O seu nome',
        referrerEmail: 'O seu endereço de e-mail',
        referredName: 'Nome da pessoa recomendada',
        referredEmail: 'Endereço de e-mail da pessoa recomendada',
      },
      submit: 'Enviar recomendação',
    },
  },

  steps: [
    {
      num: '01',
      title: `Anunciado em ${REACH_COUNTRIES} países`,
      body: `Anunciamos em ${REACH_LANGUAGES} línguas nos Países Baixos, Bélgica, Alemanha, Inglaterra e outros países da UE, sem contrato de exclusividade com o vendedor.`,
    },
    {
      num: '02',
      title: 'Contacto direto',
      body: 'Muitos anúncios mostram o nome e o número do proprietário a par dos nossos contactos. Se combinarem entre si, ninguém paga comissão.',
    },
    {
      num: '03',
      title: 'Todo o processo tratado por si',
      body: 'Contrato de compra e venda bilingue, representação por procuração, registo predial e transferência dos serviços.',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: 'Fundada' },
    { value: String(REACH_COUNTRIES), label: 'Países' },
    { value: String(REACH_LANGUAGES), label: 'Línguas' },
    { value: `${COMMISSION.percent}%`, label: 'Comissão' },
  ] as Stat[],

  sellers: {
    meta: {
      title: 'Para vendedores | O seu imóvel húngaro na Europa Ocidental',
      description: `Anuncie o seu imóvel húngaro em ${REACH_LANGUAGES} línguas em ${REACH_COUNTRIES} países, a partir de ${eur(69, L)} e sem exclusividade. Comissão apenas se a FODEL encontrar o comprador: ${COMMISSION.percent}% + ${COMMISSION.vatPercent}% de IVA.`,
    },
    hero: {
      eyebrow: 'Para vendedores',
      title: 'O seu imóvel',
      titleEm: 'na Europa Ocidental',
      body: `Com o modelo FODEL, o seu imóvel aparece em ${REACH_LANGUAGES} línguas em ${REACH_COUNTRIES} países, sem contrato de exclusividade. Trabalhamos apenas com compradores sérios.`,
      cta: 'Publicar anúncio',
      secondary: 'Ver preços',
    },
    benefits: {
      eyebrow: 'As vantagens',
      title: 'O que traz um comprador estrangeiro',
      points: [
        'Compradores com fundos próprios: sem esperar por crédito à habitação ou subsídios.',
        'Pagamento de uma só vez por transferência bancária, rápido e seguro.',
        'Intenção séria: uma única visita custa-lhes dois dias e 200–300\u00a0€.',
        'Preços realistas: sem regateio excessivo.',
        'A FODEL avalia pessoalmente cada comprador antes de marcar qualquer visita.',
      ],
    },
    personas: {
      eyebrow: 'Os compradores',
      title: 'Quem são os nossos compradores',
      items: [
        {
          title: 'Reformados',
          body: 'Procuram na Hungria um custo de vida mais baixo, vantagens fiscais e cuidados de saúde acessíveis.',
        },
        {
          title: 'Famílias',
          body: 'Procuram espaço, natureza e vida no campo. Muitas vezes uma quinta, um monte ou uma casa de férias.',
        },
        {
          title: 'Investidores',
          body: 'Procuram imóveis comerciais, vinhas e terrenos agrícolas.',
        },
        {
          title: 'Quem procura um novo estilo de vida',
          body: 'Deixam para trás o custo de vida elevado e as multidões, em busca de um autêntico estilo de vida europeu.',
        },
      ] as Persona[],
    },
    how: { eyebrow: 'Passo a passo', title: 'O modelo FODEL' },
    commission: {
      eyebrow: 'Preços',
      title: 'Comissão apenas\nem caso de venda',
      body: `Se o comprador o contactar diretamente e não precisar da nossa ajuda, não paga nada além do preço do anúncio. Se for a FODEL a mediar a venda: ${COMMISSION.percent}% líquidos (mín. ${eur(COMMISSION.minimumEur, L)}) + ${COMMISSION.vatPercent}% de IVA neerlandês.`,
      cta: 'Ver preços',
    },
  },

  buyers: {
    meta: {
      title: 'Para compradores | Comprar um imóvel na Hungria',
      description:
        'Como comprar um imóvel na Hungria com segurança: contrato bilingue, representação por procuração e registo predial. E ainda um serviço de pesquisa gratuito.',
    },
    hero: {
      eyebrow: 'Para compradores',
      title: 'Comprar na Hungria,',
      titleEm: 'sem surpresas',
      body: 'Muitos dos nossos anúncios indicam o proprietário. Pode negociar diretamente ou deixar todo o processo connosco.',
      cta: 'Ver imóveis',
      secondary: 'Pesquisa de imóvel gratuita',
    },
    services: {
      eyebrow: 'Do que tratamos',
      title: 'Acompanhamento completo',
      points: [
        'Comunicação entre si e o vendedor, incluindo intérpretes.',
        'Visitas, com um colega que fala a sua língua.',
        'Apoio na negociação do preço e na elaboração do contrato bilingue.',
        'Representação por procuração: não precisa de viajar até à Hungria para assinar.',
        'Registo predial e transferência dos serviços.',
      ],
    },
    reasons: {
      eyebrow: 'Porquê a Hungria',
      title: 'O que procuram os compradores da Europa Ocidental',
    },
  },

  about: {
    meta: {
      title: 'Quem somos | Uma ponte entre dois mundos',
      description:
        'Desde 2013 pomos em contacto vendedores húngaros e compradores da Europa Ocidental. Com discrição, transparência e sem contrato de exclusividade.',
    },
    hero: {
      eyebrow: 'Quem somos',
      title: 'Uma ponte entre',
      titleEm: 'dois mundos',
      body: 'Desde 2013 ajudamos vendedores húngaros a encontrar o comprador estrangeiro certo: com discrição, eficácia e sem contrato de exclusividade.',
    },
    origin: {
      eyebrow: 'O início · Almere-Buiten, 2013',
      quote:
        '«Vivendo em Almere-Buiten, vimos o quanto os neerlandeses anseiam por um autêntico estilo de vida europeu, enquanto na Hungria os melhores imóveis esperam despercebidos por um dono.»',
    },
    values: {
      eyebrow: 'Aquilo que defendemos',
      title: 'Em que assentamos',
      items: [
        {
          num: '01',
          title: 'Discrição',
          body: 'Tratamos os dados de vendedores e compradores com o máximo cuidado. Os dados pessoais só aparecem com consentimento.',
        },
        {
          num: '02',
          title: 'Transparência',
          body: 'Sem custos ocultos. Os nossos preços e a comissão estão publicados neste site, e mantemo-lo informado em cada etapa.',
        },
        {
          num: '03',
          title: 'Conhecimento bilingue',
          body: 'Conhecemos ambos os mercados por dentro. A nossa equipa fala neerlandês, alemão, inglês, francês e húngaro.',
        },
      ],
    },
    approach: {
      eyebrow: 'A nossa abordagem',
      title: 'Não somos um grande escritório.',
      titleEm: 'É essa a nossa força.',
      points: [
        'Cada cliente tem um contacto pessoal: sem call center, sem balcão anónimo.',
        'Conhecemos ambas as culturas por dentro e avaliamos os imóveis tanto com olhos neerlandeses como húngaros.',
        'Juntar imóvel e comprador é responsabilidade nossa, não uma questão de sorte.',
        'Trabalhamos sem exclusividade porque preferimos convencer pelos resultados.',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: 'A ponte que',
      titleEm: 'construímos',
      paragraphs: [
        'A FODEL foi fundada por húngaros que vivem nos Países Baixos. Começámos em Almere-Buiten em 2013, onde reparámos em quantos neerlandeses e belgas queriam comprar uma autêntica casa húngara, mas não sabiam por onde começar.',
        `Hoje anunciamos em ${REACH_COUNTRIES} países e ${REACH_LANGUAGES} línguas e acompanhamos cada transação do início ao fim: contrato de compra e venda bilingue, representação por procuração e registo predial. O nosso escritório fica em Haia.`,
      ],
    },
  },

  contact: {
    meta: {
      title: 'Contacto | Ligamos-lhe de volta com todo o gosto',
      description: `Ligue-nos nos dias úteis entre as ${COMPANY.hours.weekdays.from} e as ${COMPANY.hours.weekdays.to}, ou peça que lhe liguemos. A chamada não lhe custa nada.`,
    },
    hero: { eyebrow: 'Contacto', title: 'Teremos todo o gosto', titleEm: 'em ligar-lhe' },
    formTitle: 'Pedir uma chamada',
    subjects: [
      'Pergunta sobre um imóvel',
      'Anunciar um imóvel',
      'Pedir preços',
      'Pedido de chamada',
      'Outro',
    ],
    note: `A chamada não lhe custa nada: somos nós que pagamos. Ligamos de volta até às ${COMPANY.hours.callback.to}, incluindo fins de semana.`,
  },
} satisfies CopyShape;
