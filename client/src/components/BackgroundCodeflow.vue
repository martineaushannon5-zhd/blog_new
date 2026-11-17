<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <video
        v-if="videoOk"
        ref="videoRef"
        class="h-full w-full object-cover opacity-50"
        :src="codeflowVideo"
        :poster="codeflowPoster"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        disablepictureinpicture
        disableremoteplayback
        @error="videoOk = false"
      ></video>
      <img v-else :src="codeflowPoster" alt="" class="h-full w-full object-cover opacity-30" />
      <div class="absolute inset-0 bg-gradient-to-b from-darker/80 via-darker/55 to-darker/85"></div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import codeflowVideo from '../assets/home/codeflow.mp4'
import codeflowPoster from '../assets/home/codeflow-poster.jpg'

const videoOk = ref(true)
const videoRef = ref<HTMLVideoElement | null>(null)

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    videoOk.value = false
  } else {
    videoRef.value?.play().catch(() => {})
  }
})
</script>