<template>
  <view v-if="visible" class="mini-player" :style="{ bottom: safeArea }">
    <view class="mini-player__content" @tap="openPlayer">
      <view class="mini-player__meta">
        <text class="mini-player__label">正在播放</text>
        <text class="mini-player__title">{{ playerStore.state.currentTitle || '音频' }}</text>
      </view>
      <view class="mini-player__progress">
        <view class="mini-player__progress-bar" :style="{ width: `${progress}%` }" />
      </view>
    </view>
    <view class="mini-player__actions">
      <view class="mini-player__button" @tap.stop="playerStore.toggle">
        <text v-if="playerStore.state.isPlaying">⏸</text>
        <text v-else>▶️</text>
      </view>
      <view class="mini-player__button" @tap.stop="playerStore.setRate(nextRate)">
        {{ playbackLabel }}
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

const visible = computed(() => Boolean(playerStore.state.currentSource));
const progress = computed(() => {
  if (!playerStore.state.duration) return 0;
  return (playerStore.state.currentTime / playerStore.state.duration) * 100;
});

const nextRate = computed(() => {
  const current = playerStore.state.playbackRate;
  if (current === 1) return 1.5;
  if (current === 1.5) return 2;
  return 1;
});

const playbackLabel = computed(() => `${playerStore.state.playbackRate.toFixed(1)}x`);

const safeArea = computed(() => {
  const safeBottom = uni.getSystemInfoSync().safeAreaInsets?.bottom ?? 0;
  return `${safeBottom}px`;
});

const openPlayer = () => {
  uni.showToast({
    icon: 'none',
    title: '音频播放中，可在详情页查看更多。',
  });
};
</script>

<style scoped>
.mini-player {
  position: fixed;
  left: 32rpx;
  right: 32rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(15, 23, 42, 0.92);
  color: #ffffff;
  border-radius: 999rpx;
  padding: 16rpx 24rpx;
  z-index: 999;
  gap: 24rpx;
}

.mini-player__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.mini-player__meta {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.mini-player__label {
  font-size: 22rpx;
  opacity: 0.7;
}

.mini-player__title {
  font-size: 28rpx;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mini-player__progress {
  height: 6rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 999rpx;
  overflow: hidden;
}

.mini-player__progress-bar {
  height: 100%;
  background-color: #38bdf8;
}

.mini-player__actions {
  display: flex;
  gap: 12rpx;
}

.mini-player__button {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26rpx;
}
</style>
