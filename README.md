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
├── apps/web/                     # 官网 (React 18 + Vite 7)
│   ├── content/                  # Markdown 内容 (新闻文章)
│   ├── tools/                    # 构建工具 (sitemap, llms.txt)
│   └── src/
│       ├── features/             # 按功能模块组织
│       │   ├── products/         # 产品页 (列表 + 详情)
│       │   ├── news/             # 新闻页 (列表 + 文章)
│       │   ├── faq/              # FAQ
│       │   ├── home/             # 首页
│       │   ├── company/          # 公司页面 (About, B2B, Contact)
│       │   └── legal/            # 法律页面
│       └── shared/               # 共享组件与工具
│           ├── site/             # Header, Footer, SEO
│           ├── ui/               # UI 组件 (Breadcrumb, Accordion...)
│           └── lib/              # i18n, analytics, hooks
├── cms/
│   ├── admin/                    # 管理后台 SPA (React + shadcn/ui)
│   │   └── src/
│   │       ├── components/       # ChatPanel, MediaPicker 等
│   │       └── pages/            # Dashboard, Products, News, FAQ, Deploy...
│   ├── workers/                  # Cloudflare Workers API (Hono)
│   │   └── src/routes/
│   │       ├── ai.ts             # AI Agent v2 — function calling
│   │       ├── analytics.ts      # 访问统计 + 会话分析
│   │       ├── deploy.ts         # 触发 GitHub Actions 部署
│   │       ├── products.ts       # 产品 CRUD
│   │       ├── news.ts           # 新闻 CRUD
│   │       ├── faq.ts            # FAQ CRUD
│   │       ├── legal.ts          # 法律页面 CRUD
│   │       ├── media.ts          # 媒体上传
│   │       ├── search.ts         # 全文搜索
│   │       ├── audit.ts          # 操作审计日志
│   │       ├── versions.ts       # 内容版本管理
│   │       └── site-settings.ts  # 网站设置
│   ├── scripts/                  # 构建脚本 (codegen, image processing)
│   └── migrations/               # Supabase 数据库迁移
└── .github/workflows/            # CI/CD
    └── cms-deploy.yml            # 构建 + FTP 部署到 Hostinger
```

## 技术栈

| 层 | 技术 |
|---|------|
| 官网 | React 18, Vite 7, Tailwind CSS, recharts |
| 管理后台 | React 18, Vite 6, Tailwind CSS, Fluent 2 设计 |
| API | Cloudflare Workers (Hono), TypeScript |
| 数据库 | Supabase (PostgreSQL + Storage) |
| 认证 | Supabase Auth + JWT |
| AI Agent | DeepSeek V4 Flash + Function Calling (14 tools) |
| 部署 | GitHub Actions → lftp FTP → Hostinger |
| 图片处理 | Sharp (WebP 多尺寸变体) |
| SEO | JSON-LD 结构化数据, hreflang, sitemap.xml, llms.txt |

## 功能特性

### CMS 管理后台

- **内容管理**: 产品、新闻、FAQ、法律页面、网站设置的完整 CRUD
- **媒体库**: 图片上传 (WebP 自动转换), Supabase Storage
- **AI 助手 v2**: 基于 DeepSeek V4 Flash 的 function calling agent
  - 14 个工具函数 (9 读 + 5 写)
  - 自然语言查询 Supabase 数据、修改内容
  - thinking mode 深度推理
- **数据看板**: 页面访问量、会话数、平均停留时间、跳出率
- **版本管理**: 内容变更历史 + 回滚
- **审计日志**: 所有写操作可追溯
- **一键部署**: 触发 GitHub Actions 自动构建并部署到 Hostinger

### 官网

- **多语言**: 英语/法语/越南语 (i18n 文件驱动)
- **SEO 优化**:
  - JSON-LD 结构化数据 (Organization, BreadcrumbList, Article, FAQPage)
  - 完整 hreflang + canonical 标签
  - 动态 sitemap.xml + llms.txt
  - OG / Twitter Cards
- **产品展示**: 按分类浏览, 产品详情页含完整规格参数
- **新闻杂志**: 图文排版, TOC 导航, 结构化文章数据
- **B2B 询盘**: 联系表单, RFQ 采集
- **访问统计**: session_id 粒度, 设备/地区/浏览器解析

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

## 内容管理流程

```
1. 登录管理后台 → 编辑内容 → 保存
       ↓
2. 内容存入 Supabase (带版本管理 + 审计日志)
       ↓
3. 点击「部署」→ 触发 GitHub Actions
       ↓
4. Codegen: 从 Supabase 拉取已发布内容 → 生成 JS/MD 文件
       ↓
5. 图片处理: 生成 WebP 多尺寸变体
       ↓
6. Vite 构建 → 生成 sitemap.xml + llms.txt
       ↓
7. lftp FTP 上传到 Hostinger
       ↓
8. 官网更新 ✓
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
