<template>
  <view class="term-detail">
    <scroll-view scroll-y class="term-detail__scroll">
      <view v-if="term" class="term-detail__inner">
        <view class="term-detail__header">
          <text class="term-detail__title">{{ term.name.zh }}</text>
          <text class="term-detail__subtitle">{{ term.name.en }}</text>
          <text v-if="term.pinyin" class="term-detail__pinyin">{{ term.pinyin }}</text>
        </view>

        <view class="term-detail__block">
          <text class="term-detail__section-title">释义</text>
          <text class="term-detail__paragraph">
            {{ term.summary.zh }}
          </text>
          <text class="term-detail__paragraph term-detail__paragraph--en">
            {{ term.summary.en }}
          </text>
        </view>

        <view class="term-detail__block">
          <text class="term-detail__section-title">文化背景</text>
          <text class="term-detail__paragraph">
            {{ term.background.zh }}
          </text>
          <text class="term-detail__paragraph term-detail__paragraph--en">
            {{ term.background.en }}
          </text>
        </view>

        <view v-if="audioItems.length" class="term-detail__block">
          <text class="term-detail__section-title">音频讲解</text>
          <view v-for="item in audioItems" :key="item.src">
            <AudioPlayer :src="item.src" :title="item.caption || term.name.zh" />
          </view>
        </view>

        <view v-if="term.media.length" class="term-detail__block">
          <text class="term-detail__section-title">图像资料</text>
          <MediaGallery :media="term.media" />
        </view>

        <view v-if="linkedSite" class="term-detail__block term-detail__map-link" @tap="goToMap">
          <view class="term-detail__map-icon">📍</view>
          <view>
            <text class="term-detail__map-title">在地图上查看</text>
            <text class="term-detail__map-subtitle">{{ linkedSite.name.zh }}</text>
          </view>
        </view>

        <view v-if="term.sources.length" class="term-detail__block">
          <text class="term-detail__section-title">参考来源</text>
          <view class="term-detail__source" v-for="source in term.sources" :key="source.url">
            <text class="term-detail__source-title">{{ source.title }}</text>
            <text class="term-detail__source-url">{{ source.url }}</text>
          </view>
        </view>

        <view v-if="relatedTerms.length" class="term-detail__block">
          <text class="term-detail__section-title">相关词条</text>
          <view class="term-detail__related">
            <view
              class="term-detail__related-card"
              v-for="item in relatedTerms"
              :key="item.id"
              @tap="openTerm(item.id)"
            >
              <text class="term-detail__related-title">{{ item.name.zh }}</text>
              <text class="term-detail__related-subtitle">{{ item.name.en }}</text>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="term-detail__empty">
        <text>未找到词条数据</text>
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

const termId = ref<string>();

const term = computed<Term | undefined>(() => {
  if (!termId.value) return undefined;
  return contentStore.getTermById(termId.value);
});

const audioItems = computed<MediaItem[]>(() => {
  if (!term.value) return [];
  return term.value.media.filter((item) => item.type === 'audio');
});

const linkedSite = computed<Site | undefined>(() => {
  if (!term.value) return undefined;
  const direct = contentStore.state.sites.find((site) => site.termId === term.value?.id);
  if (direct) return direct;
  return contentStore
    .getRelatedSites(term.value.tags, undefined)
    .find((site) => Boolean(site.geo.lat && site.geo.lng));
});

const relatedTerms = computed<Term[]>(() => {
  if (!term.value) return [];
  return contentStore.getRelatedTerms(term.value.tags, term.value.id);
});

const openTerm = (id: string) => {
  uni.navigateTo({
    url: `/pages/term/detail?id=${id}`,
  });
};

const goToMap = () => {
  if (!linkedSite.value) return;
  const app = getApp<{ globalData: { focusSiteId?: string } }>();
  if (!app.globalData) {
    // eslint-disable-next-line no-param-reassign
    app.globalData = {};
  }
  app.globalData.focusSiteId = linkedSite.value.id;
  uni.switchTab({
    url: '/pages/map/index',
  });
};

onLoad((options) => {
  contentStore.hydrate();
  if (options?.id && typeof options.id === 'string') {
    termId.value = options.id;
    const title = contentStore.getTermById(options.id)?.name.zh;
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
.term-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f8fafc;
}

.term-detail__scroll {
  flex: 1;
}

.term-detail__inner {
  padding: 32rpx 32rpx 160rpx;
  display: flex;
  flex-direction: column;
  gap: 32rpx;
}

.term-detail__header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.term-detail__title {
  font-size: 44rpx;
  font-weight: 700;
  color: #0f172a;
}

.term-detail__subtitle {
  font-size: 30rpx;
  color: #475569;
}

.term-detail__pinyin {
  font-size: 26rpx;
  color: #1d4ed8;
}

.term-detail__block {
  background-color: #ffffff;
  padding: 28rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.term-detail__section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1e293b;
}

.term-detail__paragraph {
  font-size: 28rpx;
  color: #334155;
  line-height: 1.7;
}

.term-detail__paragraph--en {
  color: #64748b;
}

.term-detail__map-link {
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.term-detail__map-icon {
  font-size: 36rpx;
}

.term-detail__map-title {
  font-size: 30rpx;
  font-weight: 600;
}

.term-detail__map-subtitle {
  font-size: 26rpx;
  color: #475569;
}

.term-detail__source {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.term-detail__source-title {
  font-size: 28rpx;
  color: #0f172a;
}

.term-detail__source-url {
  font-size: 24rpx;
  color: #2563eb;
  word-break: break-all;
}

.term-detail__related {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.term-detail__related-card {
  background-color: #f1f5f9;
  border-radius: 20rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.term-detail__related-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #0f172a;
}

.term-detail__related-subtitle {
  font-size: 26rpx;
  color: #475569;
}

.term-detail__empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}
</style>
