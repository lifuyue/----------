<template>
  <view class="map-page">
    <view class="map-page__filters">
      <scroll-view scroll-x class="map-page__chips">
        <view
          class="chip"
          :class="{ 'chip--active': !activeCategory }"
          @tap="selectCategory()"
        >
          全部
        </view>
        <view
          v-for="category in categories"
          :key="category"
          class="chip"
          :class="{ 'chip--active': activeCategory === category }"
          @tap="selectCategory(category)"
        >
          {{ category }}
        </view>
      </scroll-view>
      <scroll-view scroll-x class="map-page__chips">
        <view
          class="chip chip--outline"
          :class="{ 'chip--active': !activeTag }"
          @tap="selectTag()"
        >
          全部标签
        </view>
        <view
          v-for="tag in tags"
          :key="tag"
          class="chip chip--outline"
          :class="{ 'chip--active': activeTag === tag }"
          @tap="selectTag(tag)"
        >
          #{{ tag }}
        </view>
      </scroll-view>
    </view>

    <map
      class="map-page__map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="scale"
      :markers="markers"
      @markertap="handleMarkerTap"
    />

    <view v-if="activeSite" class="map-page__sheet">
      <view class="map-page__sheet-header">
        <view class="map-page__sheet-meta">
          <text class="map-page__sheet-title">{{ activeSite.name.zh }}</text>
          <text class="map-page__sheet-subtitle">{{ activeSite.name.en }}</text>
        </view>
        <view class="map-page__sheet-tag">{{ activeSite.category }}</view>
      </view>
      <text class="map-page__sheet-summary">{{ activeSite.summary.zh }}</text>
      <view class="map-page__sheet-actions">
        <button class="map-page__sheet-button" @tap="openSiteDetail">查看详情</button>
      </view>
    </view>
    <MiniPlayerBar />
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { onShow } from '@dcloudio/uni-app';
import MiniPlayerBar from '@/components/MiniPlayerBar.vue';
import { useContentStore } from '@/stores/content';
import type { Site } from '@/types/content';

const DEFAULT_CENTER = {
  latitude: 31.62791,
  longitude: 119.55104,
};

const contentStore = useContentStore();
const { categories } = storeToRefs(contentStore);

const activeCategory = ref<string | undefined>();
const activeTag = ref<string | undefined>();
const activeSiteId = ref<string | undefined>();
const scale = ref(12);

const tags = computed(() => {
  const unique = new Set<string>();
  contentStore.state.sites.forEach((site) => site.tags.forEach((tag) => unique.add(tag)));
  return Array.from(unique);
});

const filteredSites = computed<Site[]>(() =>
  contentStore.state.sites.filter((site) => {
    const matchCategory = activeCategory.value ? site.category === activeCategory.value : true;
    const matchTag = activeTag.value ? site.tags.includes(activeTag.value) : true;
    return matchCategory && matchTag && Boolean(site.geo.lat && site.geo.lng);
  }),
);

const markers = computed<UniApp.Marker[]>(() =>
  filteredSites.value.map((site) => ({
    id: site.id,
    latitude: site.geo.lat as number,
    longitude: site.geo.lng as number,
    iconPath: '/static/logo.png',
    width: 40,
    height: 40,
    callout: {
      content: site.name.zh,
      color: '#ffffff',
      fontSize: 12,
      borderRadius: 12,
      bgColor: '#1d4ed8',
      padding: 6,
      display: 'BYCLICK',
    },
  })),
);

const activeSite = computed<Site | undefined>(() => {
  if (!activeSiteId.value) return undefined;
  return contentStore.getSiteById(activeSiteId.value);
});

const mapCenter = computed(() => {
  if (activeSite.value && activeSite.value.geo.lat && activeSite.value.geo.lng) {
    return {
      latitude: activeSite.value.geo.lat,
      longitude: activeSite.value.geo.lng,
    };
  }
  if (filteredSites.value.length) {
    const first = filteredSites.value[0];
    return {
      latitude: first.geo.lat as number,
      longitude: first.geo.lng as number,
    };
  }
  return DEFAULT_CENTER;
});

const selectCategory = (category?: string) => {
  activeCategory.value = category;
};

const selectTag = (tag?: string) => {
  activeTag.value = tag;
};

const handleMarkerTap = (event: UniApp.MapOnMarkerTapEvent) => {
  const id = event.detail.markerId;
  if (typeof id === 'string') {
    activeSiteId.value = id;
    return;
  }
  // 小程序端 markerId 可能为数字，需要转回 string id
  const site = filteredSites.value[id];
  activeSiteId.value = site?.id;
};

const openSiteDetail = () => {
  if (!activeSite.value) return;
  uni.navigateTo({
    url: `/pages/site/detail?id=${activeSite.value.id}`,
  });
};

const syncFocusFromGlobal = () => {
  const app = getApp<{ globalData: { focusSiteId?: string } }>();
  const focusId = app.globalData?.focusSiteId;
  if (focusId) {
    activeSiteId.value = focusId;
    const site = contentStore.getSiteById(focusId);
    if (site?.geo.lat && site.geo.lng) {
      scale.value = 14;
    }
    app.globalData.focusSiteId = undefined;
  }
};

onMounted(() => {
  contentStore.hydrate();
  if (!filteredSites.value.length) {
    activeSiteId.value = undefined;
  }
  syncFocusFromGlobal();
});

onShow(() => {
  syncFocusFromGlobal();
});
</script>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f1f5f9;
  position: relative;
}

.map-page__filters {
  padding: 16rpx 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  background-color: #f8fafc;
  z-index: 10;
}

.map-page__chips {
  display: flex;
  flex-direction: row;
  gap: 16rpx;
  width: 100%;
  white-space: nowrap;
}

.chip {
  padding: 12rpx 28rpx;
  background-color: #2563eb;
  color: #ffffff;
  border-radius: 999rpx;
  font-size: 24rpx;
  margin-right: 16rpx;
}

.chip--outline {
  background-color: #e2e8f0;
  color: #1d4ed8;
}

.chip--active {
  background-color: #1d4ed8;
  color: #ffffff;
}

.map-page__map {
  flex: 1;
  width: 100%;
}

.map-page__sheet {
  position: absolute;
  left: 24rpx;
  right: 24rpx;
  bottom: calc(env(safe-area-inset-bottom) + 120rpx);
  background-color: #ffffff;
  border-radius: 28rpx;
  padding: 24rpx;
  box-shadow: 0 16rpx 40rpx rgba(15, 23, 42, 0.18);
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.map-page__sheet-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.map-page__sheet-meta {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.map-page__sheet-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #0f172a;
}

.map-page__sheet-subtitle {
  font-size: 26rpx;
  color: #64748b;
}

.map-page__sheet-tag {
  background-color: #eff6ff;
  color: #1d4ed8;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.map-page__sheet-summary {
  font-size: 26rpx;
  color: #334155;
  line-height: 1.6;
}

.map-page__sheet-actions {
  display: flex;
  justify-content: flex-end;
}

.map-page__sheet-button {
  background-color: #1d4ed8;
  color: #ffffff;
  border-radius: 999rpx;
  padding: 12rpx 36rpx;
  font-size: 26rpx;
}
</style>
