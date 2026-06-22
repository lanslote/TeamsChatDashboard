export interface IAvatarColor {
  bg: string;
  fg: string;
}

export const AVATAR_PALETTE: IAvatarColor[] = [
  { bg: '#ECE9FE', fg: '#7C6CF0' },
  { bg: '#E1F0FF', fg: '#3B9EF5' },
  { bg: '#DCF5E9', fg: '#2FB57E' },
  { bg: '#FDE5EE', fg: '#EC5C86' },
  { bg: '#FCEFD6', fg: '#D99633' },
  { bg: '#E7ECF6', fg: '#6B7895' }
];

export function avatarColor(colorKey: number): IAvatarColor {
  const idx = ((colorKey % AVATAR_PALETTE.length) + AVATAR_PALETTE.length) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[idx];
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function colorKeyFor(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function stripHtml(html: string): string {
  if (!html) {
    return '';
  }
  const tmp: HTMLDivElement = document.createElement('div');
  tmp.innerHTML = html;
  const text: string = tmp.textContent || tmp.innerText || '';
  return text.replace(/\s+/g, ' ').trim();
}

export function avatarText(title: string): string {
  const trimmed: string = (title || '').trim();
  if (!trimmed) {
    return '?';
  }
  const token: string = trimmed.split(/\s+/)[0] || trimmed;
  const latin: RegExpMatchArray | null = token.match(/^[A-Za-z0-9]+/);
  if (latin) {
    return latin[0].slice(0, 4);
  }
  return token.slice(0, 2);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(iso?: string): boolean {
  if (!iso) {
    return false;
  }
  const d: Date = new Date(iso);
  if (isNaN(d.getTime())) {
    return false;
  }
  return isSameDay(d, new Date());
}

export function formatChatTime(iso?: string): string {
  if (!iso) {
    return '';
  }
  const d: Date = new Date(iso);
  if (isNaN(d.getTime())) {
    return '';
  }
  const now: Date = new Date();
  if (isSameDay(d, now)) {
    let h: number = d.getHours();
    const m: string = pad2(d.getMinutes());
    const ampm: string = h < 12 ? '오전' : '오후';
    h = h % 12;
    if (h === 0) {
      h = 12;
    }
    return `${ampm} ${h}:${m}`;
  }
  const mm: string = pad2(d.getMonth() + 1);
  const dd: string = pad2(d.getDate());
  return `${mm}-${dd}`;
}
