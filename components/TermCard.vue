<template>
  <view class="term-card" @tap="handleTap">
    <view class="term-card__header">
      <text class="term-card__title">{{ term.name.zh }}</text>
      <text class="term-card__subtitle">{{ term.name.en }}</text>
    </view>
    <text class="term-card__summary">{{ term.summary.zh }}</text>
    <view class="term-card__tags">
      <text v-for="tag in term.tags" :key="tag" class="term-card__tag">
        {{ tag }}
      </text>
    </view>
  </view>
</template>

<script lang="ts" setup>
import type { Term } from '@/types/content';

interface Props {
  term: Term;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (event: 'select', term: Term): void;
}>();

const handleTap = () => {
  emit('select', props.term);
};
</script>

<style scoped>
.term-card {
  display: flex;
  flex-direction: column;
  padding: 24rpx;
  border-radius: 24rpx;
  background-color: #ffffff;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.04);
  margin-bottom: 24rpx;
}

.term-card__header {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.term-card__title {
  font-size: 34rpx;
  font-weight: 600;
  color: #1c1c1e;
}

.term-card__subtitle {
  font-size: 26rpx;
  color: #8e8e93;
}

.term-card__summary {
  font-size: 28rpx;
  color: #3a3a3c;
  margin: 16rpx 0;
  line-height: 1.5;
}

.term-card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.term-card__tag {
  background-color: #f1f5f9;
  color: #1c64f2;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
}
</style>
