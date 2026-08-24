import { Platform } from 'react-native';

/**
 * Gilroy is the product typeface. The five weights are bundled natively from
 * assets/fonts (linked via react-native.config.js — see assets/fonts/README.md
 * for licensing notes). If the files are ever removed, set GILROY_ENABLED to
 * false and the app falls back to platform system fonts with matching weights.
 */
export const GILROY_ENABLED = true;

export type FontWeightToken = 'regular' | 'medium' | 'semibold' | 'bold' | 'extrabold';

interface FontStyle {
  fontFamily?: string;
  fontWeight?: '400' | '500' | '600' | '700' | '800';
}

const gilroyFamilies: Record<FontWeightToken, string> = {
  regular: 'Gilroy-Regular',
  medium: 'Gilroy-Medium',
  semibold: 'Gilroy-SemiBold',
  bold: 'Gilroy-Bold',
  extrabold: 'Gilroy-ExtraBold',
};

const systemWeights: Record<FontWeightToken, FontStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

export function font(weight: FontWeightToken): FontStyle {
  if (GILROY_ENABLED) {
    return { fontFamily: gilroyFamilies[weight] };
  }
  if (Platform.OS === 'android') {
    const family =
      weight === 'regular'
        ? 'sans-serif'
        : weight === 'medium' || weight === 'semibold'
          ? 'sans-serif-medium'
          : 'sans-serif';
    return { fontFamily: family, fontWeight: systemWeights[weight] };
  }
  return { fontWeight: systemWeights[weight] };
}
