<template>
  <section class="glass-panel rounded-2xl border border-white/10 p-5 md:p-7 space-y-6">
    <header class="space-y-2">
      <div class="flex items-center gap-2 text-primary">
        <Radio class="w-5 h-5" />
        <h3 class="text-xl md:text-2xl font-bold text-white m-0 p-0">{{ L(t.title) }}</h3>
      </div>
      <p class="text-sm text-gray-400 leading-7 m-0">
        {{ L(t.subtitle) }}
      </p>
      <div class="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span class="px-2 py-1 rounded bg-white/5 border border-white/10 text-gray-300">{{ pageOrigin }}</span>
        <ArrowRight class="w-3.5 h-3.5 text-primary" />
        <span class="px-2 py-1 rounded bg-primary/10 border border-primary/30 text-primary">https://yoji.zhdstudy.cyou</span>
      </div>
    </header>

    <div class="flex flex-wrap items-center gap-3">
      <button
        class="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-emerald-400 text-darker rounded-lg text-sm font-bold transition-all disabled:opacity-50"
        :disabled="busy"
        @click="runAll"
      >
        <ListChecks class="w-4 h-4" />
        {{ busy ? L(t.running) : L(t.runAll) }}
      </button>
      <span class="text-xs text-gray-500">{{ L(t.hint) }}</span>
    </div>

    <div class="space-y-4">
      <article
        v-for="(s, i) in scenarios"
        :key="s.id"
        class="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3"
      >
        <div class="flex items-start gap-3">
          <span
            class="shrink-0 w-6 h-6 rounded-md grid place-items-center text-xs font-bold"
            :class="s.expect === 'pass' ? 'bg-primary/15 text-primary' : 'bg-rose-500/15 text-rose-400'"
          >{{ i + 1 }}</span>
          <div class="space-y-1 min-w-0">
            <h4 class="text-base font-bold text-white m-0 p-0 leading-6">{{ L(s.title) }}</h4>
            <p class="text-sm text-gray-400 leading-6 m-0">{{ L(s.desc) }}</p>
          </div>
        </div>

        <pre
          class="text-xs font-mono overflow-x-auto rounded-lg px-3 py-2 m-0 border border-white/10 text-gray-300"
          :style="{ background: 'var(--prose-code-panel-bg)' }"
        >{{ s.method }} {{ s.url }}<template v-if="s.chips">{{ '\n' + s.chips }}</template></pre>

        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-50"
            :class="results[s.id]?.state === 'running'
              ? 'border-white/10 bg-white/5 text-gray-400'
              : 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'"
            :disabled="results[s.id]?.state === 'running'"
            @click="run(s)"
          >
            <Loader2 v-if="results[s.id]?.state === 'running'" class="w-3.5 h-3.5 animate-spin" />
            <Play v-else class="w-3.5 h-3.5" />
            {{ L(t.send) }}
          </button>

          <span
            v-if="results[s.id] && results[s.id].state !== 'running'"
            class="inline-flex items-center gap-1.5 text-xs font-bold"
            :class="verdict(s).ok ? 'text-primary' : 'text-rose-400'"
          >
            <CheckCircle2 v-if="verdict(s).ok" class="w-4 h-4" />
            <XCircle v-else class="w-4 h-4" />
            {{ verdict(s).label }}
          </span>
        </div>

        <div
          v-if="results[s.id] && results[s.id].state !== 'running'"
          class="rounded-lg border p-3 text-xs font-mono space-y-1.5"
          :class="results[s.id].state === 'blocked' ? 'border-rose-500/30 bg-rose-500/5' : 'border-primary/25 bg-primary/5'"
        >
          <div class="text-gray-300">
            <span v-if="results[s.id].status">{{ results[s.id].status }} · </span>
            <span>{{ results[s.id].ms }} ms</span>
            <span v-if="results[s.id].state === 'blocked'" class="text-rose-400"> · {{ L(t.blocked) }}</span>
          </div>
          <div v-if="results[s.id].body" class="text-gray-400 break-all whitespace-pre-wrap">{{ results[s.id].body }}</div>
          <div v-if="results[s.id].message" class="text-rose-400 break-all">{{ results[s.id].message }}</div>
        </div>

        <details class="text-xs">
          <summary class="cursor-pointer text-gray-500 hover:text-primary transition-colors select-none">
            {{ L(t.curl) }}
          </summary>
          <pre
            class="mt-2 overflow-x-auto rounded-lg px-3 py-2 border border-white/10 text-gray-400 font-mono"
            :style="{ background: 'var(--prose-code-panel-bg)' }"
          >{{ s.curl }}</pre>
        </details>
      </article>
    </div>

    <p class="text-xs text-gray-500 leading-6 m-0 border-t border-white/10 pt-4">
      {{ L(t.note) }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowRight, CheckCircle2, ListChecks, Loader2, Play, Radio, XCircle } from 'lucide-vue-next'

