import type { ValidationCopy } from './types.ts';

const eg = (example?: string) => (example ? `，例如 ${example}` : '');

export const copy: ValidationCopy = {
  numberTag: 'zh-Hans-CN',
  // Country name before the noun ("有效的匈牙利电话号码").
  adjective: {
    HU: '匈牙利', NL: '荷兰', BE: '比利时', DE: '德国', AT: '奥地利', GB: '英国', FR: '法国', CH: '瑞士',
    SK: '斯洛伐克', RO: '罗马尼亚', HR: '克罗地亚', SI: '斯洛文尼亚', LU: '卢森堡', DK: '丹麦', ES: '西班牙', IT: '意大利',
    PL: '波兰', CZ: '捷克',
  },
  required: '请填写此字段。',
  email: '请输入有效的电子邮箱地址，例如 name@example.com。',
  phone: (adjective, example) => `请输入有效的${adjective ?? ''}电话号码${eg(example)}。`,
  postcode: (example) => `请输入有效的邮政编码${eg(example)}。`,
  number: '请仅输入数字，例如 120。',
  min: (limit) => `至少为 ${limit}。`,
  max: (limit) => `不超过 ${limit}。`,
  url: '请输入完整的网址，例如 https://www.youtube.com/…',
  tooLong: (limit) => `不超过 ${limit} 个字符。`,
  minLength: (limit) => `至少 ${limit} 个字符。`,
  consent: '请接受隐私声明后继续。',
  selfReferral: '您不能推荐自己：请输入其他电子邮箱地址。',
  choose: '请从列表中选择。',
  contact: (kind, match) => (kind === 'email' ? `文字中不得包含电子邮箱地址（“${match}”）。买家会通过 FINDDOME 联系您。` : kind === 'phone' ? `文字中不得包含电话号码（“${match}”）。买家会通过 FINDDOME 联系您。` : `文字中不得包含网站、社交媒体或即时通讯联系方式（“${match}”）。`),
  summary: (count) => (count === 1 ? '还有 1 个字段需要检查：' : `还有 ${count} 个字段需要检查：`),
};
