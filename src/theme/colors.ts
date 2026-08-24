export interface Palette {
  background: string;
  surface: string;
  surfaceHigh: string;
  hairline: string;
  text: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  onAccent: string;
  success: string;
  warning: string;
  danger: string;
  onDanger: string;
  overlay: string;
  skeleton: string;
}

/**
 * Dark is the primary experience — a near-black charcoal with warm white type
 * and a single volt accent. Light mode mirrors the same restraint.
 */
export const darkPalette: Palette = {
  background: '#0B0C0F',
  surface: '#14161A',
  surfaceHigh: '#1D2026',
  hairline: 'rgba(255,255,255,0.08)',
  text: '#F4F2ED',
  textMuted: '#9AA0AA',
  textFaint: '#5D636D',
  accent: '#C9F73A',
  onAccent: '#111308',
  success: '#41D98D',
  warning: '#E8B44C',
  danger: '#F0655C',
  onDanger: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.6)',
  skeleton: 'rgba(255,255,255,0.07)',
};

export const lightPalette: Palette = {
  background: '#FAFAF7',
  surface: '#FFFFFF',
  surfaceHigh: '#EFEFEA',
  hairline: 'rgba(12,14,18,0.10)',
  text: '#15171B',
  textMuted: '#5F6672',
  textFaint: '#9BA1AB',
  accent: '#4A8B0D',
  onAccent: '#FFFFFF',
  success: '#118A54',
  warning: '#9A6A08',
  danger: '#C43D34',
  onDanger: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.35)',
  skeleton: 'rgba(12,14,18,0.06)',
};
