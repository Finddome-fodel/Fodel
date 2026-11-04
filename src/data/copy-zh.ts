/**
 * Page copy, Simplified Chinese.
 *
 * Polite "您" register, plain professional real-estate Chinese with
 * full-width punctuation. The figures come from src/config/company.ts, never
 * from this file. Type-checked against the Hungarian copy, so a missing key
 * fails the build.
 */

import { COMPANY, COMMISSION, foundedInLabel } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { BRAND } from '~/i18n/ui';
import { eur } from '~/lib/format';
import type { CopyShape, Step, Stat, Persona } from '~/data/copy';

const REACH_COUNTRIES = COMPANY.reach.countries;
const REACH_LANGUAGES = COMPANY.reach.languages;
const L = 'zh' as const;
const pct = (n: number) => `${n}%`;

export const ZH = {
  home: {
    meta: {
      title: 'FINDDOME 房产 | 在欧洲发布您的房产广告',
      description:
        '只需几步即可上传房源。在线付款后，房源将以 28 种语言在我们的网站上发布，无需签订独家协议。',
    },
    hero: {
      eyebrow: `创立于 2013 年 · ${foundedInLabel(L)}`,
      title: ['在欧洲', '发布您的', '房产广告'],
      emphasis: 1,
      body: '只需几步即可上传房源。我们审核后，您在线付款，房源即以 28 种语言在我们的网站上发布，无需签订独家协议。感兴趣的买家可直接联系您，也可通过我们联系。',
      primary: '浏览房源',
      secondary: '免费找房服务',
      featuredLabel: '精选',
    },
    audiences: [
      {
        eyebrow: '买家',
        title: '房东直售\n房产',
        body: '地道的匈牙利住宅、农场、乡间庄园和葡萄园。您可以直接联系房东，也可以将整个流程交给 FINDDOME。',
        cta: '浏览房源',
        to: 'properties',
      },
      {
        eyebrow: '卖家',
        title: '让您在匈牙利的房产\n进入西欧市场',
        body: `以 ${REACH_LANGUAGES} 种语言在 ${REACH_COUNTRIES} 个国家推广，无需签订独家协议。只有由我们带来买家时才收取佣金。`,
        cta: '了解更多',
        to: 'sellers',
      },
    ],
    featured: { eyebrow: '精选', title: '精选房源' },
    quote: '“荷兰人看到在匈牙利能买到什么样的房子、价格又是多少时，常常不敢相信自己的眼睛。”',
    quoteSource: `${BRAND.zh.name} · ${SITE_HOST}`,
    how: { eyebrow: '运作方式', title: 'FINDDOME 如何运作' },
    cta: {
      eyebrow: '联系我们',
      title: '我们很乐意',
      titleEm: '给您回电',
      body: `{hoursShort} · 回电不收取您任何费用。`,
    },
    referral: {
      eyebrow: '推荐计划',
      title: '推荐广告发布者，',
      titleEm: '获得 10%',
      body: '如果有人经您推荐在 FINDDOME 发布房源，对方可享受套餐 10% 的折扣，我们也会在您的下一条房源中为您抵扣 10%。已经在我们这里发布房源？您可以在门户的“设置”中找到自己的推荐码。',
      steps: [
        '通过下方表单推荐一位熟人，或分享您在门户中的专属链接',
        '我们的团队成员会与对方联系',
        '对方发布房源即可节省 10%，我们也会为您抵扣 10%',
      ],
      formTitle: '推荐一位熟人',
      fields: {
        referrerName: '您的姓名',
        referrerEmail: '您的邮箱地址',
        referredName: '被推荐人姓名',
        referredEmail: '被推荐人邮箱地址',
      },
      submit: '发送推荐',
      successTitle: '感谢您的推荐！',
      successBody:
        '我们已收到您的推荐。我们的同事会与您推荐的人联系，并通过邮件向您通报进展。',
    },
  },

  steps: [
    {
      num: '01',
      title: `在 ${REACH_COUNTRIES} 个国家推广`,
      body: `我们以 ${REACH_LANGUAGES} 种语言在荷兰、比利时、德国、英国及其他欧盟国家投放广告，且不与卖家签订独家协议。`,
    },
    {
      num: '02',
      title: '直接联系',
      body: '许多房源在我们的联系方式旁同时列出房东的姓名和电话。如果您与房东自行商定，双方都无需支付佣金。',
    },
    {
      num: '03',
      title: '全程代办',
      body: '双语买卖合同、凭授权委托书代理、土地登记处登记以及水电燃气等公用事业的过户。',
    },
  ] as Step[],

  stats: [
    { value: '2013', label: '创立年份' },
    { value: String(REACH_COUNTRIES), label: '国家' },
    { value: String(REACH_LANGUAGES), label: '语言' },
    { value: pct(COMMISSION.percent), label: '佣金' },
  ] as Stat[],

  sellers: {
    meta: {
      title: '卖家 | 让您在匈牙利的房产进入西欧市场',
      description: `以 ${REACH_LANGUAGES} 种语言在 ${REACH_COUNTRIES} 个国家推广您在匈牙利的房产，${eur(69, L)} 起，无需独家协议。仅当 FINDDOME 带来买家时收取佣金：${pct(COMMISSION.percent)} + ${pct(COMMISSION.vatPercent)} 增值税。`,
    },
    hero: {
      eyebrow: '卖家',
      title: '您的房产',
      titleEm: '走进西欧',
      body: `采用 FINDDOME 模式，您的房产将以 ${REACH_LANGUAGES} 种语言在 ${REACH_COUNTRIES} 个国家展示，无需签订独家协议。我们只与认真的买家合作。`,
      cta: '发布房源',
      secondary: '查看价格',
    },
    benefits: {
      eyebrow: '优势',
      title: '外国买家能带来什么',
      points: [
        '买家使用自有资金：无需等待贷款或补贴。',
        '通过银行转账一次性付款，快速且安全。',
        '诚意十足：一次看房要花费他们两天时间和 200–300 €。',
        '价格务实：不会无理压价。',
        'FINDDOME 在安排任何看房之前都会亲自评估每一位买家。',
      ],
    },
    personas: {
      eyebrow: '买家',
      title: '我们的买家是谁',
      items: [
        {
          title: '退休人士',
          body: '在匈牙利寻求更低的生活成本、税收优惠和实惠的医疗服务。',
        },
        {
          title: '家庭',
          body: '寻求空间、自然和乡村生活，常常是农场、农庄或度假屋。',
        },
        {
          title: '投资者',
          body: '寻找商业地产、葡萄园和农业用地。',
        },
        {
          title: '为生活方式而移居的人',
          body: '告别高昂的生活成本和拥挤，追寻地道的欧洲生活方式。',
        },
      ] as Persona[],
    },
    how: { eyebrow: '分步说明', title: 'FINDDOME 模式' },
    commission: {
      eyebrow: '价格',
      title: '仅在成功出售后\n收取佣金',
      body: `如果买家直接联系您且您无需我们协助，除广告费外您无需支付任何费用。如果由 FINDDOME 促成交易：净额 ${pct(COMMISSION.percent)}（最低 ${eur(COMMISSION.minimumEur, L)}）+ ${pct(COMMISSION.vatPercent)} 荷兰增值税。`,
      cta: '查看价格',
    },
  },

  buyers: {
    meta: {
      title: '买家 | 在匈牙利购买房产',
      description:
        '如何安全地在匈牙利购房：双语合同、凭授权委托书代理以及土地登记处登记。另有免费找房服务。',
    },
    hero: {
      eyebrow: '买家',
      title: '在匈牙利购房，',
      titleEm: '没有意外',
      body: '我们的许多房源都注明了房东。您可以直接议价，也可以将整个流程交给我们。',
      cta: '浏览房源',
      secondary: '免费找房服务',
    },
    services: {
      eyebrow: '我们负责的事项',
      title: '全方位支持',
      points: [
        '您与卖家之间的沟通，包括翻译。',
        '由会说您的语言的同事陪同看房。',
        '协助议价并起草双语合同。',
        '凭授权委托书代理：无需前往匈牙利签字。',
        '土地登记处登记以及公用事业过户。',
      ],
    },
    reasons: {
      eyebrow: '为什么选择匈牙利',
      title: '西欧买家在寻找什么',
    },
  },

  about: {
    meta: {
      title: '关于我们 | 连接两个世界的桥梁',
      description:
        '自 2013 年起，我们为匈牙利卖家和西欧买家牵线搭桥。保密、透明，且无需独家协议。',
    },
    hero: {
      eyebrow: '关于我们',
      title: '连接两个世界的',
      titleEm: '桥梁',
      body: '自 2013 年起，我们帮助匈牙利卖家找到合适的外国买家：保密、高效，且无需独家协议。',
    },
    origin: {
      eyebrow: '起点 · 阿尔梅勒-拜滕，2013 年',
      quote:
        '“住在阿尔梅勒-拜滕时，我们看到荷兰人多么向往地道的欧洲生活方式，而在匈牙利，最美的房产却无人问津，静待主人。”',
    },
    values: {
      eyebrow: '我们的立场',
      title: '我们的基石',
      items: [
        {
          num: '01',
          title: '保密',
          body: '我们以最审慎的态度处理卖家和买家的信息。个人信息仅在获得同意后公开。',
        },
        {
          num: '02',
          title: '透明',
          body: '没有隐藏费用。我们的价格和佣金均公布在本网站上，每一步都会告知您。',
        },
        {
          num: '03',
          title: '熟悉两种文化',
          body: '我们从内部了解两个市场。我们的团队会说荷兰语、德语、英语、法语和匈牙利语。',
        },
      ],
    },
    approach: {
      eyebrow: '我们的方式',
      title: '我们不是大公司。',
      titleEm: '这正是我们的优势。',
      points: [
        '每位客户都有专人联系：没有呼叫中心，没有匿名窗口。',
        '我们深谙两种文化，同时以荷兰人和匈牙利人的眼光评估房产。',
        '促成房产与买家的匹配是我们的责任，而非运气。',
        '我们不要求独家，因为我们更愿意用结果说话。',
      ],
    },
    story: {
      eyebrow: foundedInLabel(L),
      title: '我们搭建的',
      titleEm: '桥梁',
      paragraphs: [
        'FINDDOME 由旅居荷兰的匈牙利人创立。2013 年我们在阿尔梅勒-拜滕起步，当时我们注意到，许多荷兰人和比利时人都想购买一座地道的匈牙利住宅，却不知从何着手。',
        `如今，我们在 ${REACH_COUNTRIES} 个国家以 ${REACH_LANGUAGES} 种语言推广房源，并全程跟进每一笔交易：双语买卖合同、凭授权委托书代理以及土地登记处登记。我们的办公室位于海牙。`,
      ],
    },
  },

  contact: {
    meta: {
      title: '联系我们 | 我们很乐意给您回电',
      description: `工作日 ${COMPANY.hours.weekdays.from}–${COMPANY.hours.weekdays.to} 欢迎来电，或申请回电。通话不收取您任何费用。`,
    },
    hero: { eyebrow: '联系我们', title: '我们很乐意', titleEm: '给您回电' },
    formTitle: '申请回电',
    submit: '提交回电申请',
    subjects: [
      '房源咨询',
      '发布房源',
      '询问价格',
      '回电申请',
      '其他',
    ],
    note: `回电不收取您任何费用：通话费用由我们承担。包括周末在内，我们回电至 ${COMPANY.hours.callback.to}。`,
  },
} satisfies CopyShape;
