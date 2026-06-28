// 全局主题 — 与小程序 CSS 变量保持一致
export const colors = {
  // 背景层
  bg:       '#101415',
  bgCard:   '#1a1f22',
  bgDark:   '#0b0f10',

  // 品牌色
  cyan:     '#00f1fe',
  purple:   '#d0bcff',
  cyanDim:  'rgba(0, 241, 254, 0.08)',
  purpleDim:'rgba(208, 188, 255, 0.08)',

  // 边框
  borderCyan:   'rgba(0, 241, 254, 0.15)',
  borderPurple: 'rgba(208, 188, 255, 0.12)',

  // 文字
  textPrimary: '#e8ebed',
  textMuted:   '#8899aa',
  textDim:     '#556677',
  white:       '#ffffff',
};

export const typography = {
  fontFamily: undefined,           // 系统默认，iOS SF Pro / Android Roboto
  fontFamilyMono: 'Courier New',

  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  32,
  hero: 48,
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:  6,
  md:  12,
  lg:  20,
  full: 999,
};

export const shadow = {
  cyan: {
    shadowColor: '#00f1fe',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default { colors, typography, spacing, radius, shadow };
