import { computed, reactive } from 'vue';
import { defineStore } from 'pinia';
import type { ContentState, Site, Term } from '../types/content';
import rawSites from '../data/sites.json';
import rawTerms from '../data/terms.json';

const STORAGE_VERSION_KEY = 'changdang-content-version';
const STORAGE_SITES_KEY = 'changdang-sites';
const STORAGE_TERMS_KEY = 'changdang-terms';

const staticSites = rawSites as Site[];
const staticTerms = rawTerms as Term[];

const collectLastUpdated = (sites: Site[], terms: Term[]): string => {
  const timestamps = [...sites, ...terms].map((item) => new Date(item.updatedAt).getTime());
  const validTimes = timestamps.filter((value) => !Number.isNaN(value));
  if (!validTimes.length) {
    return new Date().toISOString();
  }
  return new Date(Math.max(...validTimes)).toISOString();
};

const staticVersion = collectLastUpdated(staticSites, staticTerms);

export const useContentStore = defineStore('content', () => {
  const state = reactive<ContentState>({
    sites: [],
    terms: [],
    loaded: false,
    lastUpdatedAt: undefined,
  });

  const loadFromStorage = (): void => {
    try {
      const cachedVersion = uni.getStorageSync(STORAGE_VERSION_KEY) as string | undefined;
      const cachedSites = uni.getStorageSync(STORAGE_SITES_KEY) as Site[] | undefined;
      const cachedTerms = uni.getStorageSync(STORAGE_TERMS_KEY) as Term[] | undefined;
      if (cachedVersion && cachedVersion === staticVersion && cachedSites && cachedTerms) {
        state.sites = cachedSites;
        state.terms = cachedTerms;
        state.lastUpdatedAt = cachedVersion;
        state.loaded = true;
      }
    } catch (error) {
      console.warn('[content-store] loadFromStorage error', error);
    }
  };

  const cacheToStorage = (): void => {
    try {
      uni.setStorageSync(STORAGE_VERSION_KEY, staticVersion);
      uni.setStorageSync(STORAGE_SITES_KEY, state.sites);
      uni.setStorageSync(STORAGE_TERMS_KEY, state.terms);
    } catch (error) {
      console.warn('[content-store] cacheToStorage error', error);
    }
  };

  const hydrate = (force = false): void => {
    if (state.loaded && !force) {
      return;
    }
    if (!force) {
      loadFromStorage();
    }
    if (!state.loaded || force) {
      state.sites = staticSites;
      state.terms = staticTerms;
      state.lastUpdatedAt = staticVersion;
      state.loaded = true;
      cacheToStorage();
    }
  };

  const categories = computed(() => {
    const entries = new Set<string>();
    state.sites.forEach((site) => entries.add(site.category));
    return Array.from(entries);
  });

  const tagCloud = computed(() => {
    const counts = new Map<string, number>();
    state.terms.forEach((term) => {
      term.tags.forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1));
    });
    return counts;
  });

  const getTermById = (termId: string): Term | undefined =>
    state.terms.find((term) => term.id === termId);

  const getSiteById = (siteId: string): Site | undefined =>
    state.sites.find((site) => site.id === siteId);

  const getRelatedTerms = (tagList: string[], excludeId?: string): Term[] =>
    state.terms
      .filter((term) => term.id !== excludeId && term.tags.some((tag) => tagList.includes(tag)))
      .slice(0, 6);

  const getRelatedSites = (tagList: string[], excludeId?: string): Site[] =>
    state.sites
      .filter((site) => site.id !== excludeId && site.tags.some((tag) => tagList.includes(tag)))
      .slice(0, 6);

  return {
    state,
    hydrate,
    categories,
    tagCloud,
    getTermById,
    getSiteById,
    getRelatedTerms,
    getRelatedSites,
  };
});
