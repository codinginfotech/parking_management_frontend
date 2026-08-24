/** Normalizes a plate for API calls and comparisons: "mp 04-ab 1234" -> "MP04AB1234". */
export function normalizePlate(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

const STANDARD_PLATE = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
const BH_SERIES_PLATE = /^\d{2}BH\d{4}[A-Z]{1,2}$/;

export function isCompletePlate(input: string): boolean {
  const value = normalizePlate(input);
  return STANDARD_PLATE.test(value) || BH_SERIES_PLATE.test(value);
}

/**
 * Progressive formatter for Indian plates, safe to run on every keystroke.
 * Standard series:  SS NN L(LL) NNNN  ->  "MP 04 AB 1234"
 * Bharat series:    NN BH NNNN LL     ->  "22 BH 1234 AB"
 */
export function formatPlateInput(raw: string): string {
  const value = normalizePlate(raw).slice(0, 11);
  if (value.length === 0) return '';

  const first = value[0] as string;
  const segments: string[] = [];

  if (/\d/.test(first)) {
    // Bharat series: digits(2) letters(2, "BH") digits(4) letters(2)
    const groups = [
      { pattern: /\d/, max: 2 },
      { pattern: /[A-Z]/, max: 2 },
      { pattern: /\d/, max: 4 },
      { pattern: /[A-Z]/, max: 2 },
    ];
    let index = 0;
    for (const group of groups) {
      let segment = '';
      while (
        index < value.length &&
        segment.length < group.max &&
        group.pattern.test(value[index] as string)
      ) {
        segment += value[index];
        index += 1;
      }
      if (segment) segments.push(segment);
      if (index >= value.length) break;
    }
    if (index < value.length) segments.push(value.slice(index));
  } else {
    // Standard series: letters(2) digits(2) letters(3) digits(4)
    const groups = [
      { pattern: /[A-Z]/, max: 2 },
      { pattern: /\d/, max: 2 },
      { pattern: /[A-Z]/, max: 3 },
      { pattern: /\d/, max: 4 },
    ];
    let index = 0;
    for (const group of groups) {
      let segment = '';
      while (
        index < value.length &&
        segment.length < group.max &&
        group.pattern.test(value[index] as string)
      ) {
        segment += value[index];
        index += 1;
      }
      if (segment) segments.push(segment);
      // A digit group may end early when the next letter group begins, but if
      // the character neither fits this group nor starts the next, stop cleanly.
      if (index >= value.length) break;
    }
    if (index < value.length) segments.push(value.slice(index));
  }

  return segments.join(' ');
}
