
export enum TileSize {
  SMALL = 'small', // 1x1
  MEDIUM = 'medium', // 2x2
  WIDE = 'wide', // 4x2
}

export type SearchEngine = 'lumia' | 'google' | 'bing' | 'duckduckgo';

export interface LiveTileData {
  id: string;
  title: string;
  url: string;
  color: string;
  size: TileSize;
  content?: string;
  icon?: string;
  isSystem?: boolean;
}

export interface NewsItem {
  title: string;
  source: string;
}

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface BrowserHistoryItem {
  url: string;
  title: string;
  timestamp: number;
}
