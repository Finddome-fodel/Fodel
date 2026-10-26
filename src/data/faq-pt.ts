/**
 * FAQ, European Portuguese (formal third person, no "você"). Buyer-facing, like the Dutch set it follows: every
 * figure comes from src/config/company.ts, nothing here is new information.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'pt' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_PT = [
  {
    id: 'direct-from-the-owner',
    question: 'O que significa «diretamente ao proprietário»?',
    answer: [
      'Para grande parte da nossa oferta publicamos o nome e o telefone do proprietário ao lado dos nossos contactos. Pode contactar diretamente o vendedor.',
      'Se o contactar diretamente e tratarem da compra entre si, ninguém paga comissão: nem o comprador nem o vendedor. Nesse caso, somos pagos apenas pelo anúncio.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: 'Quanto custa a vossa mediação?',
    answer: [
      `A nossa comissão é de ${COMMISSION.percent}% líquida, com um mínimo de ${eur(COMMISSION.minimumEur, L)}, acrescida de ${COMMISSION.vatPercent}% de IVA neerlandês. É paga pelo vendedor húngaro, não por si.`,
      'Só faturamos quando se verificam as três condições: existe um contrato de compra e venda escrito, o comprador foi apresentado pela FODEL e o sinal foi pago.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: 'Como cidadão da UE, posso comprar um imóvel na Hungria?',
    answer: [
      'Sim. Como cidadão da UE compra casas e terrenos na Hungria praticamente nas mesmas condições que um húngaro. Quase 100% dos imóveis húngaros assentam em terreno de propriedade plena. Regimes de direito de superfície como o erfpacht neerlandês são raros.',
      `Para terrenos agrícolas aplicam-se regras próprias. Um cidadão da UE com qualificação agrícola pode adquirir até ${AGRI_HECTARE_LIMIT} hectares na Hungria; tratamos de todo esse processo.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: 'Tenho de viajar até à Hungria para assinar?',
    answer: [
      'Não. Podemos representá-lo na Hungria através de uma procuração, pelo que não precisa de vir para a assinatura.',
      'Tratamos também do registo predial húngaro e da transferência dos serviços.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: 'Em que língua é redigido o contrato de compra e venda?',
    answer: [
      'Mandamos redigir contratos bilingues, para que leia o que assina.',
      `Preços indicativos: húngaro desde ${price('hu')}, alemão–húngaro e inglês–húngaro desde ${price('de-hu')}, neerlandês–húngaro desde ${price('nl-hu')}.`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: 'O que trata exatamente a FODEL quando compra?',
    answer: [
      '- Aconselhamento por telefone e e-mail e comunicação entre as partes',
      '- Encontros pessoais e visitas no local',
      '- Um colega que fala a sua língua e viaja consigo',
      '- Apoio na negociação do preço',
      '- Elaboração do contrato multilingue',
      '- Tratamento de toda a compra',
      '- Registo do novo proprietário e transferência dos serviços',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: 'Porque é que os compradores da Europa Ocidental escolhem a Hungria?',
    answer: [
      '- Os custos dos imóveis e de vida são bastante mais baixos',
      '- Na Hungria, em regra, não é cobrado imposto sobre imóveis',
      '- Mais sol e um clima mais ameno',
      '- O país situa-se acima do nível do mar, no centro do continente',
      '- A Hungria é um Estado-Membro da UE',
      '- Quase todos os imóveis assentam em terreno de propriedade plena',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: 'Um imóvel húngaro tem certificado energético?',
    answer: [
      'Sim. A Hungria exige um certificado energético (energiatanúsítvány), que tem de constar do anúncio. Nos nossos anúncios a classe aparece nas características; «em curso» significa que o certificado ainda está a ser preparado.',
      'Se o vendedor quiser, podemos tratar da emissão do certificado.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: 'O que é o serviço de pesquisa e quanto custa?',
    answer: [
      'O serviço de pesquisa é gratuito. Diz-nos o que procura (tipo, zona, orçamento e preferências) e nós procuramos por si, também para além dos imóveis deste site.',
      'Os nossos colegas que falam húngaro ajudam na negociação e asseguram que o contrato é redigido corretamente do ponto de vista jurídico. Recebe um e-mail assim que surgir algo adequado.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: 'Que zonas abrangem?',
    answer: [
      'O foco é a Transdanúbia, com os condados de Baranya, Tolna, Zala, Somogy e Veszprém, além do lago Balaton e das terras altas do Balaton.',
      'Temos também imóveis na planície e em zonas com boas ligações ao aeroporto de Budapeste.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: 'Não falo húngaro. Isso é um problema?',
    answer: [
      'Não. Cada anúncio indica as línguas que o proprietário fala, para que saiba de antemão.',
      'A nossa equipa fala neerlandês, alemão, inglês, francês e húngaro, e acompanha-o na visita.',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: 'Quando vos posso contactar?',
    answer: [
      `Nos dias úteis entre as ${COMPANY.hours.weekdays.from} e as ${COMPANY.hours.weekdays.to}. Se pedir que lhe liguemos, ligamos até às ${COMPANY.hours.callback.to}, incluindo fins de semana.`,
      'A chamada não lhe custa nada. Somos nós que pagamos.',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
