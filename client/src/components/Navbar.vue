<template>
  <header class="fixed top-0 left-0 right-0 glass-panel !rounded-none !border-x-0 !border-t-0 border-b border-white/10 z-50 transition-all duration-300" :class="{ 'py-3': scrolled, 'py-5': !scrolled }">
    <div class="max-w-6xl mx-auto px-6 flex justify-between items-center">
      <div class="relative">
        <button
          ref="menuButtonRef"
          type="button"
          class="group flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left transition-all hover:border-primary/40 hover:bg-white/10"
          @click="toggleMenu"
        >
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 text-white shadow-[0_0_30px_rgba(14,165,233,0.18)]">
            <PanelsTopLeft class="h-4 w-4" />
          </div>
          <div class="hidden sm:block">
            <p class="text-[11px] uppercase tracking-[0.35em] text-primary/80">ZHD Toolbox</p>
            <div class="flex items-center gap-2 text-sm font-semibold text-white">
              <span>{{ currentSectionLabel }}</span>
              <ChevronDown class="h-4 w-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': menuOpen }" />
            </div>
          </div>
          <ChevronDown class="h-4 w-4 text-gray-400 transition-transform duration-200 sm:hidden" :class="{ 'rotate-180': menuOpen }" />
        </button>

        <transition name="menu-fade">
          <div
            v-if="menuOpen"
            ref="menuPanelRef"
            class="absolute left-0 top-full mt-3 w-[min(20rem,calc(100vw-3rem))] overflow-hidden rounded-3xl border border-white/10 bg-slate-950/95 p-3 shadow-2xl shadow-black/40 backdrop-blur-xl"
          >
            <div class="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <p class="text-xs uppercase tracking-[0.28em] text-primary/70">Quick Access</p>
              <p class="mt-2 text-sm text-gray-300">
                {{ currentSectionLabel }}
              </p>
            </div>

            <div class="mt-3 space-y-2">
              <router-link
                to="/"
                class="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-gray-200 transition-all hover:border-primary/40 hover:bg-white/[0.08]"
                @click="closeMenu"
              >
                <span class="flex items-center gap-3">
                  <House class="h-4 w-4 text-primary" />
                  {{ $t('nav.home') }}
                </span>
                <span class="text-xs text-gray-500">/</span>
              </router-link>

              <button
                type="button"
                class="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-gray-200 transition-all hover:border-primary/40 hover:bg-white/[0.08]"
                @click="handleLanguageAction"
              >
                <span class="flex items-center gap-3">
                  <Languages class="h-4 w-4 text-primary" />
                  <span>{{ languageActionLabel }}</span>
                </span>
                <span class="rounded-full border border-white/10 px-2 py-0.5 text-xs text-gray-400">
                  {{ $t('nav.toggleLang') }}
                </span>
              </button>
            </div>
          </div>
        </transition>
      </div>
      
      <nav class="flex gap-6 items-center">
        <router-link to="/" class="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
          {{ $t('nav.home') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </router-link>
        <router-link to="/posts" class="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
          {{ $t('nav.posts') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </router-link>
        <router-link to="/about" class="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
          {{ $t('nav.about') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </router-link>
        <router-link to="/cooperation" class="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
          {{ $t('nav.cooperation') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </router-link>
        <router-link to="/sponsor" class="text-sm font-medium text-primary hover:text-emerald-400 transition-colors relative group flex items-center gap-1">
          {{ $t('nav.sponsor') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </router-link>

        <div class="h-4 w-px bg-white/20 mx-2"></div>

        <button @click="toggleLanguage" class="flex items-center gap-1.5 text-sm font-medium text-gray-300 hover:text-primary transition-colors group">
          <Languages class="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span>{{ $t('nav.toggleLang') }}</span>
        </button>

        <router-link to="/admin" class="text-sm font-medium text-gray-300 hover:text-white transition-colors relative group">
          {{ isAuthenticated ? $t('nav.dashboard') : $t('nav.admin') }}
          <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
        </router-link>

        <button
          v-if="isAuthenticated"
          @click="logout"
          class="text-sm font-medium text-gray-300 hover:text-rose-300 transition-colors"
        >
          {{ $t('nav.logout') }}
        </button>

        <a href="https://github.com/martineaushannon5-zhd/blog_new" target="_blank" class="p-2 glass-panel hover-glass !rounded-full ml-2">
          <Github class="w-4 h-4" />
        </a>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { ChevronDown, Github, House, Languages, PanelsTopLeft } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const scrolled = ref(false)
const menuOpen = ref(false)
const menuButtonRef = ref<HTMLElement | null>(null)
const menuPanelRef = ref<HTMLElement | null>(null)
const isAuthenticated = computed(() => authStore.isAuthenticated)

const currentSectionLabel = computed(() => {
  if (route.path === '/') return t('nav.home')
  if (route.path.startsWith('/posts')) return t('nav.posts')
  if (route.path.startsWith('/about')) return t('nav.about')
  if (route.path.startsWith('/cooperation')) return t('nav.cooperation')
  if (route.path.startsWith('/sponsor')) return t('nav.sponsor')
  if (route.path.startsWith('/admin/login')) return t('nav.admin')
  if (route.path.startsWith('/admin')) return t('nav.dashboard')

  return 'ZHD.Dev'
})

const languageActionLabel = computed(() =>
  locale.value === 'zh' ? 'Switch To English' : '切换到中文'
)

const handleScroll = () => {
  scrolled.value = window.scrollY > 20
}

const toggleLanguage = () => {
  locale.value = locale.value === 'zh' ? 'en' : 'zh'
  localStorage.setItem('user-lang', locale.value)
}

const closeMenu = () => {
  menuOpen.value = false
}

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const handleLanguageAction = () => {
  toggleLanguage()
  closeMenu()
}

const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as Node

  if (!menuOpen.value) return
  if (menuButtonRef.value?.contains(target)) return
  if (menuPanelRef.value?.contains(target)) return

  closeMenu()
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

const logout = async () => {
  authStore.signOut()
  await router.push('/admin/login')
}

watch(
  () => route.fullPath,
  () => {
    closeMenu()
  }
)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  window.addEventListener('click', handleClickOutside)
  window.addEventListener('keydown', handleEscape)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('click', handleClickOutside)
  window.removeEventListener('keydown', handleEscape)
})
</script>

<style scoped>
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
