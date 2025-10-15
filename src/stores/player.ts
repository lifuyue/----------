import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { PlayerState } from '../types/content';

let context: UniApp.InnerAudioContext | null = null;

const ensureContext = () => {
  if (!context) {
    context = uni.createInnerAudioContext();
    context.autoplay = false;
    context.obeyMuteSwitch = true;
    context.loop = false;
  }
  return context;
};

export const usePlayerStore = defineStore('player', () => {
  const state = ref<PlayerState>({
    currentSource: undefined,
    currentTitle: undefined,
    isPlaying: false,
    playbackRate: 1,
    duration: 0,
    currentTime: 0,
  });

  const bindEvents = () => {
    const audio = ensureContext();
    audio.onPlay(() => {
      state.value.isPlaying = true;
      state.value.duration = audio.duration || state.value.duration;
    });
    audio.onPause(() => {
      state.value.isPlaying = false;
    });
    audio.onStop(() => {
      state.value.isPlaying = false;
      state.value.currentTime = 0;
    });
    audio.onEnded(() => {
      state.value.isPlaying = false;
      state.value.currentTime = audio.duration;
    });
    audio.onTimeUpdate(() => {
      state.value.duration = audio.duration;
      state.value.currentTime = audio.currentTime;
    });
    audio.onError((err) => {
      console.error('[player-store] audio error', err);
      state.value.isPlaying = false;
    });
  };

  const play = (src: string, title?: string) => {
    const audio = ensureContext();
    if (!audio) {
      return;
    }
    if (state.value.currentSource !== src) {
      audio.src = src;
      state.value.currentSource = src;
      state.value.currentTitle = title;
      state.value.currentTime = 0;
      state.value.duration = 0;
    }
    if (!state.value.isPlaying) {
      audio.playbackRate = state.value.playbackRate;
      audio.play();
    }
  };

  const pause = () => {
    const audio = context;
    if (audio && state.value.isPlaying) {
      audio.pause();
    }
  };

  const toggle = () => {
    if (!state.value.currentSource) {
      return;
    }
    if (state.value.isPlaying) {
      pause();
    } else {
      play(state.value.currentSource, state.value.currentTitle);
    }
  };

  const stop = () => {
    const audio = context;
    if (audio) {
      audio.stop();
    }
  };

  const setRate = (rate: number) => {
    const audio = ensureContext();
    state.value.playbackRate = rate;
    audio.playbackRate = rate;
  };

  const seek = (position: number) => {
    const audio = ensureContext();
    audio.seek(position);
  };

  const reset = () => {
    stop();
    state.value = {
      currentSource: undefined,
      currentTitle: undefined,
      isPlaying: false,
      playbackRate: 1,
      duration: 0,
      currentTime: 0,
    };
  };

  const handleAppHide = () => {
    pause();
  };

  const handleAppShow = () => {
    if (state.value.currentSource && !state.value.isPlaying) {
      const audio = ensureContext();
      audio.playbackRate = state.value.playbackRate;
    }
  };

  bindEvents();

  return {
    state,
    play,
    pause,
    toggle,
    stop,
    seek,
    setRate,
    reset,
    handleAppHide,
    handleAppShow,
  };
});
