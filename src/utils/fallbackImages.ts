import { ImageCategory } from '../types';

const baseUrl = '/images/levels';

export const fallbackImagePool: Record<ImageCategory, string[]> = {
  composition: [
    `${baseUrl}/level1.jpg`,
    `${baseUrl}/level2.jpg`,
    `${baseUrl}/level3.jpg`,
    `${baseUrl}/level4.jpg`,
    `${baseUrl}/level5.jpg`,
    `${baseUrl}/level6.jpg`,
    `${baseUrl}/level7.jpg`,
    `${baseUrl}/level8.jpg`,
  ],
  light: [
    `${baseUrl}/level9.jpg`,
    `${baseUrl}/level10.jpg`,
    `${baseUrl}/level11.jpg`,
    `${baseUrl}/level12.jpg`,
    `${baseUrl}/level13.jpg`,
    `${baseUrl}/level14.jpg`,
    `${baseUrl}/level15.jpg`,
    `${baseUrl}/level16.jpg`,
  ],
  color: [
    `${baseUrl}/level17.jpg`,
    `${baseUrl}/level18.jpg`,
    `${baseUrl}/level19.jpg`,
    `${baseUrl}/level20.jpg`,
    `${baseUrl}/level21.jpg`,
    `${baseUrl}/level22.jpg`,
    `${baseUrl}/level23.jpg`,
    `${baseUrl}/level24.jpg`,
  ],
  portrait: [
    `${baseUrl}/level25.jpg`,
    `${baseUrl}/level26.jpg`,
    `${baseUrl}/level27.jpg`,
    `${baseUrl}/level28.jpg`,
    `${baseUrl}/level29.jpg`,
    `${baseUrl}/level30.jpg`,
    `${baseUrl}/level31.jpg`,
    `${baseUrl}/level32.jpg`,
  ],
  landscape: [
    `${baseUrl}/level33.jpg`,
    `${baseUrl}/level34.jpg`,
    `${baseUrl}/level35.jpg`,
    `${baseUrl}/level36.jpg`,
    `${baseUrl}/level37.jpg`,
    `${baseUrl}/level38.jpg`,
    `${baseUrl}/level39.jpg`,
    `${baseUrl}/level40.jpg`,
  ],
  still: [
    `${baseUrl}/level41.jpg`,
    `${baseUrl}/level42.jpg`,
    `${baseUrl}/level43.jpg`,
    `${baseUrl}/level44.jpg`,
    `${baseUrl}/level45.jpg`,
    `${baseUrl}/level46.jpg`,
    `${baseUrl}/level47.jpg`,
    `${baseUrl}/level48.jpg`,
  ],
  street: [
    `${baseUrl}/level49.jpg`,
    `${baseUrl}/level50.jpg`,
    `${baseUrl}/level1.jpg`,
    `${baseUrl}/level10.jpg`,
    `${baseUrl}/level20.jpg`,
    `${baseUrl}/level30.jpg`,
    `${baseUrl}/level40.jpg`,
    `${baseUrl}/level5.jpg`,
  ],
};

export function getFallbackImage(category?: string, seed?: string): string {
  const cat = (category || 'landscape') as ImageCategory;
  const pool = fallbackImagePool[cat] || fallbackImagePool.landscape;
  if (pool.length === 0) return `${baseUrl}/level1.jpg`;
  
  let hash = 0;
  const seedStr = seed || Math.random().toString();
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  return pool[hash % pool.length];
}
