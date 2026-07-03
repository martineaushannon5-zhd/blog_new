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
