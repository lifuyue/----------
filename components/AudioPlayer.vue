<template>
  <view class="audio-player">
    <view class="audio-player__controls">
      <view class="audio-player__button" @tap="handleToggle">
        <text v-if="isPlaying" class="icon">⏸</text>
        <text v-else class="icon">▶️</text>
      </view>
      <view class="audio-player__info">
        <text class="audio-player__title">{{ title }}</text>
        <view class="audio-player__progress">
          <slider
            class="audio-player__slider"
            :value="progress"
            @change="handleSeek"
            :disabled="!isCurrent"
          />
        </view>
        <view class="audio-player__meta">
          <text>{{ formattedCurrentTime }}</text>
          <text>{{ formattedDuration }}</text>
        </view>
      </view>
      <picker
        class="audio-player__rate"
        mode="selector"
        :range="playbackOptions"
        :value="rateIndex"
        @change="handleRateChange"
      >
        <view class="audio-player__rate-text">{{ playbackLabel }}</view>
      </picker>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { usePlayerStore } from '@/stores/player';

interface Props {
  src: string;
  title?: string;
}

const props = defineProps<Props>();
const playerStore = usePlayerStore();

const playbackOptions = ['1.0x', '1.5x', '2.0x'];
const playbackRates = [1, 1.5, 2];

const isCurrent = computed(() => playerStore.state.currentSource === props.src);
const isPlaying = computed(() => isCurrent.value && playerStore.state.isPlaying);
const duration = computed(() => (isCurrent.value ? playerStore.state.duration : 0));
const currentTime = computed(() => (isCurrent.value ? playerStore.state.currentTime : 0));
const progress = computed(() => {
  if (!duration.value) {
    return 0;
  }
  return (currentTime.value / duration.value) * 100;
});

const playbackLabel = computed(() => `${playerStore.state.playbackRate.toFixed(1)}x`);
const rateIndex = computed(() => {
  const index = playbackRates.indexOf(playerStore.state.playbackRate);
  return index >= 0 ? index : 0;
});

const formatSeconds = (seconds: number): string => {
  if (!seconds || Number.isNaN(seconds)) {
    return '00:00';
  }
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const formattedDuration = computed(() => formatSeconds(duration.value));
const formattedCurrentTime = computed(() => formatSeconds(currentTime.value));

const handleToggle = () => {
  if (!props.src) return;
  if (!isCurrent.value) {
    playerStore.play(props.src, props.title);
  } else {
    playerStore.toggle();
  }
};

interface SliderChangeEvent {
  detail: {
    value: number | string;
  };
}

interface PickerChangeEvent {
  detail: {
    value: number | string;
  };
}

const handleSeek = (event: SliderChangeEvent) => {
  if (!isCurrent.value || !duration.value) return;
  const sliderValue = Number(event.detail.value ?? 0);
  playerStore.seek((sliderValue / 100) * duration.value);
};

const handleRateChange = (event: PickerChangeEvent) => {
  const index = Number(event.detail.value ?? 0);
  const rate = playbackRates[index] ?? 1;
  playerStore.setRate(rate);
};
</script>

<style scoped>
.audio-player {
  width: 100%;
  background-color: #f8fafc;
  border-radius: 24rpx;
  padding: 16rpx 24rpx;
}

.audio-player__controls {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 20rpx;
}

.audio-player__button {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background-color: #1d4ed8;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.audio-player__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.audio-player__title {
  font-size: 28rpx;
  color: #0f172a;
  font-weight: 500;
}

.audio-player__progress {
  width: 100%;
}

.audio-player__slider {
  width: 100%;
}

.audio-player__meta {
  display: flex;
  justify-content: space-between;
  font-size: 22rpx;
  color: #6b7280;
}

.audio-player__rate {
  padding: 12rpx 20rpx;
  background-color: #e2e8f0;
  border-radius: 999rpx;
}

.audio-player__rate-text {
  font-size: 24rpx;
  color: #1d4ed8;
}

.icon {
  font-size: 36rpx;
}
</style>
