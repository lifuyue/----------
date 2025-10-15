<template>
  <view class="lexicon-page">
    <scroll-view scroll-y class="lexicon-page__scroll">
      <view class="lexicon-page__inner">
        <view class="lexicon-page__search">
          <view class="lexicon-page__search-box">
            <text class="lexicon-page__search-icon">🔍</text>
            <input
              class="lexicon-page__search-input"
              v-model="keyword"
              placeholder="搜索长荡湖文化词条"
              confirm-type="search"
              @confirm="handleSearchConfirm"
            />
            <view v-if="keyword" class="lexicon-page__search-clear" @tap="clearKeyword">
              清除
            </view>
          </view>
          <view v-if="topTags.length" class="lexicon-page__tags">
            <view class="tag-chip" v-for="tag in topTags" :key="tag" @tap="applyTag(tag)">
              #{{ tag }}
            </view>
          </view>
        </view>

        <FeaturedBanner
          title="船宴：湖上八鲜宴与水上夜游"
          description="体验长荡湖水街的招牌文化宴饮。点击查看词条详情。"
          @tap="openTerm(featuredTerm?.id)"
        />

        <view class="lexicon-page__section">
          <view class="lexicon-page__section-header">
            <text class="lexicon-page__section-title">文化词汇</text>
            <text class="lexicon-page__section-subtitle">离线可用，共 {{ terms.length }} 条</text>
          </view>

          <view v-if="!filteredTerms.length" class="lexicon-page__empty">
            <text class="lexicon-page__empty-title">暂未找到相关词条</text>
            <text class="lexicon-page__empty-subtitle">尝试其他关键词或清除筛选条件。</text>
            <button class="lexicon-page__empty-button" @tap="clearKeyword">清除筛选</button>
          </view>

          <TermCard v-for="term in filteredTerms" :key="term.id" :term="term" @select="openTerm(term.id)" />
        </view>
      </view>
    </scroll-view>
    <MiniPlayerBar />
  </view>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import FeaturedBanner from '@/components/FeaturedBanner.vue';
import MiniPlayerBar from '@/components/MiniPlayerBar.vue';
import TermCard from '@/components/TermCard.vue';
import { useContentStore } from '@/stores/content';
import type { Term } from '@/types/content';

const contentStore = useContentStore();
const { tagCloud } = storeToRefs(contentStore);

const keyword = ref('');

const terms = computed<Term[]>(() => contentStore.state.terms);
const featuredTerm = computed(() => terms.value.find((term) => term.id === 'term-boat-banquet'));

const filteredTerms = computed<Term[]>(() => {
  const value = keyword.value.trim();
  if (!value) {
    return terms.value;
  }
  return terms.value.filter((term) => {
    const lower = value.toLowerCase();
    return (
      term.name.zh.includes(value) ||
      term.name.en.toLowerCase().includes(lower) ||
      term.tags.some((tag) => tag === value)
    );
  });
});

const topTags = computed(() => {
  const cloud = tagCloud.value;
  return Array.from(cloud.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([tag]) => tag)
    .slice(0, 4);
});

const clearKeyword = () => {
  keyword.value = '';
};

const applyTag = (tag: string) => {
  keyword.value = tag;
};

const openTerm = (id?: string) => {
  if (!id) return;
  uni.navigateTo({
    url: `/pages/term/detail?id=${id}`,
  });
};

const handleSearchConfirm = () => {
  if (!filteredTerms.value.length) {
    uni.showToast({
      title: '未找到匹配词条',
      icon: 'none',
    });
  }
};

onMounted(() => {
  contentStore.hydrate();
});
</script>

<style scoped>
.lexicon-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f1f5f9;
}

.lexicon-page__scroll {
  flex: 1;
}

.lexicon-page__inner {
  padding: 32rpx 32rpx 160rpx;
  box-sizing: border-box;
}

.lexicon-page__search {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 24rpx;
}

.lexicon-page__search-box {
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 12rpx 20rpx;
  gap: 12rpx;
}

.lexicon-page__search-icon {
  font-size: 28rpx;
}

.lexicon-page__search-input {
  flex: 1;
  font-size: 30rpx;
}

.lexicon-page__search-clear {
  font-size: 24rpx;
  color: #2563eb;
}

.lexicon-page__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-chip {
  background-color: #e0f2fe;
  color: #0369a1;
  border-radius: 999rpx;
  padding: 8rpx 20rpx;
  font-size: 24rpx;
}

.lexicon-page__section {
  display: flex;
  flex-direction: column;
  margin-top: 12rpx;
}

.lexicon-page__section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.lexicon-page__section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.lexicon-page__section-subtitle {
  font-size: 24rpx;
  color: #64748b;
}

.lexicon-page__empty {
  background-color: #ffffff;
  padding: 40rpx 24rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16rpx;
}

.lexicon-page__empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #0f172a;
}

.lexicon-page__empty-subtitle {
  font-size: 26rpx;
  color: #475569;
  line-height: 1.6;
}

.lexicon-page__empty-button {
  margin-top: 12rpx;
  background-color: #2563eb;
  color: #ffffff;
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  font-size: 26rpx;
}
</style>
