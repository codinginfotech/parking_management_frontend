/**
 * Indian digit grouping (1,23,456). Marked as a worklet so Reanimated can run
 * it on the UI thread inside AnimatedNumber.
 */
export function formatINR(value: number): string {
  'worklet';
  const rounded = Math.round(Math.abs(value));
  const raw = rounded.toString();
  let grouped: string;
  if (raw.length <= 3) {
    grouped = raw;
  } else {
    const last3 = raw.slice(-3);
    let rest = raw.slice(0, -3);
    let out = last3;
    while (rest.length > 2) {
      out = `${rest.slice(-2)},${out}`;
      rest = rest.slice(0, -2);
    }
    grouped = rest ? `${rest},${out}` : out;
  }
  return value < 0 ? `-${grouped}` : grouped;
}

export function formatRupees(value: number): string {
  return `₹${formatINR(value)}`;
}
