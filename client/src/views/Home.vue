<template>
  <div class="relative">
    <Teleport to="body">
      <div
        v-if="showIntroVideo"
        class="fixed inset-0 z-[100] overflow-hidden bg-black transition-opacity duration-700"
        :class="introVideoFading ? 'opacity-0 pointer-events-none' : 'opacity-100'"
      >
        <video
          ref="heroVideoRef"
          class="h-full w-full object-cover"
          :src="homeHeroVideo"
          autoplay
          muted
          playsinline
          preload="auto"
          @ended="handleHeroVideoEnded"
        ></video>
        <div class="absolute inset-0 bg-black/18"></div>
      </div>
    </Teleport>
    <div class="relative z-10 space-y-24">
    <section class="min-h-[calc(100vh-6rem)] flex flex-col">
      <div class="flex-1 flex flex-col justify-center items-start relative pb-10 md:pb-12">
        <button
          type="button"
          @click="goToCooperation"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-primary/30 text-primary text-sm font-medium mb-8 hover-glass transition-transform hover:-translate-y-1"
        >
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>
          {{ $t('home.status') }}
          <ArrowRight class="w-4 h-4" />
        </button>
        <h1 class="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight mb-6">
          {{ $t('home.greeting') }}
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-teal-400">
            {{ $t('home.name') }}
          </span>
          <br />
          {{ $t('home.role') }}
        </h1>
        <p class="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
          {{ $t('home.desc') }}
        </p>
        <div class="flex flex-wrap gap-4 items-center">
          <router-link
            to="/posts"
            class="px-8 py-4 bg-primary hover:bg-emerald-400 text-darker rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(52,211,153,0.4)] hover:shadow-[0_0_30px_rgba(52,211,153,0.6)] hover:-translate-y-1 text-lg"
          >
            {{ $t('home.btnBrowsePosts') }}
          </router-link>
          <router-link
            to="/about"
            class="px-8 py-4 glass-panel hover-glass font-semibold hover:-translate-y-1 transition-transform text-lg text-white"
          >
            {{ $t('home.btnExplore') }}
          </router-link>
          <a
            href="https://github.com/kingstondantesz1thkg-rgb"
            target="_blank"
            class="flex overflow-hidden items-center text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-black text-[#fff] shadow hover:bg-black/90 h-14 px-8 py-4 max-w-52 whitespace-pre md:flex group relative justify-center gap-2 rounded-xl transition-all duration-300 ease-out hover:ring-2 hover:ring-black hover:ring-offset-2"
          >
            <span
              class="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"
            ></span>
            <div class="flex items-center">
              <svg class="w-5 h-5 fill-current" viewBox="0 0 438.549 438.549">
                <path
                  d="M409.132 114.573c-19.608-33.596-46.205-60.194-79.798-79.8-33.598-19.607-70.277-29.408-110.063-29.408-39.781 0-76.472 9.804-110.063 29.408-33.596 19.605-60.192 46.204-79.8 79.8C9.803 148.168 0 184.854 0 224.63c0 47.78 13.94 90.745 41.827 128.906 27.884 38.164 63.906 64.572 108.063 79.227 5.14.954 8.945.283 11.419-1.996 2.475-2.282 3.711-5.14 3.711-8.562 0-.571-.049-5.708-.144-15.417a2549.81 2549.81 0 01-.144-25.406l-6.567 1.136c-4.187.767-9.469 1.092-15.846 1-6.374-.089-12.991-.757-19.842-1.999-6.854-1.231-13.229-4.086-19.13-8.559-5.898-4.473-10.085-10.328-12.56-17.556l-2.855-6.57c-1.903-4.374-4.899-9.233-8.992-14.559-4.093-5.331-8.232-8.945-12.419-10.848l-1.999-1.431c-1.332-.951-2.568-2.098-3.711-3.429-1.142-1.331-1.997-2.663-2.568-3.997-.572-1.335-.098-2.43 1.427-3.289 1.525-.859 4.281-1.276 8.28-1.276l5.708.853c3.807.763 8.516 3.042 14.133 6.851 5.614 3.806 10.229 8.754 13.846 14.842 4.38 7.806 9.657 13.754 15.846 17.847 6.184 4.093 12.419 6.136 18.699 6.136 6.28 0 11.704-.476 16.274-1.423 4.565-.952 8.848-2.383 12.847-4.285 1.713-12.758 6.377-22.559 13.988-29.41-10.848-1.14-20.601-2.857-29.264-5.14-8.658-2.286-17.605-5.996-26.835-11.14-9.235-5.137-16.896-11.516-22.985-19.126-6.09-7.614-11.088-17.61-14.987-29.979-3.901-12.374-5.852-26.648-5.852-42.826 0-23.035 7.52-42.637 22.557-58.817-7.044-17.318-6.379-36.732 1.997-58.24 5.52-1.715 13.706-.428 24.554 3.853 10.85 4.283 18.794 7.952 23.84 10.994 5.046 3.041 9.089 5.618 12.135 7.708 17.705-4.947 35.976-7.421 54.818-7.421s37.117 2.474 54.823 7.421l10.849-6.849c7.419-4.57 16.18-8.758 26.262-12.565 10.088-3.805 17.802-4.853 23.134-3.138 8.562 21.509 9.325 40.922 2.279 58.24 15.036 16.18 22.559 35.787 22.559 58.817 0 16.178-1.958 30.497-5.853 42.966-3.9 12.471-8.941 22.457-15.125 29.979-6.191 7.521-13.901 13.85-23.131 18.986-9.232 5.14-18.182 8.85-26.84 11.136-8.662 2.286-18.415 4.004-29.263 5.146 9.894 8.562 14.842 22.077 14.842 40.539v60.237c0 3.422 1.19 6.279 3.572 8.562 2.379 2.279 6.136 2.95 11.276 1.995 44.163-14.653 80.185-41.062 108.068-79.226 27.88-38.161 41.825-81.126 41.825-128.906-.01-39.771-9.818-76.454-29.414-110.049z"
                ></path>
              </svg>
              <span class="ml-2 text-[#fff] font-semibold text-lg">{{ $t('home.btnGithub') }}</span>
            </div>
            <div class="ml-2 flex items-center gap-1 text-sm md:flex">
              <svg
                class="w-5 h-5 text-[#6b7280] transition-all duration-300 group-hover:text-yellow-300"
                data-slot="icon"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  clip-rule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  fill-rule="evenodd"
                ></path>
              </svg>
              <span
                class="inline-block tabular-nums tracking-wider font-display font-medium text-[#fff]"
              >6</span>
            </div>
          </a>
        </div>
      </div>

      <div
        class="pb-2 md:pb-4 transition-opacity duration-1000 ease-out"
        :class="showScrollDivider ? 'opacity-100' : 'opacity-0'"
      >
        <div class="flex items-center gap-4 md:gap-6">
          <div class="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-primary/40"></div>
          <button
            type="button"
            @click="scrollToNextSection"
            class="group relative flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-[0_18px_40px_rgba(15,23,42,0.18)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-primary/10 hover:shadow-[0_22px_50px_rgba(52,211,153,0.18)]"
            :title="$t('home.scrollNext')"
            :aria-label="$t('home.scrollNext')"
          >
            <span class="absolute inset-0 rounded-full border border-primary/20 opacity-60 group-hover:opacity-100 animate-ping"></span>
            <span class="absolute inset-[6px] rounded-full bg-gradient-to-br from-white/10 to-transparent"></span>
            <img
              :src="scrollDownArrow"
              alt=""
              class="relative z-10 h-5 w-5 rotate-90 opacity-85 transition-transform duration-300 group-hover:translate-y-1"
            />
          </button>
          <div class="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-primary/40"></div>
        </div>
        <p class="mt-4 text-center text-sm tracking-[0.3em] text-gray-500 uppercase">
          {{ $t('home.scrollNext') }}
        </p>
      </div>
    </section>

    <section ref="nextSectionRef" class="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-28">
      <div class="glass-panel p-6">
        <div class="text-sm text-gray-400 mb-3">{{ $t('home.apiStatus') }}</div>
        <div class="text-3xl font-bold text-white">{{ meta.status }}</div>
        <div class="text-sm text-gray-400 mt-2">{{ $t('home.apiDesc') }}</div>
      </div>
      <div class="glass-panel p-6">
        <div class="text-sm text-gray-400 mb-3">{{ $t('home.postCount') }}</div>
        <div class="text-3xl font-bold text-white">{{ meta.total }}</div>
        <div class="text-sm text-gray-400 mt-2">{{ $t('home.postCountDesc') }}</div>
      </div>
      <div class="glass-panel p-6">
        <div class="text-sm text-gray-400 mb-3">{{ $t('home.categories') }}</div>
        <div class="text-3xl font-bold text-white">{{ meta.categories }}</div>
        <div class="text-sm text-gray-400 mt-2">{{ $t('home.categoriesDesc') }}</div>
      </div>
    </section>

    <section>
      <div class="flex justify-between items-end mb-10 gap-4">
        <div>
          <h2 class="text-4xl font-bold">{{ $t('home.latestWriting') }}</h2>
          <p class="text-gray-400 mt-3">{{ $t('home.latestWritingDesc') }}</p>
        </div>
        <router-link to="/posts" class="text-primary hover:text-emerald-400 flex items-center gap-1 group font-medium">
          {{ $t('home.viewAll') }}
          <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </router-link>
      </div>

      <div v-if="loading" class="glass-panel p-8 text-gray-300">{{ $t('home.loadingPosts') }}</div>
      <div v-else-if="error" class="glass-panel p-8 text-rose-300">{{ error }}</div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <router-link
          v-for="post in posts"
          :key="post._id"
          :to="`/posts/${post._id}`"
          class="glass-panel hover-glass p-8 group flex flex-col justify-between min-h-[240px]"
        >
          <div>
            <div class="flex flex-wrap items-center gap-4 mb-4">
              <span class="text-xs text-primary font-bold tracking-wider uppercase">{{ formatDate(post.createdAt, locale) }}</span>
              <span v-if="getPostCategory(post, locale)" class="text-xs px-2 py-1 rounded bg-white/5 text-gray-300 border border-white/10">{{ getPostCategory(post, locale) }}</span>
            </div>
            <h3 class="text-2xl font-bold mb-4 group-hover:text-primary transition-colors leading-snug text-white">
              {{ getPostTitle(post, locale) }}
            </h3>
            <p class="text-gray-400 text-base line-clamp-3 leading-relaxed">
              {{ getPostSummary(post, locale) || summarize(getPostContent(post, locale)) }}
            </p>
          </div>
          <div class="mt-6 flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-primary transition-colors">
            {{ $t('home.readArticle') }}
            <ArrowRight class="w-4 h-4" />
          </div>
        </router-link>
      </div>
    </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getPosts } from '../api/content'
