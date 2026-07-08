# ZHD Blog

一个前后端分离的个人博客项目，前端基于 `Vue 3 + Vite + TypeScript`，后端基于 `Node.js + Express`。项目当前支持首页视频开场、文章列表、文章详情、关于页、合作页、赞助页，以及后台登录和内容管理。

## 项目概览

- 前端目录：`client/`
- 后端目录：`server/`
- 旧站与备份：`hexo_backup/`、`zhd-main/`
- 部署准备目录：`cloudflare/`、`nginx/`、`redis/`
- Flutter 文档目录：`flutter/`

## 功能模块

- 首页：开场视频、精选文章、状态面板
- 文章系统：文章列表、文章详情、分类展示
- 关于页：个人介绍、项目经历
- 合作页：联系方式与合作入口
- 赞助页：赞助展示
- 后台系统：管理员登录、文章管理、项目经历管理

## 目录结构

```text
myblog/
├─ client/                # Vue 前端
├─ server/                # Node.js / Express 后端
├─ cloudflare/            # Cloudflare 配置准备目录
├─ nginx/                 # Nginx 配置准备目录
├─ redis/                 # Redis 配置准备目录
├─ flutter/               # Flutter 相关文档
├─ hexo_backup/           # 旧 Hexo 备份
├─ zhd-main/              # 历史静态站内容
├─ README.md
├─ REQUIREMENTS_AND_API.md
└─ UPDATE_DOC.md
```

## 本地启动

### 1. 启动后端

```bash
cd server
npm install
npm run start
```

后端默认运行在 `http://localhost:4000`

### 2. 启动前端

```bash
cd client
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`

## 技术栈说明

### 前端技术

- `Vue 3`
  负责页面组件化开发，是整个博客前端的核心框架。

- `Vite`
  负责本地开发服务器、模块热更新和生产构建。

- `TypeScript`
  用于前端类型约束，降低接口字段、组件数据和工具函数的出错概率。

- `Vue Router`
  负责单页路由切换，包括首页、文章页、详情页、后台页等。

- `Pinia`
  用于前端状态管理，目前主要承载认证态等全局状态。

- `Vue I18n`
  用于中英文双语切换。

- `Axios`
  用于前后端 HTTP 通信，请求博客文章、登录和后台接口。

- `Tailwind CSS`
  负责快速构建页面样式，项目的玻璃拟态、布局和响应式样式均基于此实现。

- `PostCSS`
  用于样式处理链，配合 Tailwind 工作。

- `lucide-vue-next`
  用于页面图标展示。

- `HTML5 Video + Vue Teleport`
  首页开场视频使用原生视频能力，遮罩层通过 `Teleport` 挂载到 `body`。

### 后端技术

- `Node.js`
  提供整个服务端运行环境。

- `Express`
  负责搭建 REST API，包括文章、经历、认证、健康检查等接口。

- `JWT`
  用于后台管理员认证。

- `bcryptjs`
  用于密码加密与校验。

- `dotenv`
  负责读取环境变量配置。

- `cors`
  处理跨域访问。

- `mongoose`
  用于 MongoDB 接入能力。当前项目在未配置 `MONGODB_URI` 时会退回内存模式。

- `内存数据模式`
  当前默认开发数据来自 `server/src/store.js`，适合快速本地调试。

### 工程化与部署相关技术

- `npm`
  用于前后端依赖管理与脚本执行。

- `Nodemon`
  用于后端开发时热更新。

- `GitHub Actions`
  仓库内含 `.github/workflows/deploy.yml`，可扩展自动部署流程。

- `Vercel / Render`
  这是项目历史部署平台，适合前后端分离的轻部署场景。

- `Nginx`
  计划作为云服务器上的反向代理、静态资源入口和 HTTPS 接入层。

- `Redis`
  计划作为缓存层，可用于文章热点缓存、会话、限流或队列扩展。

- `Cloudflare`
  计划作为 DNS、CDN、SSL、缓存与安全防护入口。

## 已准备的部署目录

### `cloudflare/`

用于存放未来的 Cloudflare 配置说明，例如：

- 域名接入
- DNS 记录配置
- 缓存规则
- 页面规则
- SSL/TLS 策略

### `nginx/`

用于存放未来云服务器的 Nginx 配置，例如：

- 前端静态资源托管
- `/api` 反向代理到 Node 服务
- HTTPS 证书接入
- Gzip / 缓存头配置

### `redis/`

用于存放未来 Redis 配置，例如：

- 基础配置
- 持久化策略
- 密码认证
- 内存淘汰策略

## 接口与数据说明

- 健康检查：`/api/health`
- 文章列表：`/api/posts`
- 文章详情：`/api/posts/:id`
- 登录接口：`/api/auth/login`
- 项目经历：`/api/experiences`
- 后台汇总：`/api/admin/summary`

更多接口细节可查看：

- `REQUIREMENTS_AND_API.md`
- `server/API_PORT_DOC.md`

## 当前部署建议

如果你准备迁移到自己的云服务器，推荐结构如下：

- `Cloudflare`：域名解析、CDN、SSL
- `Nginx`：80/443 入口与反代
- `Node.js`：运行后端 API
- `Redis`：缓存层
- `PM2`：Node 进程守护

## 说明

- 当前仓库同时保留了旧 Hexo 备份与历史静态文件，便于后续迁移和数据回溯。
- `flutter/` 目录当前存放的是 Flutter 相关文档，不参与本项目 Web 运行。
- 如果要正式上线，建议补充生产环境 `MongoDB`、`Redis`、`Nginx` 和 `Cloudflare` 配置。
