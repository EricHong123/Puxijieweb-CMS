# Puxijietech

B2B 企业官网 + CMS 内容管理后台。官网纯静态部署于 Hostinger 虚拟主机，CMS 通过 Cloudflare Workers + Supabase 实现。

## 架构

```
puxijietech.com (Hostinger)          admin 后台 (Cloudflare Pages)
       ↑                                    ↓
  静态 HTML/JS/CSS                    puxijie-cms-api (Cloudflare Workers)
       ↑                                    ↓
  GitHub Actions 构建                      Supabase (PostgreSQL + Storage)
       ↑
  代码仓库 (GitHub)
```

官网是**纯静态**的，CMS 数据在构建时通过 codegen 注入到 JS 文件中，不依赖实时 API。每次更新内容需点击「部署」触发重新构建。

## 项目结构

```
Puxijietech/
├── apps/web/                     # 官网 (React 18 + Vite 7)
│   └── src/
│       ├── features/             # 按功能模块组织
│       │   ├── products/         # 产品页
│       │   ├── news/             # 新闻页
│       │   ├── faq/              # FAQ
│       │   └── legal/            # 法律页面
│       └── shared/               # 共享工具 (i18n, SEO, analytics)
├── cms/
│   ├── admin/                    # 管理后台 SPA (React + shadcn/ui)
│   ├── workers/                  # Cloudflare Workers API (Hono)
│   ├── scripts/                  # 构建脚本 (codegen, image processing)
│   └── migrations/               # Supabase 数据库迁移
└── .github/workflows/            # CI/CD
    └── cms-deploy.yml            # 构建 + SFTP 部署到 Hostinger
```

## 技术栈

| 层 | 技术 |
|---|------|
| 官网 | React 18, Vite 7, Tailwind CSS, recharts |
| 管理后台 | React 18, Vite 6, Tailwind CSS, Fluent 2 设计 |
| API | Cloudflare Workers (Hono), TypeScript |
| 数据库 | Supabase (PostgreSQL + Storage) |
| 认证 | Supabase Auth + JWT |
| 部署 | GitHub Actions → SFTP → Hostinger |
| 图片处理 | Sharp (WebP 多尺寸变体) |

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

> Worker 依赖 Supabase 连接，本地开发需在 `wrangler.toml` 的 `[vars]` 中填入相关环境变量。

## 内容管理流程

```
1. 登录管理后台 → 编辑内容 → 保存
       ↓
2. 内容存入 Supabase (草稿/已发布)
       ↓
3. 点击「部署」→ 触发 GitHub Actions
       ↓
4. Codegen: 从 Supabase 拉取已发布内容 → 生成 JS/MD 文件
       ↓
5. Vite 构建 → 静态文件 → SFTP 上传到 Hostinger
       ↓
6. 官网更新 ✓
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
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put JWT_SECRET
npx wrangler secret put GITHUB_TOKEN
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
