<script lang="ts" setup>
import { onHide, onLaunch, onShow } from '@dcloudio/uni-app';
import { useContentStore } from '@/stores/content';
import { usePlayerStore } from '@/stores/player';

const contentStore = useContentStore();
const playerStore = usePlayerStore();

onLaunch(() => {
  contentStore.hydrate();
});

onShow(() => {
  playerStore.handleAppShow();
});

onHide(() => {
  playerStore.handleAppHide();
});
</script>

<style>
/* Global shared styles live in uni.scss */
</style>
