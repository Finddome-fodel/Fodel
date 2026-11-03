/**
 * Long-form pages, Simplified Chinese: services, agricultural property,
 * buying guide, moving to Hungary, photo guide. Figures come from
 * src/config/company.ts.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { AGRI_HECTARE_LIMIT, COMMISSION, CONTRACT_PRICES, LISTING_EXTRAS } from '~/config/company';
import { photoGuideSections } from '~/data/photo-tips';
import { eur } from '~/lib/format';
import type { ContentKey } from '~/data/pages-content';

const L = 'zh' as const;
const from = (id: (typeof CONTRACT_PRICES)[number]['id']) =>
  `${eur(CONTRACT_PRICES.find((price) => price.id === id)!.fromEur, L)} 起`;
const video = LISTING_EXTRAS.find((extra) => extra.id === 'video')!.priceEur;

export const CONTENT_ZH = {
  services: {
    metaTitle: '服务：交易全程协助、合同、摄影',
    metaDescription: `双语买卖合同（${from('hu')}）、授权委托代理、土地登记、能源证书、房产摄影及无人机航拍。`,
    eyebrow: '服务',
    title: '我们的服务',
    titleEm: '不止于房源发布',
    intro: '发布房源只是第一步。通过以下服务，我们依照两国的规定，为您承担整个购房流程。',
    sections: [
      {
        type: 'steps',
        title: '交易流程',
        items: [
          { n: '01', t: '联络', b: '电话与邮件咨询，与买卖双方沟通，包括与翻译人员的协调。' },
          { n: '02', t: '买家审核', b: '我们核实买家的背景、购买意向和支付能力。' },
          { n: '03', t: '看房', b: '我们安排看房时间并全程陪同，由会说您语言的同事随行。' },
          { n: '04', t: '议价', b: '以两种语言提供支持，确保价格区间切合实际。' },
          { n: '05', t: '合同', b: '与律师合作起草双语买卖合同。' },
          { n: '06', t: '交割', b: '办理土地登记、水电燃气过户，必要时凭授权委托书代理。' },
        ],
      },
      {
        type: 'table',
        title: '双语买卖合同',
        intro: '按语言组合列出的参考价格。最终价格取决于合同篇幅。',
        rows: [
          ['匈牙利语', from('hu')],
          ['德语–匈牙利语', from('de-hu')],
          ['英语–匈牙利语', from('en-hu')],
          ['荷兰语–匈牙利语', from('nl-hu')],
        ],
      },
      {
        type: 'list',
        title: '其他服务',
        intro: '以下服务我们会单独报价：',
        items: [
          '办理能源证书：根据欧盟规定，房源信息中必须注明',
          '专业房产摄影',
          '无人机航拍：尤其适合大面积地块和景观',
          `房源视频（${eur(video, L)}）`,
        ],
      },
      {
        type: 'callout',
        title: '授权委托代理',
        body: '签约无需亲赴匈牙利：凭授权委托书，我们可代表您签约、办理土地登记以及水电燃气等账户过户。',
      },
      {
        type: 'prose',
        title: '何时收取佣金',
        paragraphs: [
          `只有当买家由 FINDDOME 介绍、签订了书面买卖合同且定金已支付时，我们才收取佣金。佣金为净额的 ${COMMISSION.percent}%，最低 ${eur(COMMISSION.minimumEur, L)}，另加 ${COMMISSION.vatPercent}% 的荷兰增值税。佣金由卖方支付，买方无需支付。`,
        ],
      },
      {
        type: 'cta',
        title: '对流程有疑问',
        body: '{hours} 可申请免费回电，或给我们发邮件。',
        primary: { label: '联系我们', to: 'contact' },
        secondary: { label: '常见问题', to: 'faq' },
      },
    ],
  },

  agricultural: {
    metaTitle: `农业地产：在匈牙利最多可购 ${AGRI_HECTARE_LIMIT} 公顷`,
    metaDescription: `具备农业资质的欧盟公民在匈牙利最多可购买 ${AGRI_HECTARE_LIMIT} 公顷土地。FINDDOME 为您办理全部手续。`,
    eyebrow: '农业地产',
    title: '农业用地',
    titleEm: '与乡村庄园',
    intro: '匈牙利的土地市场有其独特规则。了解这些条件，您就能购入葡萄园、耕地、农场和林地。',
    sections: [
      {
        type: 'prose',
        title: `${AGRI_HECTARE_LIMIT} 公顷上限`,
        paragraphs: [
          `具备农业资质的欧盟公民在匈牙利合计最多可购买 ${AGRI_HECTARE_LIMIT} 公顷土地。我们为您全程办理相关手续。`,
          '整个流程涉及多个政府审批环节，第一步是认证您的资质。我们的团队全程陪同，并以两种语言准备所需文件。',
        ],
      },
      {
        type: 'list',
        title: '我们的客户购买的地产类型',
        items: [
          '葡萄园，可附带正在运营的酒窖',
          '可申请欧盟补贴的耕地',
          '带附属建筑、适合畜牧养殖的农场',
          '林地及多用途庄园',
          '作为投资的大面积连片土地',
        ],
      },
      {
        type: 'steps',
        title: '流程',
        items: [
          { n: '01', t: '咨询', b: '我们与您沟通计划和可用预算。' },
          { n: '02', t: '资质认证', b: '我们为您办理农业资质在匈牙利的认证。' },
          { n: '03', t: '寻找土地', b: '我们与合作伙伴一起寻找符合条件的土地。' },
          { n: '04', t: '许可', b: '申请购买土地所需的各项许可。' },
          { n: '05', t: '购买', b: '双语合同、土地登记、补贴权利的转移。' },
        ],
      },
      {
        type: 'callout',
        title: '重要提示',
        body: '农业用地的购买规定会不时调整，并取决于您的个人情况。本页内容仅供参考。如有具体计划，请务必咨询我们以及专业律师。',
      },
      {
        type: 'cta',
        title: '正在寻找农业地产',
        body: '告诉我们您的需求；我们的搜寻范围不限于已发布的房源。',
        primary: { label: '免费委托找房', to: 'searchRequest' },
        secondary: { label: '我们的房源', to: 'properties' },
      },
    ],
  },

  buyingGuide: {
    metaTitle: '在匈牙利购房：分步流程',
    metaDescription: '外国买家在匈牙利购房的流程：合同、定金、土地登记、水电燃气及预计费用。',
    eyebrow: '买家须知',
    title: '在匈牙利',
    titleEm: '购房',
    intro: '只要了解各个步骤，在匈牙利购房的流程是相当清晰可控的。本指南将带您逐步了解。',
    sections: [
      {
        type: 'steps',
        title: '流程',
        items: [
          { n: '01', t: '选房', b: '从我们的房源中挑选，或免费提交找房委托。' },
          { n: '02', t: '看房', b: '我们安排行程和看房，并配备翻译。' },
          { n: '03', t: '出价', b: '我们帮助您提出合理报价并进行议价。' },
          { n: '04', t: '合同与定金', b: '签订双语买卖合同，通常支付 10% 的定金。' },
          { n: '05', t: '购房款', b: '按合同约定，以银行转账支付剩余房款。' },
          { n: '06', t: '交房', b: '土地登记、水电燃气过户、交接钥匙。' },
        ],
      },
      {
        type: 'list',
        title: '购房款以外的费用',
        items: [
          '产权转让税：税率取决于房产类型和您的情况',
          '律师起草及见证合同的费用',
          `双语合同翻译：${from('hu')}，视语言组合而定`,
          '土地登记费用',
          '可能产生的 FINDDOME 佣金：由卖方支付，您无需支付',
        ],
      },
      {
        type: 'prose',
        title: '您无需亲自到场',
        paragraphs: [
          '凭授权委托书，我们可代表您签约、办理土地登记以及水电燃气等账户过户。因此，即使您无法或不想出行，也能完成购房。',
        ],
      },
      {
        type: 'callout',
        title: '能源证书',
        body: '匈牙利要求提供能源证书，根据欧盟规定，房源信息中也必须注明。在我们的房源中，您可以在房产特征里看到能效等级；“办理中”表示证书仍在准备中。',
      },
      {
        type: 'cta',
        title: '开始吧',
        body: '浏览房源，或告诉我们您在寻找什么。这不会产生任何费用。',
        primary: { label: '我们的房源', to: 'properties' },
        secondary: { label: '免费委托找房', to: 'searchRequest' },
      },
    ],
  },

  emigration: {
    metaTitle: '移居匈牙利：荷兰人为何选择迈出这一步',
    metaDescription: '荷兰和比利时买家移居匈牙利的四大原因：性价比、空间、更低的生活成本以及地理位置。',
    eyebrow: '背景',
    title: '移居',
    titleEm: '匈牙利',
    intro: '许多荷兰人和比利时人选择了匈牙利。在与客户的数百次交流中，同样的四个原因被反复提及。',
    sections: [
      {
        type: 'prose',
        title: '性价比',
        paragraphs: [
          '匈牙利的乡村房产是全欧洲性价比最高的之一。在荷兰，一块 125 平方米的建筑用地轻松就要 88,000 €，一个车库约 100,000 €。同样的钱，在匈牙利乡村可以买下一栋宽敞的独栋住宅，往往还带有大片土地。',
        ],
      },
      {
        type: 'prose',
        title: '空间',
        paragraphs: [
          '荷兰人口约 1700 万，人口密度为每平方公里 482 人，而且国土很大一部分是水域。空间匮乏不是抽象的问题，而是日常的切身感受，也是被提及最多的原因。',
        ],
      },
      {
        type: 'prose',
        title: '生活成本',
        paragraphs: [
          '我们的买家中有很大一部分已经退休或即将退休。对他们来说，更低的生活成本、无房产税以及价格合理的医疗服务，加在一起意味着同样的养老金在荷兰无法实现的生活水平。',
        ],
      },
      {
        type: 'prose',
        title: '地理位置',
        paragraphs: [
          '自 1953 年洪灾以来，荷兰修建了庞大的防洪体系。对海平面上升的担忧影响着许多人的决定：匈牙利位于欧洲大陆中部，海拔高于海平面。',
        ],
      },
      {
        type: 'cta',
        title: '是时候看看了',
        body: '浏览我们的房源，或让我们为您寻找心目中的房子。',
        primary: { label: '我们的房源', to: 'properties' },
        secondary: { label: '在匈牙利购房', to: 'buyingGuide' },
      },
    ],
  },

  photoGuide: {
    metaTitle: '卖家拍照指南',
    metaDescription: '好照片是快速成交最重要的工具。FINDDOME 拍照指南：光线、构图方向、分辨率以及最常见的错误。',
    eyebrow: '卖家须知',
    title: '拍照',
    titleEm: '指南',
    intro: '来自国外的意向买家首先看到的是照片，而且往往只看照片。这些规则比任何房源文字都更有效。',
    sections: photoGuideSections(L, {
      topTitle: '最重要的六条规则',
      calloutTitle: '更愿意交给专业人士',
      calloutBody: (lines) =>
        `请专业人士来拍。发布房源时只需点击一下即可选择：${lines.join('；')}。两项服务均为可选；我们的同事会与您联系，约定拍摄时间。`,
      ctaTitle: '准备好发布您的房产了吗',
      primary: '发布房源',
      secondary: '价格',
    }),
  },
} satisfies Record<ContentKey, ContentPageData>;