type Lang = 'zh' | 'en'
type Pair = Record<Lang, string>

interface Scenario {
  id: string
  title: Pair
  desc: Pair
  method: string
  url: string
  chips?: string
  init?: RequestInit
  expect: 'pass' | 'block'
  curl: string
}

interface Result {
  state: 'running' | 'ok' | 'http' | 'blocked'
  status?: number
  ms: number
  body?: string
  message?: string
}

const { locale } = useI18n()
const L = (pair: Pair) => pair[locale.value === 'en' ? 'en' : 'zh']

const t = {
  title: { zh: '跨域实验室：这一页真实发出的 5 个请求', en: 'CORS Lab: 5 real requests fired from this page' },
  subtitle: {
    zh: '下面每个按钮都会用 fetch 真发一次请求，目标是我另一个线上项目的后台 yoji.zhdstudy.cyou。放行还是被拦，取决于对方响应头，不是页面写死的结论。',
    en: 'Every button below fires a real fetch at yoji.zhdstudy.cyou, the backend of another live project of mine. Whether the browser lets it through depends on the response headers, not on a hard-coded verdict.'
  },
  runAll: { zh: '依次跑完 5 个', en: 'Run all 5' },
  running: { zh: '请求中…', en: 'Running…' },
  hint: { zh: '建议同时打开浏览器 DevTools 的 Network 面板对照查看', en: 'Open DevTools → Network to follow along' },
  send: { zh: '发起请求', en: 'Send request' },
  blocked: { zh: '响应被浏览器拦截', en: 'response blocked by the browser' },
  curl: { zh: '等价的 curl 命令（能看到完整响应头）', en: 'Equivalent curl (shows full response headers)' },
  note: {
    zh: '注意：Access-Control-Allow-Origin 不属于 CORS 安全列表响应头，JS 读不到它，所以面板里只显示状态码与响应体；要看真实响应头请用上面的 curl 或 DevTools。被拦截时 fetch 抛出的是 TypeError，浏览器出于安全不会告诉你具体原因，真实原因写在 DevTools 的 Console 里。',
    en: 'Note: Access-Control-Allow-Origin is not a CORS-safelisted response header, so JS cannot read it — the panel only shows status and body. Use the curl commands or DevTools for real headers. When blocked, fetch throws a bare TypeError; the browser hides the reason from JS and prints it in the Console instead.'
  }
}

