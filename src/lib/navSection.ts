export type NavSection = 'levels' | 'gallery' | 'community' | 'learn' | 'profile';
export function deriveSection(pathname: string): NavSection {
  if (pathname.startsWith('/gallery')) return 'gallery';
  if (pathname.startsWith('/community')) return 'community';
  if (pathname.startsWith('/learn')) return 'learn';
  if (pathname.startsWith('/profile')) return 'profile';
  return 'levels';
}
