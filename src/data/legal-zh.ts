/**
 * Legal pages, Simplified Chinese. A faithful translation of the English
 * legal pages (src/data/legal-en.ts): same sections, same figures, same meaning.
 *
 * ⚠️ Courtesy translation. The notice on every page states that the Hungarian
 * or English version prevails (the Dutch original on matters of Dutch law).
 * It needs the client's and a lawyer's sign-off before launch, like the other
 * translations; see Fodel-forditasok-atadas.md.
 */
import type { ContentPageData } from '~/lib/content-sections';
import { legacyTiers } from '~/lib/price-tiers';
import { COMPANY, COMMISSION, addressLine, LISTING_EXTRAS, LISTING_PACKAGES, LISTING_VAT_PERCENT } from '~/config/company';
import { SITE_HOST } from '~/config/site.mjs';
import { eur } from '~/lib/format';
import type { LegalKey } from '~/data/pages-legal';

const L = 'zh' as const;
const kvk = COMPANY.registration.kvk ?? '—';
const updated = '2026年7月27日';
const notice =
  '本译文仅为方便阅读而提供。如有任何不一致，以匈牙利语或英语版本为准（涉及荷兰法律的事项以荷兰语原文为准）。';
const extra = (id: (typeof LISTING_EXTRAS)[number]['id']) => LISTING_EXTRAS.find((entry) => entry.id === id)!;
const [cheap, normal] = LISTING_PACKAGES;
/** Every tier price of a package, e.g. "€ 129 / € 179" (the tier is set by the listing's forint price). */
const tierPrices = (pkg: typeof normal) =>
  legacyTiers(pkg.priceEur, pkg.priceEurAbove, pkg.thresholdHuf).map((tier) => eur(tier.priceEur, L)).join(' / ');
// Only the category highlight is sold since November 2026; the homepage is an editorial choice.
const minMonths = (extra('category-highlight') as { minMonths?: number }).minMonths ?? 3;

