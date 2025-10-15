<template>
  <view class="site-detail">
    <scroll-view scroll-y class="site-detail__scroll">
      <view v-if="site" class="site-detail__inner">
        <view class="site-detail__header">
          <view>
            <text class="site-detail__title">{{ site.name.zh }}</text>
            <text class="site-detail__subtitle">{{ site.name.en }}</text>
            <text v-if="site.pinyin" class="site-detail__pinyin">{{ site.pinyin }}</text>
          </view>
          <view class="site-detail__category">{{ site.category }}</view>
        </view>

        <view class="site-detail__tags">
          <text v-for="tag in site.tags" :key="tag" class="site-detail__tag">
            #{{ tag }}
          </text>
        </view>

        <view class="site-detail__block">
          <text class="site-detail__section-title">简介</text>
          <text class="site-detail__paragraph">{{ site.summary.zh }}</text>
          <text class="site-detail__paragraph site-detail__paragraph--en">
            {{ site.summary.en }}
          </text>
        </view>

        <view class="site-detail__block">
          <text class="site-detail__section-title">背景与来历</text>
          <text class="site-detail__paragraph">{{ site.background.zh }}</text>
          <text class="site-detail__paragraph site-detail__paragraph--en">
            {{ site.background.en }}
          </text>
        </view>

        <view v-if="audioItems.length" class="site-detail__block">
          <text class="site-detail__section-title">音频讲解</text>
          <view v-for="item in audioItems" :key="item.src">
            <AudioPlayer :src="item.src" :title="item.caption || site.name.zh" />
          </view>
        </view>

        <view v-if="site.media.length" class="site-detail__block">
          <text class="site-detail__section-title">多媒体资料</text>
          <MediaGallery :media="site.media" />
        </view>

        <view
          v-if="site.geo.address || (site.geo.lat && site.geo.lng)"
          class="site-detail__block site-detail__map"
          @tap="openLocation"
        >
          <view class="site-detail__map-icon">🧭</view>
          <view class="site-detail__map-texts">
            <text class="site-detail__map-title">打开地图导航</text>
            <text v-if="site.geo.address" class="site-detail__map-address">{{ site.geo.address }}</text>
            <text v-else class="site-detail__map-address">点击在地图中查看</text>
          </view>
        </view>

        <view v-if="site.sources.length" class="site-detail__block">
          <text class="site-detail__section-title">参考来源</text>
          <view class="site-detail__source" v-for="source in site.sources" :key="source.url">
            <text class="site-detail__source-title">{{ source.title }}</text>
            <text class="site-detail__source-url">{{ source.url }}</text>
          </view>
        </view>

        <view v-if="relatedTerms.length" class="site-detail__block">
          <text class="site-detail__section-title">关联词条</text>
          <view class="site-detail__related">
            <view
              v-for="term in relatedTerms"
              :key="term.id"
              class="site-detail__related-card"
              @tap="openTerm(term.id)"
            >
              <text class="site-detail__related-title">{{ term.name.zh }}</text>
              <text class="site-detail__related-subtitle">{{ term.name.en }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="site-detail__empty">
        <text>未找到景点数据</text>
      </view>
    </scroll-view>
    <MiniPlayerBar />
  </view>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AudioPlayer from '@/components/AudioPlayer.vue';
import MediaGallery from '@/components/MediaGallery.vue';
import MiniPlayerBar from '@/components/MiniPlayerBar.vue';
import { useContentStore } from '@/stores/content';
import { usePlayerStore } from '@/stores/player';
import type { MediaItem, Site, Term } from '@/types/content';

const contentStore = useContentStore();
const playerStore = usePlayerStore();

const siteId = ref<string>();

const site = computed<Site | undefined>(() => {
  if (!siteId.value) return undefined;
  return contentStore.getSiteById(siteId.value);
});

const audioItems = computed<MediaItem[]>(() => {
  if (!site.value) return [];
  return site.value.media.filter((item) => item.type === 'audio');
});

const relatedTerms = computed<Term[]>(() => {
  if (!site.value) return [];
  if (site.value.termId) {
    const linked = contentStore.getTermById(site.value.termId);
    return linked ? [linked] : [];
  }
  return contentStore.getRelatedTerms(site.value.tags);
});

const openTerm = (id: string) => {
  uni.navigateTo({
    url: `/pages/term/detail?id=${id}`,
  });
};

const openLocation = () => {
  if (!site.value) return;
  if (site.value.geo.lat && site.value.geo.lng) {
    uni.openLocation({
      latitude: site.value.geo.lat,
      longitude: site.value.geo.lng,
      name: site.value.name.zh,
      address: site.value.geo.address || site.value.name.zh,
    });
  } else if (site.value.geo.address) {
    uni.showToast({
      title: site.value.geo.address,
      icon: 'none',
      duration: 3000,
    });
  }
};

onLoad((options) => {
  contentStore.hydrate();
  if (options?.id && typeof options.id === 'string') {
    siteId.value = options.id;
    const title = contentStore.getSiteById(options.id)?.name.zh;
    if (title) {
      uni.setNavigationBarTitle({ title });
    }
  }
});

onUnmounted(() => {
  playerStore.pause();
});
</script>

<style scoped>
.site-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f1f5f9;
}

.site-detail__scroll {
  flex: 1;
}

.site-detail__inner {
  padding: 32rpx 32rpx 160rpx;
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.site-detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
}

.site-detail__title {
  font-size: 42rpx;
  font-weight: 700;
  color: #0f172a;
}

.site-detail__subtitle {
  font-size: 28rpx;
  color: #475569;
}

.site-detail__pinyin {
  font-size: 26rpx;
  color: #1d4ed8;
}

.site-detail__category {
  background-color: #eff6ff;
  color: #1d4ed8;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.site-detail__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.site-detail__tag {
  background-color: #e2e8f0;
  color: #1e293b;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}

.site-detail__block {
  background-color: #ffffff;
  padding: 28rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.site-detail__section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.site-detail__paragraph {
  font-size: 28rpx;
  color: #334155;
  line-height: 1.7;
}

.site-detail__paragraph--en {
  color: #64748b;
}

.site-detail__map {
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.site-detail__map-icon {
  font-size: 40rpx;
}

.site-detail__map-texts {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.site-detail__map-title {
  font-size: 30rpx;
  font-weight: 600;
}

.site-detail__map-address {
  font-size: 26rpx;
  color: #475569;
}

.site-detail__source {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.site-detail__source-title {
  font-size: 28rpx;
  color: #0f172a;
}

.site-detail__source-url {
  font-size: 24rpx;
  color: #2563eb;
  word-break: break-all;
}

.site-detail__related {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.site-detail__related-card {
  background-color: #f1f5f9;
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.site-detail__related-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.site-detail__related-subtitle {
  font-size: 26rpx;
  color: #475569;
}

.site-detail__empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
</style>
