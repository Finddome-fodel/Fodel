/**
 * Simplified Chinese email copy. Type-checked against the Hungarian file
 * (`satisfies PublicEmailCopy`). Polite "您" throughout, full-width
 * punctuation in running text.
 */
import type { PublicEmailCopy } from './hu';
import { SITE_HOST } from '~/config/site.mjs';

export const ZH = {
  common: {
    greeting: (name: string) => `尊敬的 ${name}：`,
    greetingNoName: '尊敬的广告发布者：',
    signOff: '此致\nFINDDOME 房产',
    questions: '如有任何问题，直接回复此邮件即可。',
    linkFallback: '如果按钮无法使用，请将以下地址复制到浏览器中：',
  },

  registrationConfirm: {
    subject: '设置密码 | FINDDOME',
    preheader: '只需一次点击，即可开始撰写房源信息。',
    heading: '设置密码',
    intro: '感谢您的注册。您的账户即将就绪，只差设置密码。',
    cta: '设置密码',
    next: '之后您可以立即继续完善房源信息：套餐、资料、照片。只有在您提交之后，我们才会进行审核。',
    expiry: '链接有效期为 7 天。如果您并未注册，请忽略此邮件：账户不会被创建。',
  },

  accountExists: {
    subject: '您已有 FINDDOME 账户',
    preheader: '请登录或设置新密码。',
    heading: '此邮箱已注册账户',
    body: '刚刚有人尝试使用此邮箱地址注册 FINDDOME 网站。由于该地址已有账户，我们未创建新账户。',
    cta: '登录',
    reset: '忘记密码？申请新密码',
    ignore: '如果这不是您本人操作，则无需任何处理：您的账户未发生任何变化。',
  },

  invite: {
    subject: 'FINDDOME 门户邀请',
    preheader: '设置密码并登录广告发布者门户。',
    heading: '您已受邀加入 FINDDOME 门户',
    body: (role: string) =>
      `FINDDOME 邀请您${role}加入用于管理房产广告的门户。`,
    roleAdmin: '以管理员身份',
    roleOwner: '以广告发布者身份',
    cta: '接受邀请',
    expiry: '链接有效期为 7 天，且仅可使用一次。',
  },

  welcome: {
    subject: '欢迎使用 FINDDOME 门户',
    preheader: '您的账户已激活。以下是发布第一条房源的方法。',
    heading: (name: string) => `欢迎您，${name}`,
    body: '您的账户已激活。您可以在门户中撰写房源信息、上传照片并跟踪审核进度。',
    stepsTitle: '您需要准备',
    steps: [
      '房产照片：至少一张，越多越好',
      '基本信息：居住面积、土地面积、要价',
      '几句话介绍这处房产的独特之处',
    ],
    cta: '前往门户',
  },

  submissionReceived: {
    subject: (ref: string) => `我们已收到您的房源（#${ref}）`,
    preheader: '我们将进行审核，并通过邮件通知您。',
    heading: '您的房源已收到',
    body: (title: string, ref: string) =>
      `我们已收到您的房源“${title}”（#${ref}）。我们的团队成员将进行审核，一旦有结果，我们会立即通过邮件通知您。`,
    timing: '审核通常不超过两个工作日。',
    note: '审核期间无法编辑房源。如果我们要求修改，房源将立即重新开放编辑。',
  },

  changesRequested: {
    subject: (ref: string) => `需要修改（#${ref}）`,
    preheader: '只需一处小修改，房源即可发布。',
    heading: '请您进行修改',
    body: (title: string, ref: string) =>
      `我们的团队对您的房源“${title}”（#${ref}）有以下意见：`,
    after: '房源已重新开放编辑。请完成修改后再次提交，流程将从原处继续。',
    cta: '编辑房源',
  },

  approvedAwaitingPayment: {
    subject: (ref: string) => `已通过审核（#${ref}）：仅待付款`,
    preheader: '您的房源已通过审核，款项到账后即会发布。',
    heading: '您的房源已通过审核',
    body: (title: string, ref: string) =>
      `好消息：我们已审核并批准您的房源“${title}”（#${ref}）。现在只差付款。款项到账后，房源将立即上线。`,
    orderTitle: '广告费用',
    discountLabel: '推荐折扣（10%）',
    totalLabel: '应付金额',
    ctaCard: '银行卡支付',
    cardNote: '付款在 Stripe 的安全环境中完成。FINDDOME 不会看到也不会保存您的银行卡信息。',
    bankTitle: '或银行转账',
    bankNote: (ref: string) =>
      `请在转账附言中填写以下参考编号：${ref}。款项到账后，我们的团队成员将发布房源。`,
    vatNote: '所有金额均含 21% 荷兰增值税。',
  },

  approvedPublished: {
    subject: (ref: string) => `已通过审核并发布（#${ref}）`,
    preheader: '您的房源已上线；请在 14 天内支付广告费用。',
    heading: '您的房源已上线',
    body: (title: string, ref: string) => `我们已批准房源“${title}”（#${ref}），并已立即发布。`,
    viewCta: '查看房源',
    orderTitle: '广告费用',
    discountLabel: '推荐折扣（10%）',
    totalLabel: '应付金额',
    dueLabel: '付款截止日期',
    ctaCard: '银行卡支付',
    cardNote: '付款在 Stripe 的安全环境中完成。FINDDOME 不会看到也不会保存您的银行卡信息。',
    bankTitle: '银行转账',
    bankNote: (ref: string) => `请在转账附言中填写以下参考编号：${ref}。`,
    vatNote: '所有金额均含 21% 荷兰增值税。',
  },

  paymentReceipt: {
    subject: (ref: string) => `付款确认（#${ref}）`,
    preheader: '谢谢，我们已收到您的付款。',
    heading: '谢谢，您的付款已到账',
    body: (title: string, ref: string) =>
      `我们已收到房源“${title}”（#${ref}）的付款。房源已上线，可在 ${SITE_HOST} 查看。`,
    orderTitle: '明细',
    discountLabel: '推荐折扣（10%）',
    totalLabel: '已付金额',
    vatNote: '金额已含 21% 荷兰增值税。发票将通过另一封邮件发送给您。',
    paidAtLabel: '付款日期',
  },

  published: {
    subject: (ref: string) => `您的房源已上线（#${ref}）`,
    preheader: `房源现已在 ${SITE_HOST} 上线。`,
    heading: '您的房源已上线',
    body: (title: string, ref: string) =>
      `您的房源“${title}”（#${ref}）已在 ${SITE_HOST} 上线，可触达八个国家的买家。`,
    cta: '查看房源',
    next: '一旦有人感兴趣，我们会立即通过邮件将其联系方式发送给您。您随时可以在门户中查看房源状态。',
  },
  approvedFree: {
    subject: (ref: string) => `您的房源已免费通过审核（#${ref}）`,
    preheader: `房源现已在 ${SITE_HOST} 上线，您无需支付任何费用。`,
    heading: '您的房源已免费上线',
    body: (title: string, ref: string) =>
      `我们已批准您的房源“${title}”（#${ref}），现已在 ${SITE_HOST} 上线。本次发布不收取费用，因此您无需进行任何操作。`,
    waived: '因此，我们之前发送给您的付款请求已作废；请勿支付。',
    cta: '查看房源',
    next: '一旦有人感兴趣，我们会立即通过邮件将其联系方式发送给您。您随时可以在门户中查看房源状态。',
  },

  newEnquiry: {
    subject: (ref: string) => `新咨询（#${ref}）`,
    preheader: '有人对您的房产感兴趣。',
    heading: '您的房源收到新回复',
    body: (title: string, ref: string) =>
      `有人回复了您的房源“${title}”（#${ref}）：`,
    labels: { name: '姓名', email: '邮箱', phone: '电话' },
    messageTitle: '留言',
    advice: '如有可能，请在两天内联系对方：快速回复是促成交易最重要的因素。',
  },

  passwordReset: {
    subject: '重置密码 | FINDDOME 门户',
    preheader: '链接有效期为一小时。',
    heading: '重置密码',
    body: '我们收到了重置您 FINDDOME 门户账户密码的请求。请点击下方按钮设置新密码。',
    cta: '设置新密码',
    expiry: '链接有效期为一小时，且仅可使用一次。',
    ignore: '如果这不是您本人申请的，请忽略此邮件。您的密码不会改变，也不会发生任何事情。',
  },

  referralRegistered: {
    subject: '我们已收到您的推荐 | FINDDOME',
    preheader: '我们的团队成员将很快联系您推荐的人。',
    heading: '感谢您的推荐',
    body: (referredName: string) =>
      `我们已收到联系方式：${referredName}。我们的团队成员将与其联系；房源发布后，我们将为您的下一条房源提供 10% 的广告费折扣。`,
    note: '折扣在广告发布者付款后手动记入。一旦可以记入，我们会通知您。',
  },

  valuationReceived: {
    heading: '我们已收到您的估价申请',
    body: '我们的团队成员将核查房产资料和数据库，然后通过邮件向您发送基于市场的参考估价。',
  },

  valuationReady: {
    subject: '您的估价已完成 | FINDDOME',
    preheader: '我们已为您的房产估算出参考价值。',
    heading: '您的估价已完成',
    body: (range: string) =>
      `根据您提供的信息及可比房产，我们的参考估价为：${range}。`,
    disclaimerWithCount: (n: number) =>
      `本估价仅供参考，并非评估报告，也不能替代正式评估。估价基于 ${n} 套可比房产。`,
    disclaimer:
      '本估价仅供参考，并非评估报告，也不能替代正式评估。',
    cta: '立即发布房源',
    ctaUrl: 'submitAd',
    introWithBasis: (range: string) => `根据您提供的信息，基于市场的参考价值为：${range}。`,
    mid: '中间值',
    basis: '数据库',
    rateDate: '汇率日期',
    source: '来源',
    factorsHeading: '影响因素',
    dirPlus: '提升价值',
    dirMinus: '降低价值',
    dirUnsure: '不确定',
    visit: '预约 Gábor 上门',
    judicial: '申请正式评估',
  },

  valuationDeclined: {
    subject: '您的估价申请 | FINDDOME',
    preheader: '我们的团队成员将亲自与您联系。',
    heading: '感谢您的申请',
    body: '根据您提供的信息，我们目前没有足够的可比房产来给出可靠的估价。我们的团队成员将亲自与您联系。',
  },

  valuationNeedsInfo: {
    subject: '估价：我们还需要一些信息',
    preheader: '为完成估价，我们还需要更多信息。',
    heading: '我们还需要一些信息',
    body: '感谢您的估价申请。为完成估价，我们的团队成员请您提供以下信息：',
    after: '请直接回复此邮件发送所缺信息。收到后，我们将立即为您估价。',
  },

  rejected: {
    subject: (ref: string) => `您的房源无法发布（#${ref}）`,
    preheader: '审核结果及说明。',
    heading: '我们无法发布该房源',
    body: (title: string, ref: string) =>
      `很遗憾，经审核，我们的团队未批准您的房源“${title}”（#${ref}）。说明如下：`,
    refund: '如果您已支付广告费用，我们将另行与您联系办理退款。',
    after: '如有疑问，或您认为存在误解，直接回复此邮件即可。',
  },

  invoiceIssued: {
    subject: (number: string) => `发票编号 ${number}`,
    preheader: '发票已开具，可通过链接查看或下载。',
    heading: '您的发票已开具',
    body: (title: string, ref: string, number: string) =>
      `您的房源“${title}”（#${ref}）的发票（编号 ${number}）已开具。`,
    cta: '查看发票',
  },

  creditNoteIssued: {
    subject: (number: string) => `红字发票编号 ${number}`,
    preheader: '我们已为您之前的发票开具红字发票。',
    heading: '红字发票已开具',
    body: (title: string, ref: string, number: string, correctsNumber: string) =>
      `我们已针对您的房源“${title}”（#${ref}）的发票（编号 ${correctsNumber}）开具红字发票（编号 ${number}）。`,
    cta: '查看红字发票',
  },

  serviceRequested: {
    subject: '我们已收到您的申请 | FINDDOME',
    preheader: '我们的团队成员将与您联系以确定日期。',
    heading: '我们已收到您的申请',
    body: (service: string, price: string) => `谢谢，我们已登记您的申请：${service}（${price}）。`,
    next: '我们的团队成员将与您联系以确定日期。',
    payment: '我们将在确定日期时告知付款方式。您现在无需支付任何费用。',
    cancel: '改变主意了？直接回复此邮件即可。',
  },

  valuationPaid: {
    subject: '付款确认 | FINDDOME 估价',
    preheader: '谢谢，您的付款已到账。',
    heading: '谢谢，您的付款已到账',
    body: (service: string) => `我们已收到“${service}”服务的付款。`,
    orderTitle: '项目',
    totalLabel: '已付金额',
    paidAtLabel: '付款日期',
    next: '我们的团队成员将很快与您联系，商讨后续步骤。',
    invoice: '需要发票？直接回复此邮件即可。',
  },

  judicialRequested: {
    subject: '正式评估申请 | FINDDOME',
    preheader: '我们的团队成员将与您联系，介绍可选方案。',
    heading: '我们已收到您的申请',
    body: '谢谢，我们已登记您希望由专家进行正式（司法）评估。这与我们网站上基于市场的参考估价不同：正式评估由具备资质的评估师根据报价进行。',
    next: '我们的团队成员将与您联系，介绍可选方案和报价。',
  },
} satisfies PublicEmailCopy;