export const LEGAL_ZH = {
  imprint: {
    metaTitle: '法律信息：公司资料',
    metaDescription: `${COMPANY.names.legal} 的公司资料：注册地址、增值税号、KvK 注册号及联系方式。`,
    eyebrow: '法律信息',
    title: '公司',
    titleEm: '资料',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: '服务提供者信息',
        rows: [
          ['公司名称', COMPANY.names.legal],
          ['注册地址', addressLine(COMPANY.address, L)],
          ['增值税号', COMPANY.registration.vat],
          ['KvK 注册号（荷兰商会）', kvk],
          ['代表人', COMPANY.principal],
          ['电子邮箱', COMPANY.email.primary],
          ['电话', COMPANY.phones.slice(0, 2).map((p) => p.display).join(' · ')],
          ['成立年份', String(COMPANY.founded)],
        ],
      },
      {
        type: 'table',
        title: '银行账户',
        rows: [
          ['荷兰', `${COMPANY.banks.nl.iban} (${COMPANY.banks.nl.bic})`],
          ['匈牙利', COMPANY.banks.hu.account],
        ],
      },
      {
        type: 'callout',
        title: '争议解决',
        body: '如发生消费者争议，您也可以使用欧盟在线争议解决（ODR）平台：ec.europa.eu/consumers/odr',
      },
    ],
  },

  privacy: {
    metaTitle: '隐私声明',
    metaDescription:
      'FODEL 如何处理您的个人数据：我们处理哪些数据、保存多长时间，以及您依据 GDPR 享有哪些权利。',
    eyebrow: '隐私',
    title: '隐私',
    titleEm: '声明',
    intro: '本声明说明我们如何依照 GDPR 处理您通过本网站提供给我们的个人数据。',
    updated,
    notice,
    sections: [
      {
        type: 'table',
        title: '数据控制者',
        rows: [
          ['控制者', COMPANY.names.legal],
          ['地址', addressLine(COMPANY.address, L)],
          ['电子邮箱', COMPANY.email.primary],
        ],
      },
      {
        type: 'list',
        title: '我们处理哪些数据',
        intro: '仅限您本人在我们表单中填写的数据：',
        items: [
          '姓名、电子邮箱和电话号码：以便我们回复您的咨询',
          '您留言的主题和内容',
          '发布房源时：房产信息及您的开票信息',
          '委托找房时：您的搜索条件',
          '内部管理记录：您何时填写了哪份表单、何时登录门户，不保存 IP 地址',
        ],
      },
      {
        type: 'table',
        title: '法律依据与保存期限',
        rows: [
          ['联系及回电申请', '同意（GDPR 第 6(1)(a) 条）：12 个月'],
          ['房源订单', '履行合同（第 6(1)(b) 条）：7 年，即法定税务保存期限'],
          ['找房委托', '同意：直至完成，最长 24 个月'],
          ['内部操作日志', '正当利益（第 6(1)(f) 条）：规范管理及发现滥用行为：最长 24 个月'],
        ],
      },
      {
        type: 'list',
        title: '我们与谁共享数据',
        intro: '我们不出售您的数据，也不会出于营销目的共享数据。我们的数据处理者包括：',
        items: [
          '我们的电子邮件服务商，数据在欧盟境内处理',
          '本网站的托管服务商',
          '购房时，且仅应您的要求：交易对方及参与交易的律师',
        ],
      },
      {
        type: 'callout',
        title: '关于房源',
        body: '作为发布者，您可以允许我们在房源中显示您的姓名和电话号码，方便意向买家直接与您联系。您可以随时撤回该许可；届时我们会从房源中删除这些信息。',
      },
      // DRAFT: waiting for legal review (newsletter, 2026-10).
      {
        type: 'callout',
        title: '新闻通讯',
        body: '如果您订阅我们的新闻通讯，我们将基于您的同意处理您的电子邮箱、所选语言以及订阅和确认的时间，仅用于向您发送新闻通讯。订阅分两步完成：在您点击确认邮件中的按钮之前，我们不会发送任何内容。每封邮件中都可一键退订，我们会立即停止发送。我们使用 Resend 服务发送邮件。',
      },
      {
        type: 'list',
        title: '您的权利',
        items: [
          '查阅我们处理的有关您的数据',
          '更正和删除',
          '限制处理或反对处理',
          '数据可携带',
          '随时撤回您的同意',
          '向荷兰数据保护局（Autoriteit Persoonsgegevens）投诉',
        ],
      },
      {
        type: 'prose',
        title: '隐私相关联系',
        paragraphs: [`如有疑问或请求，请发送至 ${COMPANY.email.primary}。我们最迟在 30 天内回复。`],
      },
    ],
  },

  cookies: {
    metaTitle: 'Cookie 声明',
    metaDescription: `${SITE_HOST} 使用哪些 Cookie，以及如何更改您的选择。`,
    eyebrow: 'Cookie',
    title: 'Cookie',
    titleEm: '声明',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          '本网站目前仅使用技术上必需的存储。我们不运行任何广告或跟踪脚本，也不与社交平台共享任何内容。',
        ],
      },
      {
        type: 'table',
        title: '我们存储的内容',
        rows: [
          [
            'fodel:consent',
            '您对 Cookie 的选择（接受或拒绝）。保存在您的浏览器中，不会传送给我们。保存期限：12 个月。',
          ],
        ],
      },
      {
        type: 'prose',
        title: '访问统计',
        paragraphs: [
          '如果我们将来进行访问统计，只会在事先获得您明确同意后才启用。拒绝不会以任何方式限制您使用本网站。',
        ],
      },
      {
        type: 'prose',
        title: '更改您的选择',
        paragraphs: [
          '您可以随时清除浏览器中为本网站保存的数据来更改选择；之后 Cookie 提示会再次出现。',
        ],
      },
    ],
  },

  terms: {
    metaTitle: '一般条款与条件',
    metaDescription: 'FODEL 房源发布及中介服务的条款：价格、佣金、撤回及责任。',
    eyebrow: '条款',
    title: '一般条款',
    titleEm: '与条件',
    updated,
    notice,
    sections: [
      {
        type: 'callout',
        title: '请注意',
        body: '本页为摘要。完整且具约束力的条款以 PDF 形式提供；如有不一致，以 PDF 为准。',
      },
      {
        type: 'prose',
        title: '1. 服务内容',
        paragraphs: [
          'FODEL 在自有的多语言网站上发布匈牙利房产信息，并根据单独协议协助完成交易。',
          '房源发布服务不具排他性：卖方也可以通过其他渠道推介和出售房产。',
        ],
      },
      {
        type: 'list',
        title: '2. 发布房源',
        ordered: true,
        items: [
          '卖方填写注册表单。',
          'FODEL 就所选套餐发送付款通知。',
          '卖方通过银行转账付款。',
          '收到款项后，卖方获得上传照片的权限。',
          'FODEL 负责翻译并发布房源。',
        ],
      },
      {
        type: 'table',
        title: '3. 价格',
        intro: `所有价格均含 ${LISTING_VAT_PERCENT}% 的荷兰增值税。完整价目请见“价格”页面。`,
        rows: [
          [`经济型房源（${cheap.months} 个月）`, eur(cheap.priceEur, L)],
          [`标准型房源（${normal.months} 个月）`, `${tierPrices(normal)}`],
          ['翻译', `每种语言 ${eur(extra('translation').priceEur, L)}`],
          [
            '突出展示',
            `每月 ${eur(extra('category-highlight').priceEur, L)}（至少 ${minMonths} 个月）`,
          ],
        ],
      },
      {
        type: 'prose',
        title: '4. 佣金',
        paragraphs: [
          '只有同时满足以下所有条件时才需支付佣金：已签订书面买卖合同、买家由 FODEL 介绍，且定金已支付。',
          `佣金为净额的 ${COMMISSION.percent}%，最低 ${eur(COMMISSION.minimumEur, L)}，另加 ${COMMISSION.vatPercent}% 的荷兰增值税。`,
          '如果意向买家直接联系卖方，且交易无需我们协助完成，则除房源费用外无需支付任何费用。',
        ],
      },
      {
        type: 'prose',
        title: '5. 撤回房源',
        paragraphs: ['卖方可在到期前撤回房源。在此情况下，已支付的房源费用不予退还。'],
      },
      {
        type: 'prose',
        title: '6. 责任',
        paragraphs: [
          '卖方对房产信息的准确性负责。FODEL 如实转载所提供的信息，不对其准确性承担责任。',
          '本网站上的译文仅供参考；如有争议，以匈牙利语版本为准。',
        ],
      },
      {
        type: 'prose',
        title: '7. 撤销权',
        paragraphs: [
          '身为消费者的卖方对远程合同享有法定撤销权。如果卖方明确要求立即履行，撤销权将按已提供服务的比例相应减少。',
        ],
      },
    ],
  },

  accessibility: {
    metaTitle: '无障碍声明',
    metaDescription: `${SITE_HOST} 的无障碍水平、我们遵循的标准，以及如何向我们反馈。`,
    eyebrow: '无障碍',
    title: '无障碍',
    titleEm: '声明',
    updated,
    notice,
    sections: [
      {
        type: 'prose',
        paragraphs: [
          '我们希望每个人都能使用本网站，包括使用屏幕阅读器、键盘或放大功能的访客。',
          '我们按照 WCAG 2.2 AA 级标准建设本网站。我们的访客中有相当一部分是退休人士，因此文字大小、对比度和键盘操作是我们的优先考虑。',
        ],
      },
      {
        type: 'list',
        title: '已实现的功能',
        items: [
          '所有文字的对比度至少为 4.5:1',
          '完整的键盘操作，并有清晰可见的焦点指示',
          '每个页面顶部都有“跳至内容”链接',
          '所有图片均配有有意义的替代文本',
          '表单字段带有关联标签和文字形式的错误提示',
          '遵循系统的“减少动态效果”设置',
          '不启用 JavaScript 也能正常阅读和使用本网站',
        ],
      },
      {
        type: 'prose',
        title: '已知限制',
        paragraphs: ['对于第三方内容（例如地图服务）的无障碍性，我们无法施加影响。'],
      },
      {
        type: 'prose',
        title: '反馈',
        paragraphs: [
          `如果您遇到障碍，请通过 ${COMPANY.email.primary} 或电话告诉我们。我们会尽快处理反馈。`,
        ],
      },
    ],
  },
} satisfies Record<LegalKey, ContentPageData>;