import homeHeroVideo from '../assets/home/home1.mp4'
import scrollDownArrow from '../assets/home/scroll-down-arrow.png'
import type { Post } from '../types/content'
import { formatDate } from '../utils/format'
import { getPostCategory, getPostSummary, getPostContent, getPostTitle } from '../utils/content'

const { t, locale } = useI18n()
const router = useRouter()
const posts = ref<Post[]>([])
const loading = ref(true)
const error = ref('')
const nextSectionRef = ref<HTMLElement | null>(null)
const showScrollDivider = ref(false)
const heroVideoRef = ref<HTMLVideoElement | null>(null)
const showIntroVideo = ref(true)
const introVideoFading = ref(false)
let scrollDividerTimer: number | undefined
let introVideoHideTimer: number | undefined
let previousBodyOverflow = ''

const meta = computed(() => {
  const categories = new Set(
    posts.value.map((item) => getPostCategory(item, locale.value)).filter(Boolean)
  )

  return {
    status: error.value ? t('home.apiError') : t('home.apiOnline'),
    total: posts.value.length,
    categories: categories.size,
  }
})

function summarize(content: string) {
  return content.replace(/[#*_`>\-\n]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120) || t('home.noSummary')
}

function goToCooperation() {
  router.push('/cooperation')
}

function scrollToNextSection() {
  if (nextSectionRef.value) {
    nextSectionRef.value.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }

  window.scrollBy({ top: window.innerHeight * 0.8, behavior: 'smooth' })
}

function handleHeroVideoEnded() {
  introVideoFading.value = true
  document.body.style.overflow = previousBodyOverflow
  introVideoHideTimer = window.setTimeout(() => {
    showIntroVideo.value = false
  }, 700)
}

async function loadPosts() {
  loading.value = true
  error.value = ''

  try {
    const result = await getPosts({ page: 1, limit: 4 })
    posts.value = result.data
  } catch (err) {
    console.error(err)
    error.value = t('home.loadPostsError')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
  loadPosts()
  scrollDividerTimer = window.setTimeout(() => {
    showScrollDivider.value = true
  }, 5200)
})

onBeforeUnmount(() => {
  if (scrollDividerTimer) {
    window.clearTimeout(scrollDividerTimer)
  }

  if (introVideoHideTimer) {
    window.clearTimeout(introVideoHideTimer)
  }

  document.body.style.overflow = previousBodyOverflow
})
</script>
