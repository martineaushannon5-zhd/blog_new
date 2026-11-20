const { mongoose, isDatabaseConnected } = require('./config');
const { Schema } = mongoose;

const localizedField = {
  type: Schema.Types.Mixed,
  default: ''
};

const postSchema = new mongoose.Schema(
  {
    title: { ...localizedField, required: true },
    content: { ...localizedField, required: true },
    summary: localizedField,
    category: { ...localizedField, default: 'Uncategorized' },
    tags: { type: [String], default: [] },
    coverImage: { type: String, default: '' },
    demoVideo: { type: String, default: '' },
    demoPoster: { type: String, default: '' },
    projectUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: true }
  },
  { timestamps: true }
);

const experienceSchema = new mongoose.Schema(
  {
    projectName: { ...localizedField, required: true },
    techStack: { type: [String], default: [] },
    description: { ...localizedField, required: true },
    achievement: localizedField,
    duration: localizedField,
    sortOrder: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
const Experience =
  mongoose.models.Experience || mongoose.model('Experience', experienceSchema);

const memoryPosts = [
  {
    _id: '691f3d210000000000000004',
    title: {
      zh: '跨域（CORS）实战：让 blog.zhdstudy.cloud 直接请求 yoji.zhdstudy.cyou',
      en: 'CORS in Practice: Calling yoji.zhdstudy.cyou Straight from blog.zhdstudy.cloud'
    },
    content: {
      zh: `# 跨域（CORS）实战：让 blog.zhdstudy.cloud 直接请求 yoji.zhdstudy.cyou

我手上正好有两个线上项目：这个博客 [blog.zhdstudy.cloud](https://blog.zhdstudy.cloud)（Vue 3 + Express），和 Yoji 背单词后台 [yoji.zhdstudy.cyou](https://yoji.zhdstudy.cyou)（Next.js 前端 + Express API）。两者协议都是 https，但主机名不同 —— 这就足够构成跨域。

这篇文章不背定义：下面的"跨域实验室"会让当前页面真实发出 5 个 fetch，有的能读到响应，有的会被浏览器拦下来。跑完再回头解释为什么，以及生产里三种放行方式各自要注意什么。

## 同源策略只看三件事

- 协议、主机名、端口三者完全相同才算同源，任何一个不同就是跨域。
- \`https://blog.zhdstudy.cloud\` 与 \`https://yoji.zhdstudy.cyou\`：主机名不同 → 跨域。
- \`https://zhdstudy.cloud\` 与 \`https://www.zhdstudy.cloud\` 同样是跨域，www 是主机名的一部分。
- 跨域限制是**浏览器**的行为。用 curl、Postman 或你自己的服务端去请求同一个地址，永远不会被"跨域"拦住 —— 服务端之间没有同源策略。
- 所以 CORS 报错不等于请求没发出去。下面第 4 个场景里，请求其实已经到达 yoji 的 nginx 并被正常处理（对方日志里有记录），只是浏览器在把响应交给 JS 之前检查了响应头，决定不给你看。

## 动手：这一页真实发出的请求

[[cors-lab]]

## 五个场景，两种结果

**场景 1：同源对照。** 请求本站 \`/api/health\`，协议、域名、端口全一致，压根不进入 CORS 流程。留着它是为了说明：跨域不是"请求外网"，而是"换了源"。

**场景 2：普通跨域 GET，成功。** 用 curl 能看到浏览器看到的东西：

\`\`\`
curl -i -H "Origin: https://blog.zhdstudy.cloud" https://yoji.zhdstudy.cyou/healthz

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: https://blog.zhdstudy.cloud
Vary: Origin

{"status":"ok","uptime":376765,"time":"2026-11-20T09:34:37.862Z"}
\`\`\`

- \`Access-Control-Allow-Origin\` 是唯一的通行证：服务端在响应里声明"我允许这个源读我的响应"。
- 这里的值不是 \`*\`，而是把我请求头里的 \`Origin\` 原样回显，同时带上 \`Vary: Origin\`。\`Vary\` 不是可有可无的 —— 少了它，CDN 或浏览器缓存可能把 A 源的响应发给 B 源。
- 一个容易忽略的点：yoji 的 \`/api/health\` 其实是 404（\`{"code":1007,"message":"接口不存在"}\`），但这个 404 **同样带 CORS 头**，因为 \`cors()\` 中间件挂在路由之前，错误响应也走它。反过来如果把 CORS 放在路由后面，前端看到的就会是"接口 404"叠加"跨域被拦"两个问题，排查体验极差。

**场景 3：加一个自定义头，多一次预检。**

\`\`\`
curl -i -X OPTIONS https://yoji.zhdstudy.cyou/api/ \\
  -H "Origin: https://blog.zhdstudy.cloud" \\
  -H "Access-Control-Request-Method: GET" \\
  -H "Access-Control-Request-Headers: x-requested-with"

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://blog.zhdstudy.cloud
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type,x-requested-with
\`\`\`

浏览器眼里的"简单请求"只有这些：方法是 GET / HEAD / POST，请求头只带 Accept、Accept-Language、Content-Language 与 Content-Type（且值限于 \`application/x-www-form-urlencoded\`、\`multipart/form-data\`、\`text/plain\`）。超出这个范围，浏览器会先发一次 OPTIONS 预检：

- 方法是 PUT / PATCH / DELETE → 预检。
- 带自定义头，比如 \`Authorization\`、\`X-Requested-With\` → 预检。
- POST 发 \`application/json\` → 预检。这是前后端分离项目里最常见的那条"莫名多出来的请求"。
- 预检不通过，真实请求根本不会发出：Network 面板里只有一条 OPTIONS，状态显示 CORS error。
- 预检结果可以被缓存，服务端回 \`Access-Control-Max-Age: 86400\`，浏览器一天内就不会重复预检。

**场景 4：请求首页 HTML，被拦。** 同样是 yoji 这个域名，\`/healthz\`、\`/api/\` 能读，\`/\` 读不了。因为 \`/\` 由 nginx 直接返回 Next.js 的静态 HTML，压根没经过 Node 的 \`cors()\`，响应里没有任何 \`Access-Control-Allow-Origin\`。

结论：**CORS 是逐个响应生效的，不是"这个域名开了跨域"。** 同一台机器上放行 \`/api/\` 而拦住 \`/\`，完全可以并存。

**场景 5：带上 Cookie，照样被拦。** 目标还是刚刚成功的 \`/healthz\`，只是 fetch 加了 \`credentials: 'include'\`。yoji 的 \`cors()\` 没开 credentials，响应里缺 \`Access-Control-Allow-Credentials: true\`，浏览器直接拒绝。带凭证时规则更严：

- \`Access-Control-Allow-Origin\` 不能是 \`*\`，必须是精确的源。
- 必须有 \`Access-Control-Allow-Credentials: true\`。
- 前端必须显式 \`credentials: 'include'\`（axios 里是 \`withCredentials: true\`）。
- 三者缺一不可，而且跨站 Cookie 本身还得是 \`SameSite=None; Secure\`。

## 为什么这个博客自己不需要配 CORS

博客生产环境的 nginx 里只有这么一段：

\`\`\`
location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
\`\`\`

- 前端构建时 \`VITE_API_BASE_URL=/api\`，浏览器请求的是 \`https://blog.zhdstudy.cloud/api/posts\` —— 与页面同源，CORS 全程不参与。
- 这是生产环境最省心的方案：把"跨域"变成"同源 + 服务端转发"，顺带省掉预检、隐藏后端端口、统一上 HTTPS 与限流。
- 开发环境的等价做法是 Vite 的 \`server.proxy\`，把 \`/api\` 转发到 \`http://localhost:4000\`，浏览器同样只看到同源请求。

## 三种放行方式

### 一、应用层（推荐）

yoji 后端的真实代码，\`server/src/app.js\`：

\`\`\`
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',') }));
\`\`\`

配置来自 \`corsOrigin: process.env.CORS_ORIGIN || '*'\`。

- \`origin: true\` 的含义是"把请求的 Origin 反射回去"，而不是回 \`*\`，这就是 curl 里看到 \`Access-Control-Allow-Origin: https://blog.zhdstudy.cloud\` 的原因。
- 反射任意 Origin 在**不带凭证**时基本无害（等于公开 API）；但一旦哪天要带 Cookie，就必须换成白名单，否则等于允许任何网站携带用户凭证调用你的接口。
- 这个博客的后端就是白名单写法：

\`\`\`
const corsOptions =
  config.clientOrigin === '*'
    ? { origin: true, credentials: true }
    : { origin: config.clientOrigin, credentials: true };

app.use(cors(corsOptions));
\`\`\`

生产环境 \`CLIENT_ORIGIN=https://blog.zhdstudy.cloud\`，只有它能带凭证跨域访问博客接口。

### 二、nginx 层

应用不方便改，或者连静态资源也要放行时：

\`\`\`
location /api/ {
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods 'GET,POST,PUT,PATCH,DELETE,OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type,Authorization' always;
        add_header Access-Control-Max-Age 86400 always;
        return 204;
    }
    add_header Access-Control-Allow-Origin $http_origin always;
    proxy_pass http://127.0.0.1:3000;
}
\`\`\`

两个坑我都踩过：

- \`add_header\` 必须带 \`always\`，否则 4xx / 5xx 响应不带 CORS 头，前端看到的是"接口报错"叠加"跨域被拦"。
- nginx 的 \`add_header\` 有继承规则：location 里只要写了任意一条 \`add_header\`，server / http 层的 \`add_header\` 就全部失效，HSTS 之类的头会跟着一起消失，需要在新 location 里重写一遍。
- 上面是"反射任意 Origin"的写法，只适合公开只读接口；要收紧就用 \`map $http_origin $cors_origin { ... }\` 做白名单，再把 \`$cors_origin\` 填进去。

### 三、反向代理同源化

见上一节，博客用的就是这个，也是我最推荐的默认选项。

## 排查清单

- 先看 Network 里那条请求的 Response Headers 有没有 \`Access-Control-Allow-Origin\`，值是否**恰好等于**当前页面的源：协议、子域、端口都要对，末尾不能多斜杠，http 与 https 不通用。
- 有 OPTIONS 就先看 OPTIONS：预检失败，真实请求不会发。检查 \`Access-Control-Allow-Headers\` 是否覆盖你实际发送的每一个自定义头。
- 4xx / 5xx 也要带 CORS 头：nginx 用 \`always\`，Express 把 \`cors()\` 放在路由与错误处理之前。
- 带 Cookie 时记住"精确 Origin + Allow-Credentials + 前端 include"三件套，另外 Cookie 要 \`SameSite=None; Secure\`。
- \`Access-Control-Allow-Origin\` 这类头默认对 JS 不可见（安全列表只有 Cache-Control、Content-Language、Content-Length、Content-Type、Expires、Last-Modified、Pragma），前端要读就得让服务端加 \`Access-Control-Expose-Headers\`。
- 服务端日志里有请求、浏览器却报 CORS —— 正常现象，说明请求到了，是响应没被放行，别急着重启服务。
- 改完服务端配置一定用**无痕窗口**复测，浏览器会缓存预检结果，也会缓存失败。

## 小结

- 跨域不是"请求失败"，而是"响应不给 JS 读"。
- CORS 逐个响应生效，同一域名下 \`/api/\` 放行、\`/\` 不放行可以同时存在。
- 生产里最稳的做法往往是别跨域：反向代理把接口挂到同源路径下。
- 必须跨域时优先在应用层配白名单；用 nginx 补则注意 \`always\` 与 \`add_header\` 的继承规则。
- 带凭证时规则最严，精确 Origin、Allow-Credentials、前端 include 缺一不可。`,
      en: `# CORS in Practice: Calling yoji.zhdstudy.cyou Straight from blog.zhdstudy.cloud

I happen to run two live projects: this blog, [blog.zhdstudy.cloud](https://blog.zhdstudy.cloud) (Vue 3 + Express), and the Yoji vocabulary admin app, [yoji.zhdstudy.cyou](https://yoji.zhdstudy.cyou) (Next.js front end + Express API). Both speak https, but the hosts differ — which is all it takes to be cross-origin.

No definitions to memorise here: the CORS Lab below fires five real fetch requests from this very page. Some responses come back readable, some are withheld by the browser. Once you have seen both, we explain why, and what to watch out for in each of the three ways to allow cross-origin traffic in production.

## Same-origin comes down to exactly three things

- Protocol, host and port must all match; any single difference makes it cross-origin.
- \`https://blog.zhdstudy.cloud\` vs \`https://yoji.zhdstudy.cyou\`: different host → cross-origin.
- \`https://zhdstudy.cloud\` vs \`https://www.zhdstudy.cloud\` is cross-origin too — www is part of the host.
- The restriction is enforced by the **browser**. curl, Postman or your own backend can call the same URL freely; there is no same-origin policy between servers.
- So a CORS error does not mean the request never went out. In scenario 4 the request does reach Yoji's nginx and is processed normally (it shows up in their logs) — the browser just inspects the response headers before handing the body to JS, and decides not to.

## Hands-on: requests this page really sends

[[cors-lab]]

## Five scenarios, two outcomes

**Scenario 1: same-origin control.** Calling this site's own \`/api/health\` — identical protocol, host and port, so CORS is never involved. It is here to make the point that cross-origin means "a different origin", not "somewhere out on the internet".

**Scenario 2: a plain cross-origin GET that succeeds.** curl reveals what the browser sees:

\`\`\`
curl -i -H "Origin: https://blog.zhdstudy.cloud" https://yoji.zhdstudy.cyou/healthz

HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
Access-Control-Allow-Origin: https://blog.zhdstudy.cloud
Vary: Origin

{"status":"ok","uptime":376765,"time":"2026-11-20T09:34:37.862Z"}
\`\`\`

- \`Access-Control-Allow-Origin\` is the only pass that matters: the server declares "this origin may read my response".
- The value is not \`*\` but the \`Origin\` from my request header echoed back, together with \`Vary: Origin\`. That \`Vary\` is not optional — without it a CDN or browser cache may serve an A-origin response to a B-origin page.
- Easy to miss: Yoji's \`/api/health\` is actually a 404 (\`{"code":1007,"message":"接口不存在"}\`), yet that 404 **also carries CORS headers**, because the \`cors()\` middleware sits before the routes and error responses pass through it too. Put CORS after your routes instead and the front end sees "404" stacked on top of "blocked by CORS" — miserable to debug.

**Scenario 3: one custom header adds a preflight.**

\`\`\`
curl -i -X OPTIONS https://yoji.zhdstudy.cyou/api/ \\
  -H "Origin: https://blog.zhdstudy.cloud" \\
  -H "Access-Control-Request-Method: GET" \\
  -H "Access-Control-Request-Headers: x-requested-with"

HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://blog.zhdstudy.cloud
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type,x-requested-with
\`\`\`

A "simple request" in the browser's eyes means: method GET / HEAD / POST, and only Accept, Accept-Language, Content-Language and Content-Type among custom-ish headers (with Content-Type limited to \`application/x-www-form-urlencoded\`, \`multipart/form-data\` or \`text/plain\`). Anything beyond that triggers an OPTIONS preflight first:

- Method PUT / PATCH / DELETE → preflight.
- A custom header such as \`Authorization\` or \`X-Requested-With\` → preflight.
- POST with \`application/json\` → preflight. This is the "mysterious extra request" every separated front/back-end project meets.
- If the preflight fails, the real request is never sent: the Network panel shows a single OPTIONS entry marked CORS error.
- Preflight results are cacheable — respond with \`Access-Control-Max-Age: 86400\` and the browser skips preflighting for a day.

**Scenario 4: fetching the index HTML gets blocked.** Same domain, yet \`/healthz\` and \`/api/\` are readable while \`/\` is not. That is because \`/\` is served straight from nginx as static Next.js HTML and never passes through Node's \`cors()\`, so the response carries no \`Access-Control-Allow-Origin\` at all.

Takeaway: **CORS applies per response, not per domain.** Allowing \`/api/\` while blocking \`/\` on the same machine is perfectly normal.

**Scenario 5: add cookies and it is blocked again.** Same \`/healthz\` that just succeeded, only now fetch runs with \`credentials: 'include'\`. Yoji's \`cors()\` does not enable credentials, so \`Access-Control-Allow-Credentials: true\` is missing and the browser refuses. Credentialed requests follow stricter rules:

- \`Access-Control-Allow-Origin\` cannot be \`*\`; it must be the exact origin.
- \`Access-Control-Allow-Credentials: true\` must be present.
- The front end must opt in explicitly with \`credentials: 'include'\` (\`withCredentials: true\` in axios).
- All three are mandatory, and the cross-site cookie itself still needs \`SameSite=None; Secure\`.

## Why this blog needs no CORS configuration at all

The production nginx for this blog contains just this block:

\`\`\`
location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
\`\`\`

- The client is built with \`VITE_API_BASE_URL=/api\`, so the browser requests \`https://blog.zhdstudy.cloud/api/posts\` — same origin as the page, and CORS never enters the picture.
- This is the most comfortable production setup: turn "cross-origin" into "same-origin plus server-side forwarding", and you also drop the preflight, hide the backend port, and apply HTTPS and rate limiting in one place.
- The development-time equivalent is Vite's \`server.proxy\`, forwarding \`/api\` to \`http://localhost:4000\` so the browser again only ever sees same-origin requests.

## Three ways to allow cross-origin access

### 1. Application layer (recommended)

Real code from the Yoji backend, \`server/src/app.js\`:

\`\`\`
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',') }));
\`\`\`

with \`corsOrigin: process.env.CORS_ORIGIN || '*'\` in the config.

- \`origin: true\` means "reflect the request Origin back", not "send \`*\`" — which is exactly why curl shows \`Access-Control-Allow-Origin: https://blog.zhdstudy.cloud\`.
- Reflecting any Origin is largely harmless **without credentials** (it is a public API then). The moment cookies are involved you must switch to an allow-list, otherwise any website can call your API with a user's credentials.
- This blog's backend uses the allow-list form:

\`\`\`
const corsOptions =
  config.clientOrigin === '*'
    ? { origin: true, credentials: true }
    : { origin: config.clientOrigin, credentials: true };

app.use(cors(corsOptions));
\`\`\`

In production \`CLIENT_ORIGIN=https://blog.zhdstudy.cloud\`, so only this site may make credentialed cross-origin calls.

### 2. nginx layer

Useful when the application is hard to change, or static assets must be exposed too:

\`\`\`
location /api/ {
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin $http_origin always;
        add_header Access-Control-Allow-Methods 'GET,POST,PUT,PATCH,DELETE,OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type,Authorization' always;
        add_header Access-Control-Max-Age 86400 always;
        return 204;
    }
    add_header Access-Control-Allow-Origin $http_origin always;
    proxy_pass http://127.0.0.1:3000;
}
\`\`\`

Two traps I hit myself:

- \`add_header\` needs \`always\`, otherwise 4xx / 5xx responses ship without CORS headers and the front end sees "API error" stacked on "blocked by CORS".
- nginx \`add_header\` inheritance: as soon as a location declares any \`add_header\`, every \`add_header\` from the server / http level stops applying. HSTS and friends silently disappear and must be repeated inside the new location.
- The snippet above reflects any Origin and is only suitable for public read-only endpoints. To tighten it, build an allow-list with \`map $http_origin $cors_origin { ... }\` and use \`$cors_origin\` instead.

### 3. Reverse proxy to make it same-origin

See the previous section — that is what this blog does, and it is my default recommendation.

## Debugging checklist

- Inspect the Response Headers of that request in the Network panel for \`Access-Control-Allow-Origin\` and check it is **exactly** the page's origin: protocol, subdomain and port must match, no trailing slash, and http is not https.
- If there is an OPTIONS request, look at it first: a failed preflight means the real request never went out. Verify \`Access-Control-Allow-Headers\` covers every custom header you actually send.
- 4xx / 5xx responses need CORS headers too: \`always\` in nginx, \`cors()\` before routes and error handlers in Express.
- With cookies, remember the trio "exact Origin + Allow-Credentials + client-side include", plus \`SameSite=None; Secure\` on the cookie.
- Headers like \`Access-Control-Allow-Origin\` are invisible to JS by default (the safelist is Cache-Control, Content-Language, Content-Length, Content-Type, Expires, Last-Modified, Pragma). If the client must read one, the server has to add \`Access-Control-Expose-Headers\`.
- Request present in the server logs but the browser reports CORS — normal. The request arrived; the response was not released. Do not restart the service.
- After changing server config, retest in an **incognito window**: browsers cache preflight results, and they cache failures too.

## Summary

- Cross-origin does not mean "the request failed"; it means "the response is not released to JS".
- CORS applies per response, so \`/api/\` allowed and \`/\` blocked can coexist on one domain.
- The sturdiest production answer is often to avoid cross-origin entirely: reverse-proxy the API onto a same-origin path.
- When you must go cross-origin, configure an allow-list in the application; if nginx has to do it, mind \`always\` and the \`add_header\` inheritance rule.
- Credentialed requests are the strictest: exact Origin, Allow-Credentials and client-side include are all mandatory.`
    },
    summary: {
      zh: '用博客 blog.zhdstudy.cloud 真实请求 yoji.zhdstudy.cyou，5 个可点击的跨域场景演示同源策略、预检、带凭证与静态资源的差别，并给出应用层、nginx、反向代理三种放行方案与排查清单。',
      en: 'Five clickable scenarios firing real requests from blog.zhdstudy.cloud to yoji.zhdstudy.cyou — same-origin policy, preflight, credentials and static files — plus three ways to allow CORS (app layer, nginx, reverse proxy) and a debugging checklist.'
    },
    category: {
      zh: '后端',
      en: 'Backend'
    },
    tags: ['cors', 'http', 'nginx', 'express', 'browser', 'security'],
    coverImage: '',
    isPublished: true,
    createdAt: new Date('2026-11-20T10:00:00.000Z'),
    updatedAt: new Date('2026-11-20T10:00:00.000Z')
  },
  {
    _id: '685a00000000000000000002',
    title: {
      zh: '自习室预约系统：用区间重叠校验解决抢座超卖',
      en: 'Study Room Booking: Preventing Seat Overselling with Interval-Overlap Checks'
    },
    content: {
      zh: `# 自习室预约系统：用区间重叠校验解决抢座超卖

这个项目是一个前后端分离的自习室座位预约平台：学生按时间段选座、签到、取消，管理端做用户、座位、预约与公告管理，并配 ECharts 数据看板。这里重点记录我在"防止座位超卖与重复预约"上的设计与实现。

## 技术栈

- 前端：Vue 3 + TypeScript + Vite + Element Plus + Tailwind CSS + Pinia + ECharts
- 后端：FastAPI（异步）+ SQLAlchemy 2.0 异步 ORM + aiomysql + Pydantic v2
- 数据库：MySQL / TiDB Cloud（公网 TLS）
- 部署：前端 Vercel、后端 Render、数据库 TiDB Cloud 三地分离

## 数据模型

四张核心表：\`user\`、\`room\`、\`seat\`、\`reservation\`。预约表记录 \`user_id\`、\`seat_id\`、\`date\`、\`start_time\`、\`end_time\` 与 \`status\`，外键级联删除，座位带 \`status\`（正常/维护）与 \`has_power\` 属性。

## 核心：防超卖的区间重叠校验

抢座场景最怕两件事：同一座位同一时间段被约两次（超卖），以及同一用户在同一时间段约多个座位。我用经典的时间区间重叠谓词来解决：两个区间 \`[s1,e1)\` 与 \`[s2,e2)\` 重叠，当且仅当 \`s1 < e2 且 e1 > s2\`。

对"座位"维度查询是否已有活跃预约与之重叠：

\`\`\`python
select(Reservation).where(
    Reservation.seat_id == new.seat_id,
    Reservation.date == new.date,
    Reservation.status.in_(ACTIVE_STATUSES),
    Reservation.start_time < new.end_time,
    Reservation.end_time > new.start_time,
)
\`\`\`

对"用户"维度做同样的重叠查询，防止一人多约；若查到的记录与本次完全相同（同座位同起止），则识别为重复提交并给出专门提示。任一校验命中即返回 400，拒绝落库。

在此之前还有边界校验：拒绝过去日期、要求结束时间晚于开始时间、座位必须处于可预约状态。

## 预约状态机

预约有四个状态：\`pending\`（待使用）→ \`active\`（使用中，签到触发）→ \`completed\`（已完成），以及任意时刻可 \`cancelled\`（取消）。只有活跃状态（pending/active）参与冲突校验，已取消/已完成的记录不占用时间段，从而允许同一座位在不同时段被复用。

## 异步与部署

后端全链路异步：FastAPI + async SQLAlchemy + aiomysql，启动时 \`create_all\` 自动补齐表结构，OpenAPI 自动生成交互文档用于联调。部署上把前端放 Vercel、后端放 Render、数据库放 TiDB Cloud，通过环境变量 \`VITE_API_BASE_URL\` 与 \`DATABASE_URL\` 串联，贴近真实生产的拆分方式。

## 收获

这个项目让我把"并发冲突"从概念落到了具体的 SQL 谓词与状态机设计上：用区间重叠条件把超卖挡在数据库查询层，用状态机管理预约生命周期，再用异步栈与分离部署保证性能与可维护性。它是我在 Python 全栈方向上一个完整、可答辩的落地作品。`,
      en: `# Study Room Booking: Preventing Seat Overselling with Interval-Overlap Checks

This project is a separated front/back-end study-room seat reservation platform: students book time slots, check in and cancel; admins manage users, seats, reservations and notices, with an ECharts dashboard. Here I focus on how I prevented seat overselling and double-booking.

## Tech Stack

- Frontend: Vue 3 + TypeScript + Vite + Element Plus + Tailwind CSS + Pinia + ECharts
- Backend: async FastAPI + SQLAlchemy 2.0 async ORM + aiomysql + Pydantic v2
- Database: MySQL / TiDB Cloud (public TLS)
- Deployment: front-end on Vercel, API on Render, DB on TiDB Cloud

## Data Model

Four core tables: \`user\`, \`room\`, \`seat\`, \`reservation\`. A reservation stores \`user_id\`, \`seat_id\`, \`date\`, \`start_time\`, \`end_time\` and \`status\`, with cascade foreign keys; seats carry a \`status\` (normal/maintenance) and \`has_power\` flag.

## Core: Interval-Overlap Checks Against Overselling

Two failures matter most in seat grabbing: the same seat booked twice for the same slot (overselling), and one user holding multiple seats in the same slot. I use the classic interval-overlap predicate: \`[s1,e1)\` and \`[s2,e2)\` overlap iff \`s1 < e2 AND e1 > s2\`.

For the seat dimension, query existing active reservations that overlap:

\`\`\`python
select(Reservation).where(
    Reservation.seat_id == new.seat_id,
    Reservation.date == new.date,
    Reservation.status.in_(ACTIVE_STATUSES),
    Reservation.start_time < new.end_time,
    Reservation.end_time > new.start_time,
)
\`\`\`

Run the same overlap query on the user dimension to prevent one person holding several seats; if the matched record is identical (same seat, same start/end), treat it as a duplicate submission with a dedicated message. Any hit returns 400 and rejects the write.

Boundary checks run first: reject past dates, require end > start, and require the seat to be bookable.

## Reservation State Machine

Four states: \`pending\` -> \`active\` (on check-in) -> \`completed\`, plus \`cancelled\` at any time. Only active states (pending/active) participate in conflict checks, so cancelled/completed records free the slot for reuse in other periods.

## Async & Deployment

The backend is fully async: FastAPI + async SQLAlchemy + aiomysql, with \`create_all\` on startup and auto-generated OpenAPI docs for integration. Deployment splits front-end (Vercel), API (Render) and DB (TiDB Cloud), wired via \`VITE_API_BASE_URL\` and \`DATABASE_URL\`, mirroring real production topology.

## Takeaways

This project turned "concurrency conflict" from a concept into concrete SQL predicates and a state machine: the overlap condition stops overselling at the query layer, the state machine governs the reservation lifecycle, and the async stack plus separated deployment keep it performant and maintainable. It is a complete, defensible Python full-stack deliverable.`
    },
    summary: {
      zh: '基于 FastAPI + SQLAlchemy 异步栈的自习室预约系统，重点讲解用时间区间重叠谓词防止座位超卖与重复预约，以及预约状态机与三地分离部署。',
      en: 'A FastAPI + async SQLAlchemy study-room booking system, focusing on interval-overlap predicates to prevent overselling and double-booking, plus a reservation state machine and three-tier deployment.'
    },
    category: {
      zh: '后端',
      en: 'Backend'
    },
    tags: ['fastapi', 'sqlalchemy', 'async', 'mysql', 'tidb', 'vue', 'element-plus', 'echarts', 'concurrency'],
    coverImage: '',
    isPublished: true,
    createdAt: new Date('2026-11-17T12:00:00.000Z'),
    updatedAt: new Date('2026-11-17T12:00:00.000Z')
  },
{
    _id: '691b7c5a0000000000000001',
    title: {
      zh: 'Yoji 三端开发实录：从 Electron 安装失败到 OSS 迁移',
      en: 'Building Yoji: From a Broken Electron Installer to Object Storage'
    },
    content: {
      zh: `# Yoji 三端开发实录：从 Electron 安装失败到 OSS 迁移

Yoji（要记单词）是我这学期做的三端项目：鸿蒙 App 负责背单词和视频学习，Node 后台提供接口与数据，Windows 管理端负责运营。线上地址是 yoji.zhdstudy.cyou。

这篇文章不复述功能列表，只记录开发过程中真正卡住我的问题和最后沉淀下来的做法。

## 项目结构

- 鸿蒙 App：ArkTS / ArkUI，卡片学习、选择题复习、错词本、学习日历、视频学习
- 后台：Node 24 + Express + node:sqlite，单文件数据库，JWT 鉴权
- 管理端：Next.js 14 静态导出 + Electron，仪表盘、用户、视频、词库、审计日志

三端共享同一套接口，管理端打包成 Windows 安装包，App 通过 HTTP 拉数据。

## 一、安装完成后打不开：Cannot find module electron-serve

现象：安装包能装，但一启动就弹主进程异常：

A JavaScript error occurred in the main process
Error: Cannot find module 'electron-serve'

排查：主进程用 require 加载 electron-serve 来做静态文件服务，但这个包被放在 devDependencies。electron-builder 只会把 dependencies 打进 asar，所以开发环境能跑，装完就缺模块。另外这个包是纯 ESM，在 CommonJS 主进程里 require 本身也不稳。

修复：不再依赖第三方包，直接用 Electron 内置的 protocol.handle 注册自定义协议 app://，从打包目录读取 out 下的静态文件。处理了四件事：目录映射到 index.html、path.relative 防止路径穿越、带扩展名但文件不存在返回 404、其余路径回退到 index.html 支持前端路由。

经验：Electron 运行时需要的包必须放在 dependencies；Next 静态导出后其实不需要任何运行时 node_modules。

## 二、169MB 的安装包

第一版安装包 169MB，asar 151MB。解包后发现 asar 里有 17785 个 node_modules 文件，next、react、recharts 全被打进去了，而真正需要的只有 out 里的静态页面。

处理：把全部生产依赖移到 devDependencies，build.files 只保留 out、main.js、package.json，开启 asar 和 maximum 压缩，electronLanguages 只留 zh-CN 和 en-US。

结果：asar 从 151MB 降到 1.9MB，安装包从 169MB 降到 113MB，安装时间明显缩短。

经验：安装包大小由依赖归属决定，不由源码行数决定。静态导出的前端，构建产物就是全部运行时。

## 三、真正让打包失败的，是文件 ACL

体积问题解决后，NSIS 仍然在最后一步失败：

Error: process failed 2

换输出目录后 7za 报 cannot open file，System ERROR: 拒绝访问。同一个 shell 里 echo 写文件却成功，说明不是普通权限。

用 icacls 检查发现项目根目录带一条显式的 Everyone 拒绝 ACE，整棵树还带着 Low Mandatory Level 完整性标签——这是之前沙箱工具留下的。低完整性进程无法写工作区外的普通目录，NSIS 在写卸载程序时失败，于是退出码 2。

修复：移除 Everyone 的拒绝项，把目录树的完整性级别重置为 Medium。之后打包一次通过。

期间还遇到 asar 被其他进程占用（EBUSY），mv 和删除都报 Device or resource busy。最后的做法不是杀进程，而是换一个新的输出目录，让旧文件留在那里。

经验：Windows 上的“拒绝访问”不一定是权限，也可能是完整性级别；被占用的构建产物，换目录比硬删更安全。

## 四、把后台从“能用”做到“合格”

后台最初只有 CRUD。为了让它像一个真正的运营后台，补了几块：

- 审计日志：登录成功/失败、删除用户、上传/修改/删除视频与词表、导出用户，全部落库，带操作人、对象、IP、时间
- 用户导出：CSV 带 BOM 和 RFC4180 转义，Excel 打开不乱码
- 接口文档：OpenAPI 3.0.3，提供 /api 索引、/api/openapi.json、/api/docs（Swagger UI）
- 修掉 /api 无斜杠时的 301：Nginx 增加精确匹配的 location

经验：接口文档最好和代码放在一起生成，并且用真实路由数量核对；改字段时同步改文档，否则很快就漂移。

## 五、把 650MB 视频搬出服务器

服务器是 2C2G，公网带宽只有 1–5Mbps，30MB 的视频就能把带宽打满；磁盘里 655MB 媒体文件也占地方。

先纠正一个概念：视频占的是磁盘和带宽，不是内存。2C2G 的瓶颈在带宽，不在内存。

方案：阿里云 OSS 私有桶 + 桶策略只允许匿名 GetObject；配置 CORS 供浏览器直传；服务端用 AK 生成上传 policy 和签名，浏览器直接 PUT 到 OSS；数据库存绝对 URL；存量文件用 ossutil 内网迁移；最后用脚本批量改库并备份。

迁移结果：22 个文件、685MB，内网 5.2 秒传完；6 个视频和 6 张缩略图逐个验证 200/206。

经验：迁移方案必须包含回滚脚本，不能只有正向脚本；数据库里存相对路径，迁移时只改库，客户端不用发版。

## 六、OSS 突然返回 UserDisable

迁移完成第二天，后台视频页 6 张缩略图全部裂开，浏览器报 ERR_BLOCKED_BY_ORB。

排查：curl 缩略图返回 403，响应体是 Code=UserDisable、EC=0003-00000801；带签名的 ossutil 请求同样被拒；但同一个 AccessKey 调 STS 仍然正常。说明不是桶策略，也不是 RAM 用户被删，而是账号在 OSS 服务层被停用（常见原因：欠费、风控、违规）。

处置：把数据库里的视频地址改回 /media 相对路径，注释 OSS 环境变量，重启服务。后台恢复本地模式，缩略图立刻正常，站点和 App 都没有中断。等账号恢复后再把环境变量打开、跑一次正向改库脚本即可。

经验：跨域图片报 ORB 时先看响应体，不要先怀疑前端；云服务要把“可回滚”设计进数据模型。

## 七、鸿蒙端：沉浸式与系统组件

顶部和底部一开始没有沉浸式，状态栏是灰的。处理方式是：窗口开启全屏布局，读取状态栏和导航条的安全区高度，写进 AppStorage，页面内容按高度加 padding，底部 TabBar 的 margin 跟随导航条高度。这样不用改每个页面，只在首页统一处理。

原本想换成华为的 HdsTabs / HdsNavigation，查 SDK 发现这两个组件是 6.0.0(20) 才引入的，而项目 compatibleSdkVersion 是 5.0.2(14)。直接换会让 5.x 设备崩溃，所以暂时保留自绘 TabBar，把升级 min API 作为后续项。

另外补了错词本和 6 级间隔复习：答错进入错词本并清零等级，答对升级，间隔为 1/2/4/7/15/30 天，满级视为掌握。数据落在本地 Store，同时扩展了进度快照。

经验：跨端同步的进度快照是白名单契约，App 模型和后端 sanitize/merge 必须同时改，否则新字段上云会被静默丢掉。

## 八、构建环境的两个小坑

- ArkTS 编译通过不代表能打包，PackageHap 还需要 Java；JAVA_HOME 指向带空格的 Program Files 路径时会报 spawn java ENOENT，用 junction 建一个短路径即可
- 本机 shell 里存在 ELECTRON_RUN_AS_NODE 时，直接运行 Electron 可执行文件会变成 Node，调试时要先 unset

## 九、十条经验

1. 先复现再修，响应体和日志比猜测快
2. 安装包大小看依赖归属，不看源码
3. Windows 权限问题要查完整性级别
4. Electron 静态资源用内置协议，少引第三方 serve
5. 数据库存相对路径，迁移只改库
6. 迁移脚本默认 dry-run，写库前自动备份
7. 接口文档随代码生成，并用路由数核对
8. 云服务故障先回滚保可用，再定位原因
9. 跨端字段是契约，白名单必须同步
10. 文档写“为什么”，不只写“怎么做”

## 写在最后

这个项目让我第一次把 App、后台、桌面端、对象存储和 CDN 的链路完整跑通。比起多写几个页面，更有价值的是学会了怎么在出问题时快速定位、怎么把一次修复沉淀成可复用的流程。

下一步准备继续补 App 的拼写和听音模式，以及后台的发布回滚能力。`,
      en: `# Building Yoji: From a Broken Electron Installer to Object Storage

Yoji is a three-part vocabulary learning project: a HarmonyOS app for learning and video lessons, a Node backend for APIs and data, and a Windows admin console for operations. It runs at yoji.zhdstudy.cyou.

This post is not a feature list. It records the problems that actually blocked me and the practices I kept afterwards.

## Structure

- HarmonyOS app: ArkTS / ArkUI, flashcards, quizzes, wrong-word book, calendar, video learning
- Backend: Node 24 + Express + node:sqlite, single-file database, JWT auth
- Admin: Next.js 14 static export + Electron, dashboard, users, videos, wordbooks, audit log

All three share one API. The admin ships as a Windows installer, and the app pulls data over HTTP.

## 1. The installer opened to a missing module

The app installed fine but crashed on launch with:

A JavaScript error occurred in the main process
Error: Cannot find module 'electron-serve'

The main process required electron-serve to serve static files, but the package sat in devDependencies. electron-builder only packs dependencies, so it worked in development and disappeared after packaging. The package is also pure ESM, which is awkward to require from a CommonJS main process.

Fix: drop the package and register a custom app:// protocol with Electron's built-in protocol.handle. The handler maps directories to index.html, blocks path traversal with path.relative, returns 404 for missing files with extensions, and falls back to index.html for client-side routes.

Lesson: anything the packaged app needs at runtime belongs in dependencies. A statically exported Next app needs no runtime node_modules at all.

## 2. A 169MB installer

The first installer was 169MB, with a 151MB asar. Unpacking it showed 17,785 node_modules files inside: next, react, recharts. The app only needed the exported out folder.

Fix: move all production dependencies to devDependencies, keep only out, main.js and package.json in build.files, enable asar and maximum compression, and limit electronLanguages to zh-CN and en-US.

Result: asar dropped from 151MB to 1.9MB, the installer from 169MB to 113MB, and installation became noticeably faster.

Lesson: installer size follows dependency ownership, not source size.

## 3. The real packaging failure was a file ACL

After shrinking the package, NSIS still failed at the last step with process failed 2. Building to another directory produced 7za errors: cannot open file, System ERROR: access denied. Writing a file with echo in the same shell worked, so it was not ordinary permissions.

icacls showed an explicit deny ACE for Everyone on the project root, and the whole tree carried a Low Mandatory Level integrity label, left over from an earlier sandbox tool. Low-integrity processes cannot write to normal directories outside the workspace, so NSIS failed while writing the uninstaller and exited with code 2.

Fix: remove the deny ACE and reset the tree to Medium integrity. Packaging then succeeded on the first try.

We also hit EBUSY because another process held app.asar open; mv and delete both reported Device or resource busy. Instead of killing the process, I built into a fresh output directory.

Lesson: on Windows, access denied can mean integrity level, not permissions; for locked build artifacts, switching output directories is safer than force-deleting.

## 4. Making the admin console production-grade

The admin started as plain CRUD. To make it a real operations console, I added:

- Audit log: login success/failure, user deletion, video and wordbook changes, CSV export, with operator, target, IP and time
- CSV export with BOM and RFC4180 escaping so Excel opens it correctly
- OpenAPI 3.0.3 docs: an /api index, /api/openapi.json and /api/docs with Swagger UI
- A fix for the 301 on /api without a trailing slash, using an exact Nginx location

Lesson: generate API docs next to the code and verify them against the real route count; update them with every field change or they drift immediately.

## 5. Moving 650MB of video off the server

The server has 2 vCPUs, 2GB RAM and only 1-5Mbps of public bandwidth, so a 30MB video can saturate it. The disk also held 655MB of media.

First, a correction: video consumes disk and bandwidth, not memory. The bottleneck was bandwidth.

Plan: a private OSS bucket with a bucket policy allowing anonymous GetObject only; CORS for browser uploads; a backend endpoint that signs an upload policy so the browser can PUT directly; absolute URLs in the database; ossutil over the internal network for existing files; and a script to rewrite the database with a backup.

Result: 22 files and 685MB transferred in 5.2 seconds over the internal network; all six videos and six thumbnails verified with 200/206 responses.

Lesson: a migration plan needs a rollback script, not just a forward script. Storing relative paths in the database meant switching back required only a database update, with no client release.

## 6. OSS started returning UserDisable

The next day, all six thumbnails broke and the browser reported ERR_BLOCKED_BY_ORB.

curl returned 403 with Code=UserDisable and EC=0003-00000801. Signed ossutil requests failed the same way, while STS GetCallerIdentity still returned 200. That ruled out bucket policy and a deleted RAM user: the account had been suspended at the OSS service layer, typically due to unpaid bills, risk control or a violation.

Response: rewrite the database URLs back to /media, comment out the OSS environment variables, restart. The console fell back to local mode, thumbnails recovered immediately, and neither the site nor the app went down. Once the account is restored, re-enable the variables and run the forward rewrite again.

Lesson: when a cross-origin image is blocked by ORB, read the response body first instead of blaming the frontend. Design rollback into the data model.

## 7. HarmonyOS: immersive layout and system components

The status bar was not immersive at first. The fix: enable full-screen layout, read the status bar and navigation indicator insets, store them in AppStorage, pad page content accordingly, and offset the tab bar by the navigation inset. This keeps the change in one place instead of every page.

I considered Huawei's HdsTabs and HdsNavigation, but the SDK marks them as 6.0.0(20), while the project targets compatibleSdkVersion 5.0.2(14). Switching would crash 5.x devices, so the custom tab bar stays and raising the minimum API is a later task.

I also added a wrong-word book and six-level spaced repetition: a wrong answer resets the level and schedules tomorrow, a correct answer raises it, with intervals of 1/2/4/7/15/30 days and mastery at the top level. Data lives in the local store and extends the progress snapshot.

Lesson: a cross-device progress snapshot is a whitelist contract. The app model and the backend sanitize/merge logic must change together, or new fields are silently dropped on sync.

## 8. Two build-environment traps

- ArkTS compilation passing does not mean packaging will: PackageHap needs Java. When JAVA_HOME points to a path with spaces under Program Files, it fails with spawn java ENOENT; a junction to a short path fixes it.
- If ELECTRON_RUN_AS_NODE is set in the shell, running the Electron binary behaves like Node. Unset it before debugging.

## 9. Ten lessons

1. Reproduce before fixing; response bodies and logs beat guessing
2. Installer size follows dependency ownership
3. On Windows, check integrity level for access-denied errors
4. Use Electron's built-in protocol for static assets
5. Store relative paths in the database so migration is a database change
6. Migration scripts should default to dry-run and back up before writing
7. Generate API docs from code and verify the route count
8. On cloud outages, roll back for availability first, then diagnose
9. Cross-device fields are contracts; keep whitelists in sync
10. Document why, not only how

## Closing

This project let me connect an app, a backend, a desktop client, object storage and a CDN end to end. More valuable than writing more pages was learning how to locate a failure quickly and turn one fix into a reusable process.

Next: spelling and listening modes in the app, and release rollback for the admin console.`
    },
    summary: {
      zh: '记录 Yoji 三端项目从 Electron 安装失败、169MB 安装包、文件 ACL、OSS 迁移到 UserDisable 故障的完整排查过程，以及沉淀下来的十条经验。',
      en: 'A full record of building Yoji: the broken Electron installer, a 169MB package, file ACL issues, an OSS migration, and the lessons that came out of it.'
    },
    category: {
      zh: '全栈项目',
      en: 'Full Stack'
    },
    tags: ['harmonyos', 'arkts', 'electron', 'nextjs', 'nodejs', 'sqlite', 'oss', 'nginx'],
    coverImage: '',
    demoVideo: '/projects/yoji-demo.mp4',
    demoPoster: '/projects/yoji-poster.jpg',
    projectUrl: 'https://yoji.zhdstudy.cyou',
    isPublished: true,
    createdAt: new Date('2026-11-17T11:45:00.000Z'),
    updatedAt: new Date('2026-11-17T11:45:00.000Z')
  },
  {
    _id: '6860b4f00000000000000003',
    title: {
      zh: 'zhdstudy.cloud：我的全栈项目从搭建到上线',
      en: 'zhdstudy.cloud: From Full-Stack Build To Production Launch'
    },
    content: {
      zh: `# zhdstudy.cloud：我的全栈项目从搭建到上线

这篇日志记录了我把 \`zhdstudy.cloud\` 从一个想法逐步落地为真实线上项目的过程。

## 项目背景

我希望做的不只是一个静态展示页，而是一个真正可以持续迭代的全栈项目。它既要有前台页面来展示内容，也要有后台能力来管理文章和项目经历，并且能够独立部署上线，形成完整闭环。

## 技术选型

这个项目采用了前后端分离的方式进行搭建：

- 前端：Vue 3、Vite、TypeScript、Vue Router、Pinia、Tailwind CSS
- 后端：Node.js、Express
- 数据层：MongoDB 兼容设计，同时保留本地内存模式，方便开发和演示
- 鉴权：JWT 管理后台登录状态
- 部署域名：\`zhdstudy.cloud\`

## 我做了什么

在这个项目里，我完整参与并实现了以下核心部分：

1. 设计并搭建了前端页面结构，包括首页、文章列表、文章详情、关于页和合作页。
2. 编写了 Node.js + Express 后端接口，用于文章与项目经历的读取、创建、编辑和删除。
3. 为后台管理系统实现了登录鉴权、文章管理和经历管理功能。
4. 设计了前后端通信的数据结构，支持中英文双语内容。
5. 处理了本地开发、接口联调、跨域配置以及部署上线后的访问问题。
6. 将项目发布到线上域名，使它从开发环境真正进入可访问、可展示、可维护的正式阶段。

## 上线后的意义

\`zhdstudy.cloud\` 的上线，对我来说不仅是把一个网站放到公网，更重要的是验证了我具备把一个全栈项目独立做完的能力。

从界面设计、功能开发、接口联调，到后台鉴权、内容管理和最终部署，这个过程让我对“完整项目交付”有了更清晰的理解。它也是我后续继续扩展功能、沉淀作品和展示技术能力的重要基础。

## 下一步计划

接下来，我会继续围绕这个项目迭代，包括：

- 优化后台内容编辑体验
- 增加更完善的文章分类与标签管理
- 持续补充项目日志与开发记录
- 进一步提升线上版本的稳定性与展示效果

如果说以前我是在学习单点技术，那么 \`zhdstudy.cloud\` 更像是我把这些技术真正串起来、做成一个完整作品的开始。`,
      en: `# zhdstudy.cloud: From Full-Stack Build To Production Launch

This post documents how I turned \`zhdstudy.cloud\` from an idea into a real production-ready full-stack project.

## Background

I did not want to build only a static showcase page. I wanted a real full-stack product that could keep evolving over time, with a public-facing website, an admin system for content management, and a complete deployment workflow.

## Tech Stack

The project is built with a separated front-end and back-end architecture:

- Frontend: Vue 3, Vite, TypeScript, Vue Router, Pinia, Tailwind CSS
- Backend: Node.js, Express
- Data layer: MongoDB-compatible design with an in-memory fallback for development and demos
- Authentication: JWT for admin access
- Production domain: \`zhdstudy.cloud\`

## What I Built

In this project, I implemented the following key parts:

1. Built the front-end pages, including the home page, posts list, post detail page, about page, and cooperation page.
2. Developed Node.js + Express APIs for reading, creating, editing, and deleting posts and project experiences.
3. Implemented the admin system with login authentication, post management, and experience management.
4. Designed the data structures between the front end and back end, including bilingual content support.
5. Solved local development issues, API integration, CORS configuration, and deployment-related access problems.
6. Deployed the project to a live domain so it became a real online product instead of a local demo.

## Why It Matters

Launching \`zhdstudy.cloud\` means more to me than simply putting a website online. It proves that I can independently deliver a complete full-stack project.

From interface design and feature development to API integration, admin authentication, content management, and production deployment, this project gave me a much clearer understanding of end-to-end product delivery.

## Next Steps

I plan to continue improving this project by:

- Enhancing the admin editing experience
- Adding more complete category and tag management
- Publishing more development logs and project updates
- Further improving the reliability and presentation quality of the live site

If I used to learn technologies separately, \`zhdstudy.cloud\` is where I started turning them into one complete product.`
    },
    summary: {
      zh: '记录 zhdstudy.cloud 从前后端搭建、后台实现到正式上线的完整过程，以及这个全栈项目对我的意义。',
      en: 'A full recap of building, managing, and launching zhdstudy.cloud as a real full-stack project.'
    },
    category: {
      zh: '全栈项目',
      en: 'Full Stack'
    },
    tags: ['zhdstudy.cloud', 'vue', 'vite', 'typescript', 'nodejs', 'express', 'jwt'],
    coverImage: '',
    demoVideo: '/projects/zhd-demo.mp4',
    demoPoster: '/projects/zhd-poster.jpg',
    projectUrl: 'https://zhdstudy.cloud',
    isPublished: true,
    createdAt: new Date('2026-07-03T09:30:00.000Z'),
    updatedAt: new Date('2026-07-03T09:30:00.000Z')
  },
  {
    _id: '682b4a710000000000000001',
    title: {
      zh: '欢迎来到我的动态博客',
      en: 'Welcome To My Dynamic Blog'
    },
    content: {
      zh: '# 你好\n\n这是新后端提供的第一篇文章。',
      en: '# Hello\n\nThis is the first post served by the new backend.'
    },
    summary: {
      zh: '这是服务端种子数据返回的第一篇文章。',
      en: 'The first article returned by the server seed data.'
    },
    category: {
      zh: '后端',
      en: 'Backend'
    },
    tags: ['node', 'express', 'blog'],
    coverImage: '',
    isPublished: true,
    createdAt: new Date('2026-05-19T10:00:00.000Z'),
    updatedAt: new Date('2026-05-19T10:00:00.000Z')
  },
  {
    _id: '682b4a710000000000000002',
    title: {
      zh: '关于页数据流的构建方式',
      en: 'Building The About Page Data Flow'
    },
    content: {
      zh: '这篇文章介绍了项目经历如何被动态管理并展示在前台页面。',
      en: 'This article explains how project experiences can be managed dynamically.'
    },
    summary: {
      zh: '一篇介绍关于页动态数据流的文章。',
      en: 'A post describing the dynamic about page data flow.'
    },
    category: {
      zh: '架构设计',
      en: 'Architecture'
    },
    tags: ['vue', 'mongodb'],
    coverImage: '',
    isPublished: true,
    createdAt: new Date('2026-05-18T10:00:00.000Z'),
    updatedAt: new Date('2026-05-18T10:00:00.000Z')
  }
];

const memoryExperiences = [
{
    _id: '691b7c5a0000000000000002',
    projectName: {
      zh: 'Yoji.（要记单词）三端学习应用',
      en: 'Yoji Vocabulary Learning Platform'
    },
    techStack: [
      'HarmonyOS ArkTS',
      'Node.js',
      'Express',
      'SQLite',
      'Next.js',
      'Electron',
      'Aliyun OSS'
    ],
    description: {
      zh: '面向鸿蒙的背单词应用，包含卡片学习、错词本与 6 级间隔复习、视频学习与学习日历，并配套 Node 后台与 Windows 管理端。',
      en: 'A HarmonyOS vocabulary app with flashcards, a wrong-word book with six-level spaced repetition, video lessons and a study calendar, backed by a Node API and a Windows admin console.'
    },
    achievement: {
      zh: '上线 yoji.zhdstudy.cyou；桌面端安装包从 169MB 降到 113MB；650MB 视频迁移到 OSS；后台补齐审计日志、CSV 导出与 OpenAPI 文档。',
      en: 'Launched at yoji.zhdstudy.cyou; reduced the desktop installer from 169MB to 113MB; moved 650MB of video to OSS; added audit logs, CSV export and OpenAPI docs to the admin.'
    },
    duration: {
      zh: '2026.10 - 至今',
      en: '2026.10 - Present'
    },
    sortOrder: 0,
    createdAt: new Date('2026-11-17T11:45:00.000Z'),
    updatedAt: new Date('2026-11-17T11:45:00.000Z')
  },
  {
    _id: '682b4a710000000000000101',
    projectName: {
      zh: '个人博客重构',
      en: 'Personal Blog Rebuild'
    },
    techStack: ['Vue 3', 'Node.js', 'Express', 'MongoDB'],
    description: {
      zh: '将静态博客重构为具备前后端分离能力的动态全栈应用。',
      en: 'Refactored a static blog into a dynamic full-stack application.'
    },
    achievement: {
      zh: '建立了前后端分离架构，并沉淀出可复用的内容接口。',
      en: 'Established separated front-end/back-end architecture and reusable content APIs.'
    },
    duration: {
      zh: '2026.05 - 至今',
      en: '2026.05 - Present'
    },
    sortOrder: 1,
    createdAt: new Date('2026-05-19T09:00:00.000Z'),
    updatedAt: new Date('2026-05-19T09:00:00.000Z')
  },
  {
    _id: '685a00000000000000000001',
    projectName: {
      zh: '自习室预约管理系统（Python 全栈）',
      en: 'Study Room Reservation System (Python Full-Stack)'
    },
    techStack: [
      'Vue 3',
      'TypeScript',
      'Vite',
      'Element Plus',
      'Tailwind CSS',
      'Pinia',
      'ECharts',
      'FastAPI',
      'SQLAlchemy 2.0 (Async)',
      'aiomysql',
      'Pydantic v2',
      'MySQL / TiDB Cloud',
      'Vercel',
      'Render'
    ],
    description: {
      zh: '前后端分离的自习室座位预约平台，单入口按角色渲染学生端与管理端：学生可按时间段选座预约、签到、取消、看公告与提反馈；管理端含 ECharts 数据看板与用户/自习室/座位/预约/公告/留言管理。后端 FastAPI 异步 + SQLAlchemy 2.0 异步 ORM + aiomysql 连接 MySQL/TiDB Cloud。',
      en: 'A separated front/back-end study-room seat reservation platform. One entry renders student vs admin views by role: students book time slots, check in, cancel, read notices and send feedback; admins get an ECharts dashboard plus user/room/seat/reservation/notice/feedback management. Backend uses async FastAPI + SQLAlchemy 2.0 async ORM + aiomysql over MySQL/TiDB Cloud.'
    },
    achievement: {
      zh: '用时间区间重叠谓词（start < end′ 且 end > start′）做座位防超卖与一人多约校验；实现 pending/active/completed/cancelled 预约状态机与签到/取消流转；前端 Vercel、后端 Render、数据库 TiDB Cloud 三地分离部署并经公网 TLS 连接，OpenAPI 自动文档联调。',
      en: 'Prevented seat overselling and double-booking via an interval-overlap predicate (start < end′ AND end > start′); built a pending/active/completed/cancelled reservation state machine with check-in/cancel transitions; deployed front-end on Vercel, API on Render and DB on TiDB Cloud over public TLS, integrated via auto-generated OpenAPI docs.'
    },
    duration: {
      zh: '2026.06 - 2026.07',
      en: '2026.06 - 2026.07'
    },
    sortOrder: 2,
    createdAt: new Date('2026-07-05T12:00:00.000Z'),
    updatedAt: new Date('2026-07-05T12:00:00.000Z')
  }
];

function normalizeStringArray(input) {
  if (Array.isArray(input)) {
    return input.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof input === 'string') {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function isLocalizedObject(input) {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeLocalizedValue(input, fallback = '') {
  if (typeof input === 'string') {
    const value = input.trim();
    return value ? { zh: value, en: value } : fallback;
  }

  if (isLocalizedObject(input)) {
    const zh = typeof input.zh === 'string' ? input.zh.trim() : '';
    const en = typeof input.en === 'string' ? input.en.trim() : '';

    if (!zh && !en) {
      return fallback;
    }

    return {
      zh: zh || en,
      en: en || zh
    };
  }

  return fallback;
}

function hasLocalizedContent(input) {
  if (typeof input === 'string') {
    return Boolean(input.trim());
  }

  if (isLocalizedObject(input)) {
    return ['zh', 'en'].some(
      (key) => typeof input[key] === 'string' && Boolean(input[key].trim())
    );
  }

  return false;
}

function normalizePostPayload(payload) {
  return {
    ...payload,
    title: normalizeLocalizedValue(payload.title),
    content: normalizeLocalizedValue(payload.content),
    summary:
      payload.summary !== undefined ? normalizeLocalizedValue(payload.summary) : '',
    category:
      payload.category !== undefined
        ? normalizeLocalizedValue(payload.category, 'Uncategorized')
        : 'Uncategorized',
    tags: normalizeStringArray(payload.tags)
  };
}

function normalizeExperiencePayload(payload) {
  return {
    ...payload,
    projectName: normalizeLocalizedValue(payload.projectName),
    description: normalizeLocalizedValue(payload.description),
    achievement:
      payload.achievement !== undefined
        ? normalizeLocalizedValue(payload.achievement)
        : '',
    duration:
      payload.duration !== undefined ? normalizeLocalizedValue(payload.duration) : '',
    techStack: normalizeStringArray(payload.techStack)
  };
}

async function listPosts({ page = 1, limit = 10, category }) {
  const safePage = Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number(limit) > 0 ? Number(limit) : 10;

  if (isDatabaseConnected()) {
    const filter = category ? { category } : {};
    const total = await Post.countDocuments(filter);
    const data = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit);

    return { total, data, page: safePage, limit: safeLimit };
  }

  let data = [...memoryPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (category) {
    data = data.filter((item) => item.category === category);
  }

  return {
    total: data.length,
    data: data.slice((safePage - 1) * safeLimit, safePage * safeLimit),
    page: safePage,
    limit: safeLimit
  };
}

async function getPostById(id) {
  if (isDatabaseConnected()) {
    return Post.findById(id);
  }

  return memoryPosts.find((item) => item._id === id) || null;
}

async function createPost(payload) {
  const document = normalizePostPayload(payload);

  if (isDatabaseConnected()) {
    return Post.create(document);
  }

  const now = new Date();
  const created = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: document.title || '',
    content: document.content || '',
    summary: document.summary || '',
    category: document.category || 'Uncategorized',
    tags: document.tags,
    coverImage: document.coverImage || '',
    demoVideo: document.demoVideo || '',
    demoPoster: document.demoPoster || '',
    projectUrl: document.projectUrl || '',
    isPublished: document.isPublished ?? true,
    createdAt: now,
    updatedAt: now
  };

  memoryPosts.unshift(created);
  return created;
}

async function updatePost(id, payload) {
  const document = {
    ...payload,
    ...(payload.title !== undefined
      ? { title: normalizeLocalizedValue(payload.title) }
      : {}),
    ...(payload.content !== undefined
      ? { content: normalizeLocalizedValue(payload.content) }
      : {}),
    ...(payload.summary !== undefined
      ? { summary: normalizeLocalizedValue(payload.summary) }
      : {}),
    ...(payload.category !== undefined
      ? { category: normalizeLocalizedValue(payload.category, 'Uncategorized') }
      : {}),
    ...(payload.tags !== undefined ? { tags: normalizeStringArray(payload.tags) } : {})
  };

  if (isDatabaseConnected()) {
    return Post.findByIdAndUpdate(id, document, { new: true, runValidators: true });
  }

  const index = memoryPosts.findIndex((item) => item._id === id);
  if (index === -1) {
    return null;
  }

  memoryPosts[index] = {
    ...memoryPosts[index],
    ...document,
    updatedAt: new Date()
  };

  return memoryPosts[index];
}

async function deletePost(id) {
  if (isDatabaseConnected()) {
    return Post.findByIdAndDelete(id);
  }

  const index = memoryPosts.findIndex((item) => item._id === id);
  if (index === -1) {
    return null;
  }

  const [deleted] = memoryPosts.splice(index, 1);
  return deleted;
}

async function listExperiences() {
  if (isDatabaseConnected()) {
    return Experience.find().sort({ sortOrder: 1, createdAt: -1 });
  }

  return [...memoryExperiences].sort(
    (a, b) => a.sortOrder - b.sortOrder || new Date(b.createdAt) - new Date(a.createdAt)
  );
}

async function createExperience(payload) {
  const document = normalizeExperiencePayload(payload);

  if (isDatabaseConnected()) {
    return Experience.create(document);
  }

  const now = new Date();
  const created = {
    _id: new mongoose.Types.ObjectId().toString(),
    projectName: document.projectName || '',
    techStack: document.techStack,
    description: document.description || '',
    achievement: document.achievement || '',
    duration: document.duration || '',
    sortOrder: Number(document.sortOrder || 0),
    createdAt: now,
    updatedAt: now
  };

  memoryExperiences.unshift(created);
  return created;
}

async function updateExperience(id, payload) {
  const document = {
    ...payload,
    ...(payload.projectName !== undefined
      ? { projectName: normalizeLocalizedValue(payload.projectName) }
      : {}),
    ...(payload.description !== undefined
      ? { description: normalizeLocalizedValue(payload.description) }
      : {}),
    ...(payload.achievement !== undefined
      ? { achievement: normalizeLocalizedValue(payload.achievement) }
      : {}),
    ...(payload.duration !== undefined
      ? { duration: normalizeLocalizedValue(payload.duration) }
      : {}),
    ...(payload.techStack !== undefined
      ? { techStack: normalizeStringArray(payload.techStack) }
      : {})
  };

  if (isDatabaseConnected()) {
    return Experience.findByIdAndUpdate(id, document, { new: true, runValidators: true });
  }

  const index = memoryExperiences.findIndex((item) => item._id === id);
  if (index === -1) {
    return null;
  }

  memoryExperiences[index] = {
    ...memoryExperiences[index],
    ...document,
    updatedAt: new Date()
  };

  return memoryExperiences[index];
}

async function deleteExperience(id) {
  if (isDatabaseConnected()) {
    return Experience.findByIdAndDelete(id);
  }

  const index = memoryExperiences.findIndex((item) => item._id === id);
  if (index === -1) {
    return null;
  }

  const [deleted] = memoryExperiences.splice(index, 1);
  return deleted;
}

async function getAdminSummary() {
  if (isDatabaseConnected()) {
    const [postCount, experienceCount, latestPosts, latestExperiences] = await Promise.all([
      Post.countDocuments(),
      Experience.countDocuments(),
      Post.find().sort({ updatedAt: -1 }).limit(5),
      Experience.find().sort({ updatedAt: -1 }).limit(5)
    ]);

    return {
      postCount,
      experienceCount,
      latestPosts,
      latestExperiences
    };
  }

  return {
    postCount: memoryPosts.length,
    experienceCount: memoryExperiences.length,
    latestPosts: [...memoryPosts]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5),
    latestExperiences: [...memoryExperiences]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5)
  };
}

module.exports = {
  hasLocalizedContent,
  listPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  listExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  getAdminSummary
};
