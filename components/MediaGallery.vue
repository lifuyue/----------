<template>
  <view v-if="images.length" class="media-gallery">
    <view class="media-gallery__item" v-for="(item, index) in images" :key="item.src" @tap="preview(index)">
      <image class="media-gallery__image" :src="item.src" :alt="item.caption || item.src" mode="aspectFill" />
      <text v-if="item.caption" class="media-gallery__caption">{{ item.caption }}</text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { MediaItem } from '@/types/content';

interface Props {
  media: MediaItem[];
}

const props = withDefaults(defineProps<Props>(), {
  media: () => [],
});

const images = computed(() => props.media.filter((item) => item.type === 'image'));

const preview = (index: number) => {
  const urls = images.value.map((item) => item.src);
  if (!urls.length) return;
  uni.previewImage({
    current: urls[index],
    urls,
  });
};
</script>

<style scoped>
.media-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240rpx, 1fr));
  gap: 16rpx;
  margin: 24rpx 0;
}

.media-gallery__item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.media-gallery__image {
  width: 100%;
  height: 240rpx;
  border-radius: 20rpx;
  background-color: #f1f5f9;
}

.media-gallery__caption {
  font-size: 24rpx;
  color: #475569;
}
</style>