const scenarios: Scenario[] = [
  {
    id: 'same-origin',
    title: { zh: '同源对照组：本站自己的接口', en: 'Same-origin control: this site’s own API' },
    desc: {
      zh: '协议、域名、端口三者完全一致，压根不进入 CORS 流程，永远能读到响应。这是后面四个跨域场景的参照物。',
      en: 'Protocol, host and port all match, so CORS never kicks in and the response is always readable. This is the baseline for the four cross-origin cases below.'
    },
    method: 'GET',
    url: '/api/health',
    expect: 'pass',
    curl: 'curl -i https://blog.zhdstudy.cloud/api/health'
  },
  {
    id: 'cors-ok',
    title: { zh: '跨域成功：对方后端开了 CORS', en: 'Cross-origin success: the API enables CORS' },
    desc: {
      zh: 'yoji 的 Express 用了 cors() 中间件，会按请求的 Origin 回写 Access-Control-Allow-Origin，所以这个 JSON 接口跨域可读。',
      en: 'Yoji’s Express app uses the cors() middleware, which echoes Access-Control-Allow-Origin for the request Origin, so this JSON endpoint is readable cross-origin.'
    },
    method: 'GET',
    url: 'https://yoji.zhdstudy.cyou/healthz',
    expect: 'pass',
    curl: 'curl -i -H "Origin: https://blog.zhdstudy.cloud" https://yoji.zhdstudy.cyou/healthz'
  },
  {
    id: 'preflight',
    title: { zh: '预检请求：自定义头触发 OPTIONS', en: 'Preflight: a custom header triggers OPTIONS' },
    desc: {
      zh: '同样的接口，只多加一个自定义头 X-Requested-With，就不再是"简单请求"。浏览器会先自动发一次 OPTIONS 预检，拿到 Allow-Methods / Allow-Headers 后才发真正的 GET。',
      en: 'Same endpoint, but adding one custom header X-Requested-With makes it a non-simple request. The browser first sends an OPTIONS preflight and only issues the real GET after Allow-Methods / Allow-Headers come back.'
    },
    method: 'GET',
    url: 'https://yoji.zhdstudy.cyou/api/',
    chips: 'X-Requested-With: cors-lab   → 触发预检 OPTIONS',
    init: { headers: { 'X-Requested-With': 'cors-lab' } },
    expect: 'pass',
    curl: 'curl -i -X OPTIONS \\\n  -H "Origin: https://blog.zhdstudy.cloud" \\\n  -H "Access-Control-Request-Method: GET" \\\n  -H "Access-Control-Request-Headers: x-requested-with" \\\n  https://yoji.zhdstudy.cyou/api/'
  },
  {
    id: 'static-html',
    title: { zh: '跨域失败：静态页面没有 CORS 头', en: 'Cross-origin failure: static HTML has no CORS headers' },
    desc: {
      zh: '这次要的是 yoji 的首页 HTML，由 nginx 直接返回，没有经过 Node 的 cors() 中间件，响应里没有 Access-Control-Allow-Origin，浏览器就会拦下响应体。请求其实已经到达服务器（对方日志里有记录），只是 JS 拿不到内容。',
      en: 'This one asks for Yoji’s index HTML, served straight by nginx without passing through the Node cors() middleware. With no Access-Control-Allow-Origin in the response, the browser withholds the body. The request did reach the server (it shows in their logs) — JS just cannot read it.'
    },
    method: 'GET',
    url: 'https://yoji.zhdstudy.cyou/',
    expect: 'block',
    curl: 'curl -i -H "Origin: https://blog.zhdstudy.cloud" https://yoji.zhdstudy.cyou/'
  },
  {
    id: 'credentials',
    title: { zh: '带凭证的跨域：缺 Allow-Credentials', en: 'Credentialed request: missing Allow-Credentials' },
    desc: {
      zh: '还是那个能成功的 /healthz，只是把 credentials 设成 include（带 Cookie）。对方 cors() 没开 credentials，响应缺 Access-Control-Allow-Credentials: true，于是同样被拦 —— 带凭证时规则更严：Allow-Origin 不能是 *，必须是精确的源。',
      en: 'Same /healthz that just succeeded, but with credentials set to include (send cookies). Their cors() does not enable credentials, so Access-Control-Allow-Credentials: true is missing and the response is blocked again — credentialed requests are stricter: Allow-Origin cannot be *, it must be the exact origin.'
    },
    method: 'GET',
    url: 'https://yoji.zhdstudy.cyou/healthz',
    chips: 'credentials: include   → 需要 Allow-Credentials: true',
    init: { credentials: 'include' },
    expect: 'block',
    curl: 'curl -i -H "Origin: https://blog.zhdstudy.cloud" --cookie "sid=1" https://yoji.zhdstudy.cyou/healthz'
  }
]

const results = reactive<Record<string, Result>>({})
const pageOrigin = computed(() => (typeof window === 'undefined' ? '' : window.location.origin))
const busy = computed(() => Object.values(results).some((r) => r.state === 'running'))

async function run(s: Scenario) {
  results[s.id] = { state: 'running', ms: 0 }
  const started = performance.now()
  try {
    const res = await fetch(s.url, { method: s.method, cache: 'no-store', ...s.init })
    const text = await res.text()
    results[s.id] = {
      state: res.ok ? 'ok' : 'http',
      status: res.status,
      ms: Math.round(performance.now() - started),
      body: text.length > 260 ? `${text.slice(0, 260)}…` : text
    }
  } catch (err) {
    results[s.id] = {
      state: 'blocked',
      ms: Math.round(performance.now() - started),
      message: err instanceof Error ? `${err.name}: ${err.message}` : String(err)
    }
  }
}

async function runAll() {
  for (const s of scenarios) {
    await run(s)
  }
}

function verdict(s: Scenario) {
  const r = results[s.id]
  if (!r || r.state === 'running') return { ok: false, label: '' }
  const reached = r.state !== 'blocked'
  const wanted = s.expect === 'pass'
  const ok = reached === wanted
  return {
    ok,
    label: reached
      ? L({ zh: '浏览器放行，JS 读到了响应', en: 'Allowed — JS read the response' })
      : L({ zh: '被 CORS 拦截，JS 读不到响应', en: 'Blocked by CORS — JS got nothing' })
  }
}
</script>
