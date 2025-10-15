<template>
  <view class="map-page">
    <map
      class="map-page__map"
      :latitude="mapCenter.latitude"
      :longitude="mapCenter.longitude"
      :scale="scale"
      :markers="markers"
      enable-satellite="false"
      @markertap="handleMarkerTap"
    />

    <scroll-view scroll-y class="map-page__list">
      <text class="map-page__list-title">离线词汇列表</text>
      <view
        v-for="term in terms"
        :key="term.id"
        class="map-page__term-card"
        @tap="openTerm(term.id)"
      >
        <view class="map-page__term-header">
          <text class="map-page__term-name">{{ term.name.zh }}</text>
          <text class="map-page__term-alias">{{ term.name.en }}</text>
        </view>
        <text class="map-page__term-summary">{{ term.summary.zh }}</text>
        <view class="map-page__term-tags">
          <text v-for="tag in term.tags" :key="tag" class="map-page__term-tag">
            #{{ tag }}
          </text>
        </view>
      </view>
    </scroll-view>
    <MiniPlayerBar />
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { onShow } from '@dcloudio/uni-app';
import MiniPlayerBar from '@/components/MiniPlayerBar.vue';
import { useContentStore } from '@/stores/content';
import type { Term } from '@/types/content';

const DEFAULT_CENTER = {
  latitude: 31.62791,
  longitude: 119.55104,
};

const contentStore = useContentStore();
const { termsWithLocation } = storeToRefs(contentStore);

const scale = ref(12);
const activeTermId = ref<string>();
const markerLookup = ref<Record<number, string>>({});

const terms = computed<Term[]>(() => contentStore.state.terms);

const iconMap: Record<string, string> = {
  'term-changdang-crab': '/static/markers/marker-crab.png',
  'term-boat-banquet': '/static/markers/marker-boat.png',
  'term-zhiqian-fish-lantern': '/static/markers/marker-fish.png',
  'term-lantern-festival-youshan': '/static/markers/marker-lantern.png',
  'term-water-street': '/static/markers/marker-city.png',
};

const markers = computed<UniApp.Marker[]>(() => {
  const lookup: Record<number, string> = {};
  const items =
    termsWithLocation.value?.map((term, index) => {
      const markerId = index + 1;
      lookup[markerId] = term.id;
      return {
        id: markerId,
        latitude: term.location!.lat,
        longitude: term.location!.lng,
        iconPath: iconMap[term.id] ?? '/static/markers/marker-city.png',
        width: 44,
        height: 44,
        callout: {
          content: term.name.zh,
          color: '#ffffff',
          fontSize: 12,
          borderRadius: 12,
          bgColor: '#1d4ed8',
          padding: 6,
          display: 'BYCLICK',
        },
      } as UniApp.Marker;
    }) ?? [];
  markerLookup.value = lookup;
  return items;
});

const mapCenter = computed(() => {
  if (activeTermId.value) {
    const focused = termsWithLocation.value?.find((term) => term.id === activeTermId.value);
    if (focused?.location) {
      return {
        latitude: focused.location.lat,
        longitude: focused.location.lng,
      };
    }
  }
  const firstMarker = markers.value[0];
  if (firstMarker) {
    return {
      latitude: firstMarker.latitude,
      longitude: firstMarker.longitude,
    };
  }
  return DEFAULT_CENTER;
});

const handleMarkerTap = (event: UniApp.MapOnMarkerTapEvent) => {
  const rawId = event.detail.markerId;
  const numericId = typeof rawId === 'string' ? Number(rawId) : Number(rawId);
  const termId =
    markerLookup.value[numericId] ??
    termsWithLocation.value?.[numericId ? numericId - 1 : 0]?.id;
  if (termId) {
    openTerm(termId);
  }
};

const openTerm = (id: string) => {
  uni.navigateTo({
    url: `/pages/term/detail?id=${id}`,
  });
};

const syncFocusFromGlobal = () => {
  const app = getApp<{ globalData: { focusTermId?: string; focusSiteId?: string } }>();
  const focusTermId = app.globalData?.focusTermId;
  if (focusTermId) {
    activeTermId.value = focusTermId;
    scale.value = 14;
    app.globalData.focusTermId = undefined;
    return;
  }
  const focusSiteId = app.globalData?.focusSiteId;
  if (focusSiteId) {
    const site = contentStore.getSiteById(focusSiteId);
    if (site?.termId) {
      activeTermId.value = site.termId;
      scale.value = 14;
    }
    app.globalData.focusSiteId = undefined;
  }
};

onMounted(() => {
  contentStore.hydrate();
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

.map-page__map {
  width: 100%;
  height: 480rpx;
}

.map-page__list {
  flex: 1;
  height: calc(100% - 480rpx);
  padding: 24rpx 24rpx 200rpx;
  box-sizing: border-box;
}

.map-page__list > .map-page__term-card {
  margin-top: 20rpx;
}

.map-page__list-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.map-page__term-card {
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  box-shadow: 0 10rpx 30rpx rgba(15, 23, 42, 0.08);
  margin-top: 20rpx;
}

.map-page__term-card:first-of-type {
  margin-top: 16rpx;
}

.map-page__term-header {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.map-page__term-name {
  font-size: 34rpx;
  font-weight: 600;
  color: #0f172a;
}

.map-page__term-alias {
  font-size: 26rpx;
  color: #475569;
}

.map-page__term-summary {
  font-size: 28rpx;
  color: #334155;
  line-height: 1.6;
}

.map-page__term-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.map-page__term-tag {
  font-size: 22rpx;
  color: #1d4ed8;
  background-color: #e0f2fe;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
}
</style>
