const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
const SYMBOLS = '!@#$%*?';

/**
 * Readable random password for new staff (no 0/O, 1/l/I), always with
 * upper, lower, digit and symbol. Uses the browser's CSPRNG.
 */
export function generatePassword(length = 12): string {
  const random = (max: number) => crypto.getRandomValues(new Uint32Array(1))[0] % max;
  const pick = (chars: string) => chars[random(chars.length)];

  const required = [pick('ABCDEFGHJKLMNPQRSTUVWXYZ'), pick('abcdefghijkmnpqrstuvwxyz'), pick('23456789'), pick(SYMBOLS)];
  const rest = Array.from({ length: Math.max(0, length - required.length) }, () => pick(ALPHABET));
  const chars = [...required, ...rest];

  // Fisher–Yates shuffle so the required characters are not always first
  for (let i = chars.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}
