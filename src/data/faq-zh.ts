/**
 * FAQ, Simplified Chinese. Buyer-facing, translated from the English set (src/data/faq-en.ts):
 * same ids, same order; every figure comes from src/config/company.ts.
 */
import type { FaqEntry } from '~/data/faq';
import { AGRI_HECTARE_LIMIT, COMMISSION, COMPANY, CONTRACT_PRICES } from '~/config/company';
import { eur } from '~/lib/format';

const L = 'zh' as const;
const price = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  eur(CONTRACT_PRICES.find((entry) => entry.id === id)!.fromEur, L);

export const FAQ_ZH = [
  {
    id: 'direct-from-the-owner',
    question: '“业主直售”是什么意思？',
    answer: [
      '我们的大部分房源会在我们的联系方式旁边同时公布业主的姓名和电话号码。您可以直接联系卖方。',
      '如果您直接联系并自行商定购买，则任何一方都无需支付佣金：您不用付，卖方也不用付。这种情况下，我们只收取房源发布费用。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'commission',
    question: '你们的中介服务收费多少？',
    answer: [
      `我们的佣金为净额的 ${COMMISSION.percent}%，最低 ${eur(COMMISSION.minimumEur, L)}，另加 ${COMMISSION.vatPercent}% 的荷兰增值税。佣金由匈牙利卖方支付，您无需支付。`,
      '只有同时满足以下三个条件时我们才开具发票：已签订书面买卖合同、买家由 FINDDOME 介绍，且定金已支付。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'buying-as-an-eu-citizen',
    question: '作为欧盟公民，我可以在匈牙利买房吗？',
    answer: [
      '可以。作为欧盟公民，您在匈牙利购买房屋和地块的条件与匈牙利人几乎相同。匈牙利近 100% 的房产建在永久产权土地上，类似荷兰 erfpacht 的长期租赁地权非常少见。',
      `农业用地另有规定。具备农业资质的欧盟公民在匈牙利最多可购买 ${AGRI_HECTARE_LIMIT} 公顷土地；相关手续由我们全程办理。`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'travel-to-sign',
    question: '签约时我必须去匈牙利吗？',
    answer: [
      '不必。我们可以凭授权委托书在匈牙利代表您，您无需亲自前来签约。',
      '我们还负责在匈牙利土地登记处办理登记，以及水电燃气等账户的过户。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'bilingual-contract',
    question: '买卖合同用哪种语言起草？',
    answer: [
      '我们会安排起草双语合同，让您清楚自己签署的内容。',
      `参考价格：匈牙利语 ${price('hu')} 起，德语–匈牙利语和英语–匈牙利语 ${price('de-hu')} 起，荷兰语–匈牙利语 ${price('nl-hu')} 起。`,
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'what-fodel-handles',
    question: '购房时 FINDDOME 具体负责哪些事项？',
    answer: [
      '- 电话和邮件咨询，以及买卖双方之间的沟通',
      '- 当面会谈和实地看房',
      '- 由会说您语言的同事全程陪同',
      '- 协助议价',
      '- 准备多语言合同',
      '- 办理整个购房流程',
      '- 新业主登记及水电燃气过户',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'why-hungary',
    question: '为什么西欧买家选择匈牙利？',
    answer: [
      '- 房价和生活成本明显更低',
      '- 匈牙利一般不征收房产税',
      '- 阳光更充足，气候更温和',
      '- 国家位于欧洲大陆中部，海拔高于海平面',
      '- 匈牙利是欧盟成员国',
      '- 几乎所有房产都建在永久产权土地上',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'energy-certificate',
    question: '匈牙利的房产有能源证书吗？',
    answer: [
      '有。匈牙利要求提供能源性能证书（energiatanúsítvány），且必须在房源信息中注明。在我们的房源中，能效等级显示在房产特征里；“办理中”表示证书仍在准备中。',
      '如果卖方需要，我们可以代为安排办理证书。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'search-service',
    question: '什么是找房服务？收费多少？',
    answer: [
      '找房服务免费。告诉我们您想找什么（类型、地区、预算和要求），我们就会为您寻找，范围不限于本网站上的房源。',
      '我们会说匈牙利语的同事会协助议价，并确保合同依法正确起草。一旦有合适的房源，您就会收到邮件。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'which-areas',
    question: '你们覆盖哪些地区？',
    answer: [
      '重点是外多瑙地区，包括巴兰尼亚州、托尔瑙州、佐洛州、绍莫吉州和维斯普雷姆州，以及巴拉顿湖和巴拉顿高地。',
      '我们在平原地区以及前往布达佩斯机场交通便利的地区也有房源。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'language-barrier',
    question: '我不会说匈牙利语，这会有问题吗？',
    answer: [
      '不会。每条房源都注明了业主会说哪些语言，您可以提前了解。',
      '我们的团队会说荷兰语、德语、英语、法语和匈牙利语，并会陪同您看房。',
    ],
    audience: 'buyer',
    sourced: true,
  },
  {
    id: 'reaching-us',
    question: '什么时候可以联系到你们？',
    answer: [
      `工作日 ${COMPANY.hours.weekdays.from} 至 ${COMPANY.hours.weekdays.to}。如果您申请回电，我们会在 ${COMPANY.hours.callback.to} 之前致电，周末也不例外。`,
      '回电不收取您任何费用，通话费用由我们承担。',
    ],
    audience: 'buyer',
    sourced: true,
  },
] satisfies FaqEntry[];
