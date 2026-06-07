/**
 * Normalize Israeli phone input to the local 0-prefixed format.
 *
 * Browsers / Google autofill often write Israeli numbers in international
 * format ("+972 50 123 4567"), but the lead form validates `/^0\d{8,9}$/`,
 * so we transparently rewrite international prefixes to the local "0".
 *
 * Examples:
 *   "+972501234567"   -> "0501234567"
 *   "+972 50 123-4567" -> "0501234567"
 *   "00972501234567"  -> "0501234567"
 *   "972501234567"    -> "0501234567"
 *   "050-123-4567"    -> "0501234567"
 *   "0501234567"      -> "0501234567"
 */
export function normalizeIsraeliPhone(input: string): string {
  if (!input) return "";
  // Strip everything that isn't a digit or a leading '+'.
  let s = input.replace(/[^\d+]/g, "");
  // Drop a stray '+' anywhere past position 0.
  s = s[0] === "+" ? "+" + s.slice(1).replace(/\+/g, "") : s.replace(/\+/g, "");
  // International forms -> local.
  if (s.startsWith("+972")) s = "0" + s.slice(4);
  else if (s.startsWith("00972")) s = "0" + s.slice(5);
  else if (s.startsWith("972")) s = "0" + s.slice(3);
  return s;
}
