
import { TileSize, LiveTileData } from './types';

export const METRO_COLORS = [
  'bg-[#0078d7]', // Blue
  'bg-[#107c10]', // Green
  'bg-[#d13438]', // Red
  'bg-[#008272]', // Cyan
  'bg-[#8661c5]', // Purple
  'bg-[#ff8c00]', // Orange
];

export const INITIAL_TILES: LiveTileData[] = [
  {
    id: 'news',
    title: 'News & Trends',
    url: '',
    color: 'bg-[#0078d7]',
    size: TileSize.WIDE,
    isSystem: true,
    content: 'Fetching latest headlines...',
  },
  {
    id: 'weather',
    title: 'Weather',
    url: '',
    color: 'bg-[#008272]',
    size: TileSize.MEDIUM,
    isSystem: true,
    content: '22°C - Sunny',
    icon: '☀️',
  },
  {
    id: 'store',
    title: 'Store',
    url: '',
    color: 'bg-[#107c10]',
    size: TileSize.MEDIUM,
    isSystem: true,
    icon: '🛍️',
  },
  {
    id: 'google',
    title: 'Google',
    url: 'https://www.google.com',
    color: 'bg-[#d13438]',
    size: TileSize.SMALL,
    icon: 'G',
  },
  {
    id: 'bing',
    title: 'Bing',
    url: 'https://www.bing.com',
    color: 'bg-[#0078d7]',
    size: TileSize.SMALL,
    icon: 'b',
  },
  {
    id: 'github',
    title: 'GitHub',
    url: 'https://github.com',
    color: 'bg-[#333333]',
    size: TileSize.MEDIUM,
    icon: 'Git',
  },
];
