<template>
  <view class="featured-banner" @tap="emit('tap')">
    <view class="featured-banner__badge">本周主题</view>
    <text class="featured-banner__title">{{ title }}</text>
    <text v-if="description" class="featured-banner__description">
      {{ description }}
    </text>
  </view>
</template>

<script lang="ts" setup>
interface Props {
  title: string;
  description?: string;
}

defineProps<Props>();
const emit = defineEmits<{
  (event: 'tap'): void;
}>();
</script>

<style scoped>
.featured-banner {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: #ffffff;
  padding: 32rpx;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.featured-banner__badge {
  width: fit-content;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.featured-banner__title {
  font-size: 36rpx;
  font-weight: 600;
  line-height: 1.4;
}

.featured-banner__description {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.6;
}
</style>
