# Puxijietech

B2B 企业官网 + CMS 内容管理后台。官网纯静态部署于 Hostinger 虚拟主机，CMS 通过 Cloudflare Workers + Supabase 实现。

## 架构

```
puxijietech.com (Hostinger)          admin 后台 (Cloudflare Pages)
       ↑                                    ↓
  静态 HTML/JS/CSS                    puxijie-cms-api (Cloudflare Workers)
       ↑                                    ↓
  GitHub Actions 构建                      Supabase (PostgreSQL + Storage)
       ↑                                    ↓
  代码仓库 (GitHub)                    DeepSeek V4 Flash (AI Agent)
```

官网是**纯静态**的，CMS 数据在构建时通过 codegen 注入到 JS 文件中，不依赖实时 API。每次更新内容需点击「部署」触发重新构建。

## 项目结构

```
Puxijietech/
├── apps/web/                          # 官网 (React 18 + Vite 7)
│   ├── content/news/                  # Markdown 新闻文章 (codegen 生成)
│   ├── public/                        # 静态资源 + sitemap.xml
│   ├── tools/                         # 构建工具 (sitemap, llms.txt, image)
│   └── src/
│       ├── app/                       # 入口 (App, main)
│       ├── features/                  # 功能模块
│       │   ├── products/              # 产品页 (列表 + 详情 + 模型页)
│       │   ├── news/                  # 新闻页 (列表 + 文章)
│       │   ├── faq/                   # FAQ
│       │   ├── home/                  # 首页
│       │   ├── company/               # 公司页面 (About, B2B, Contact, Lab)
│       │   ├── legal/                 # 法律页面 (Terms, Privacy, etc.)
│       │   └── site/                  # Sitemap 页面
│       └── shared/
│           ├── site/                  # Header, Footer, menus.generated.js
│           ├── ui/                    # UI 组件 (Accordion, Breadcrumb, Dialog, Sheet...)
│           ├── seo/                   # SEO (JSON-LD, keywords.generated.js)
│           └── lib/                   # i18n, analytics, image resolution
├── cms/
│   ├── admin/                         # 管理后台 SPA (React + shadcn/ui)
│   │   ├── public/
│   │   └── src/
│   │       ├── components/            # RichTextEditor, VersionDiff, ChatPanel, MediaPicker...
│   │       ├── pages/                 # Dashboard, Products, News, FAQ, Menus, Users, Redirects...
│   │       └── lib/                   # API client, auth, hooks
│   ├── workers/                       # Cloudflare Workers API (Hono)
│   │   ├── migrations/               # Supabase DDL 迁移脚本 (006-009)
│   │   └── src/
│   │       ├── index.ts              # 路由注册 + 入口
│   │       ├── routes/               # API 路由 (18 个模块)
│   │       │   ├── auth.ts           # 认证 (JWT)
│   │       │   ├── products.ts       # 产品 CRUD
│   │       │   ├── news.ts           # 新闻 CRUD + 分类筛选
│   │       │   ├── news-categories.ts # 新闻分类 CRUD
│   │       │   ├── faq.ts            # FAQ CRUD
│   │       │   ├── legal.ts          # 法律页面 CRUD
│   │       │   ├── pages.ts          # 自定义页面 CRUD
│   │       │   ├── media.ts          # 媒体上传
│   │       │   ├── menus.ts          # 导航菜单管理 (树形结构)
│   │       │   ├── redirects.ts      # 301/302 跳转管理
│   │       │   ├── users.ts          # CMS 用户管理
│   │       │   ├── search.ts         # 全文搜索
│   │       │   ├── analytics.ts      # 访问统计 + GA 数据
│   │       │   ├── audit.ts          # 操作审计日志
│   │       │   ├── versions.ts       # 内容版本管理 + Diff
│   │       │   ├── deploy.ts         # 触发 GitHub Actions 部署
│   │       │   ├── ai.ts             # AI Agent v2 — function calling
│   │       │   ├── site-settings.ts  # 网站设置 (SEO, i18n, 联系信息)
│   │       │   └── seed.ts           # 初始数据种子
│   │       ├── schemas/              # Zod 验证模式
│   │       ├── lib/                  # Supabase 客户端, JWT 认证, GA, Codegen
│   │       └── cron/                 # 定时任务 (定时发布)
│   └── scripts/                      # Codegen, 数据种子, 图片处理
├── .github/workflows/                 # CI/CD
│   └── cms-deploy.yml                # 构建 + FTP 部署到 Hostinger
└── docs/                              # 项目文档
```

## API 架构

### 路由设计

