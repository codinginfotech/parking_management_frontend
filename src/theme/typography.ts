import { TextStyle } from 'react-native';
import { font } from './fonts';

/**
 * Typography carries the visual identity — large confident headings, tabular
 * numerals for money and counts, quiet uppercase labels for structure.
 */
export const typography = {
  display: {
    fontSize: 42,
    lineHeight: 48,
    letterSpacing: -1.2,
    ...font('extrabold'),
  },
  heroNumber: {
    fontSize: 80,
    lineHeight: 86,
    letterSpacing: -2.5,
    fontVariant: ['tabular-nums'],
    ...font('extrabold'),
  },
  headingXL: {
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.6,
    ...font('bold'),
  },
  headingL: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.3,
    ...font('semibold'),
  },
  headingM: {
    fontSize: 17,
    lineHeight: 24,
    ...font('semibold'),
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    ...font('regular'),
  },
  bodyMedium: {
    fontSize: 15,
    lineHeight: 22,
    ...font('medium'),
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 18,
    ...font('regular'),
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    ...font('semibold'),
  },
  numeric: {
    fontSize: 17,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
    ...font('semibold'),
  },
  numericL: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
    ...font('bold'),
  },
  plate: {
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
    ...font('bold'),
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
