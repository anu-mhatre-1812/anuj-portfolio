export const ACCENTS = ['#FF6F5E', '#C9E8FF', '#FFD23F', '#FF9933'] as const;

export function accentFor(index: number): string {
  return ACCENTS[index % ACCENTS.length];
}

export const GITHUB_URL = 'https://github.com/a18-n03';

export const SOCIALS = [
  { label: 'GitHub', href: GITHUB_URL, handle: '@a18-n03' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/anuj-mhatre-031807ma', handle: 'anuj-mhatre-031807ma' },
  { label: 'Instagram', href: 'https://www.instagram.com/anu__m.1812', handle: '@anu__m.1812' },
  { label: 'X', href: 'https://x.com/MhatreAnuj1814', handle: '@MhatreAnuj1814' },
  { label: 'Email', href: 'mailto:anujmhatre125@gmail.com', handle: 'anujmhatre125@gmail.com' },
  { label: 'Discord', href: 'https://discord.com/users/anujmhatre_2007_17621', handle: 'anujmhatre_2007' },
] as const;

export const CONTRAST_LEVELS = [
  '#EFE7D3',
  '#FFE3B8',
  '#FFC97A',
  '#FFAB47',
  '#FF9933',
] as const;

export function levelColor(count: number): string {
  if (count <= 0) return CONTRAST_LEVELS[0];
  if (count <= 2) return CONTRAST_LEVELS[1];
  if (count <= 4) return CONTRAST_LEVELS[2];
  if (count <= 6) return CONTRAST_LEVELS[3];
  return CONTRAST_LEVELS[4];
}