所有 API 路由挂载在 `/api/v1/` 下，按资源模块组织：

```
/api/v1/
├── /auth              # 登录/登出/Token 刷新
├── /products          # 产品 + 规格 + 翻译 + 图片
├── /news              # 新闻文章 CRUD + ?category= 筛选
├── /news-categories   # 新闻分类 (slug + 多语言翻译)
├── /faq               # FAQ 分组 + 条目 + 多语言
├── /legal             # 法律页面类型 + 翻译
├── /pages             # 自定义页面 + body_json 富文本
├── /media             # 图片上传 (WebP 自动转换)
├── /menus             # 导航菜单树 (多语言, 可拖拽排序)
├── /redirects         # 301/302 跳转管理
├── /users             # CMS 用户 CRUD (admin only)
├── /search            # 全文搜索 (产品 + 新闻 + FAQ)
├── /analytics         # 访问统计 / GA Dashboard 数据
├── /audit-logs        # 操作审计日志 (只读)
├── /versions          # 内容版本历史 + Diff
├── /deploy            # 触发部署
├── /ai                # AI Agent (Function Calling)
├── /site-settings     # 网站设置 (SEO, i18n, 联系信息)
├── /cron/publish-scheduled  # 定时发布调度
└── /health            # 健康检查
```

### 认证流程

```
1. POST /api/v1/auth/login { email, password }
   → Supabase Auth 验证 → 签发 JWT (24h 有效)
2. 后续请求带 Authorization: Bearer <jwt>
3. requireAuth() 中间件验证 JWT → 注入 user context
4. requireAdmin() 中间件检查 role === 'admin'
```

### API 响应格式

```typescript
// 成功
{ "success": true, "data": { ... } }

// 分页
{ "success": true, "data": { "items": [...], "total": 100, "page": 1, "limit": 50 } }

// 错误
{ "success": false, "error": "Error message" }
```

### Worker 绑定

| 绑定 | 说明 |
|------|------|
| `SUPABASE_URL` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key (服务端操作) |
| `JWT_SECRET` | JWT 签名密钥 |
| `GITHUB_TOKEN` | GitHub PAT (触发 Actions) |
| `DEEPSEEK_API_KEY` | DeepSeek API key (AI Agent) |
| `GITHUB_REPO` | 仓库名 (环境变量) |

## 技术栈

| 层 | 技术 |
|---|------|
| 官网 | React 18, Vite 7, Tailwind CSS, recharts, react-simple-maps |
| 管理后台 | React 18, Vite 6, Tailwind CSS, shadcn/ui, Tiptap (富文本) |
| API | Cloudflare Workers (Hono ^4.7), TypeScript |
| 数据库 | Supabase (PostgreSQL + Storage) |
| 认证 | Supabase Auth + JWT (jose) |
| AI Agent | DeepSeek V4 Flash + Function Calling (14 tools) |
| 部署 | GitHub Actions → lftp FTP → Hostinger |
| 图片处理 | Sharp (WebP 多尺寸变体) |
| SEO | JSON-LD 结构化数据, hreflang, canonical, sitemap.xml, llms.txt |

## 功能特性

### CMS 管理后台

- **数据看板**: 页面访问量、会话数、平均停留时间、跳出率, 世界地图 (GA 地理分布), 设备分布, 流量来源
- **产品管理**: 产品 + 规格参数 + 多语言翻译 + 图片排序 + 关联产品
- **新闻管理**: 文章 CRUD + 结构化分类 + 关键词标签 + 定时发布
- **页面管理**: 自定义页面 + Tiptap 富文本编辑器 (支持图片/链接/格式化)
- **FAQ / 法律页面**: 分组管理 + 多语言
- **菜单管理**: 树形结构, 支持多级菜单 + 拖拽排序 + 三语言独立配置
- **301 跳转管理**: 源路径 → 目标路径, 301/302 可选
- **用户管理**: CMS 管理员/编辑者 CRUD
- **媒体库**: 图片上传 (WebP 自动转换), Supabase Storage
- **SEO 元数据**: OG Title/Description/Image, Canonical URL, noindex 控制
- **版本管理**: 内容变更历史 + Diff 对比 + 回滚
- **审计日志**: 所有写操作可追溯 (who, what, when)
- **AI 助手 v2**: 基于 DeepSeek V4 Flash 的 function calling agent
  - 14 个工具函数 (9 读 + 5 写)
  - 自然语言查询 Supabase 数据、修改内容
  - thinking mode 深度推理
- **一键部署**: 触发 GitHub Actions 自动构建 + codegen + FTP 部署

### 官网

