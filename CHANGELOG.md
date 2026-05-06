# Changelog

## v2.0.0 (2026-05-06) — CMS 大版本升级

### 数据看板增强
- 世界地图：显示客户地理分布（Google Analytics 数据）
- 设备分布：桌面/移动端/平板占比环形图
- 流量来源：Top 10 来源柱状图

### 菜单管理
- 新增 `menus` + `menu_items` 表，支持多级树形结构
- CMS 菜单管理页面：拖拽排序、三语言独立配置
- 网站 Header 导航改为动态驱动（codegen 自动生成）

### 301 跳转管理
- 新增 `redirects` 表（source_path → target_path, 301/302）
- 跳转管理 CRUD 页面

### 新闻分类
- 新增 `news_categories` / `news_category_translations` / `news_article_categories` 三表
- 文章可按分类筛选，支持多语言分类名

### 富文本编辑器
- 集成 Tiptap（React 富文本编辑器）
- 替换 page_translations.body_json 裸 textarea
- 支持加粗/斜体/标题/列表/链接/图片/撤销

### SEO 元数据
- `page_translations` + `news_articles` 新增 og_title / og_description / og_image_url / canonical_url / noindex
- 编辑器新增 "SEO 设置" 折叠区块
- SeoSidebar 增强检查项

### 用户管理
- 新增 `/users` API 路由
- CMS 用户列表 + 添加/编辑弹窗

### 侧边栏重组
- News / FAQ / Legal 归入 "页面管理" 子菜单
- 展开状态 localStorage 持久化
- 父节点活跃继承

### 网站动态化
- Header 导航菜单从 CMS 数据驱动
- Codegen 新增 `generateMenus()` / `generateRedirects()`
- menus.generated.js 自动生成三语言菜单树

### 数据库迁移
- 006: news_categories, news_category_translations, news_article_categories
- 007: page_translations / news_articles SEO 元数据字段
- 008: menus, menu_items
- 009: redirects

---

## v1.x (2025-04 – 2025-05)

### 核心功能
- 产品管理（CRUD + 多语言翻译 + 规格参数 + 图片排序）
- 新闻管理（CRUD + 关键词标签 + 定时发布）
- FAQ / 法律页面管理
- 媒体库（WebP 自动转换）
- 网站设置（SEO 默认值、联系信息、i18n）
- 全文搜索
- 版本管理 + 审计日志
- AI Agent v2（DeepSeek V4 Flash + Function Calling + 14 tools）
- 一键部署（GitHub Actions → FTP → Hostinger）

### 网站
- 多语言（en/fr/vi）
- JSON-LD 结构化数据
- hreflang + canonical
- 动态 sitemap.xml + llms.txt
- 访问统计（session_id 粒度）
