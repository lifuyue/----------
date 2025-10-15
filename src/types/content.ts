export type MediaType = 'image' | 'audio';

export interface LocalizedText {
  zh: string;
  en: string;
}

export interface MediaItem {
  type: MediaType;
  src: string;
  caption?: string;
}

export interface SourceLink {
  title: string;
  url: string;
}

export interface GeoLocation {
  lat?: number;
  lng?: number;
  address?: string;
}

export interface BaseContent {
  id: string;
  name: LocalizedText;
  pinyin?: string;
  location?: {
    lat: number;
    lng: number;
  };
  tags: string[];
  summary: LocalizedText;
  background: LocalizedText;
  media: MediaItem[];
  sources: SourceLink[];
  updatedAt: string;
}

export interface Term extends BaseContent {
  category?: string;
}

export interface Site extends BaseContent {
  category: string;
  geo: GeoLocation;
  termId?: string;
}

export interface ContentState {
  sites: Site[];
  terms: Term[];
  loaded: boolean;
  lastUpdatedAt?: string;
}

export interface PlayerState {
  currentSource?: string;
  currentTitle?: string;
  isPlaying: boolean;
  playbackRate: number;
  duration: number;
  currentTime: number;
}