- **多语言**: 英语/法语/越南语 (i18n 文件驱动)
- **动态导航**: Header 菜单由 CMS 菜单管理驱动, codegen 自动生成
- **SEO 优化**:
  - JSON-LD 结构化数据 (Organization, BreadcrumbList, Article, FAQPage)
  - 完整 hreflang + canonical 标签
  - 动态 sitemap.xml + llms.txt
  - OG / Twitter Cards
- **产品展示**: 按分类浏览, 产品详情页含完整规格参数
- **新闻杂志**: 图文排版, TOC 导航, 结构化文章数据
- **B2B 询盘**: 联系表单, RFQ 采集
- **访问统计**: session_id 粒度, 设备/地区/浏览器解析

## 数据库

### 核心业务表

| 表 | 说明 |
|----|------|
| `products` | 产品 |
| `product_translations` | 产品多语言翻译 |
| `product_specs` | 产品规格参数 |
| `product_images` | 产品图片关联 |
| `news_articles` | 新闻文章 |
| `news_categories` | 新闻分类 |
| `news_category_translations` | 分类多语言翻译 |
| `news_article_categories` | 文章-分类关联 |
| `faq_sections` | FAQ 分组 |
| `faq_items` | FAQ 条目 |
| `pages` | 自定义页面 |
| `page_translations` | 页面多语言 (含 SEO 字段) |
| `legal_pages` | 法律页面 |
| `menus` | 导航菜单 |
| `menu_items` | 菜单项 (树形, 多语言) |
| `redirects` | 301/302 跳转 |
| `media` | 媒体文件 |
| `users` | CMS 用户 |
| `content_versions` | 内容版本历史 |
| `audit_logs` | 操作审计日志 |
| `site_settings` | 网站设置 (KV) |

### 迁移文件

```
cms/workers/migrations/
├── 006_news_categories.sql    # 新闻分类三表
├── 007_seo_meta.sql           # SEO 元数据字段
├── 008_menus.sql              # 菜单 + 菜单项
└── 009_redirects.sql          # 301 跳转
```

先前的迁移 (001-005) 已在 Supabase 初始化时执行。

## 内容管理流程

```
1. 登录管理后台 → 编辑内容 → 保存
       ↓
2. 内容存入 Supabase (带版本管理 + 审计日志)
       ↓
3. 点击「部署」→ 触发 GitHub Actions
       ↓
4. Codegen: 从 Worker API 拉取已发布内容 → 生成 JS/MD 文件
   (products / news / faq / legal / i18n / SEO keywords / menus / redirects)
       ↓
5. 图片处理: 生成 WebP 多尺寸变体
       ↓
6. Vite 构建 → 生成 sitemap.xml + llms.txt
       ↓
7. lftp FTP 上传到 Hostinger
       ↓
8. 官网更新 ✓
```

## 本地开发

### 官网

```bash
cd apps/web
npm install
npm run dev          # http://localhost:3000
```

### 管理后台

```bash
cd cms/admin
npm install
npm run dev          # http://localhost:5174
```

### Worker API

```bash
cd cms/workers
npm install
npx wrangler dev     # http://localhost:8787
```

> Worker 依赖 Supabase 连接和 DeepSeek API，本地开发需在 `wrangler.toml` 的 `[vars]` 中填入相关环境变量。

### Codegen (内容生成)

```bash
# 从 Worker API 拉取数据生成前端文件
API_URL=https://puxijie-cms-api.hzjeric2002.workers.dev node cms/scripts/codegen-from-api.mjs
```

## 环境变量

### GitHub Actions Secrets

| Secret | 说明 |
|--------|------|
| `SUPABASE` | Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service_role key |
| `HOSTINGER_SFTP_HOST` | Hostinger FTP 地址 |
| `HOSTINGER_SFTP_USER` | Hostinger FTP 用户名 |
| `HOSTINGER_SFTP_PASSWORD` | Hostinger FTP 密码 |
| `GOOGLE_ANALYTICS_REFRESH_TOKEN` | GA4 API OAuth 刷新令牌 |

### Cloudflare Worker Secrets

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put DEEPSEEK_API_KEY
```

## 部署地址

| 服务 | URL |
|------|-----|
| 官网 | https://puxijietech.com |
| 管理后台 | https://puxijie-cms-admin.pages.dev |
| API | https://puxijie-cms-api.hzjeric2002.workers.dev |

## 手动部署

1. 打开 [GitHub Actions](https://github.com/EricHong123/Puxijieweb-CMS/actions)
2. 选择 **CMS Deploy to Hostinger**
3. 点击 **Run workflow**

或登录管理后台 → 部署 → 一键部署。
