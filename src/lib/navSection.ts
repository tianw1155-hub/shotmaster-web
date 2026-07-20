export type NavSection = 'levels' | 'gallery' | 'community' | 'profile';
export function deriveSection(pathname: string): NavSection {
  if (pathname.startsWith('/gallery')) return 'gallery';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'levels';
}
