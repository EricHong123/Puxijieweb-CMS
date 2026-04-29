# Puxijietech 项目架构梳理

## 1. 项目定位

这是一个以内容展示和询盘转化为主的企业网站项目，核心目标包括：

- 展示产品与型号页
- 展示公司、FAQ、帮助中心等品牌内容页
- 承载多语言 SEO 页面
- 承载下载、证书、报告等静态资源

技术上它不是复杂业务系统，更接近“营销站 + 产品目录 + 静态内容站”。

## 2. 当前技术结构

### 根目录

当前仓库使用了一个很轻量的 monorepo 外壳：

- `package.json`
  统一转发 `dev/build/lint`
- `apps/web`
  实际网站应用
- `dist`
  构建产物

结论：当前真正需要关注的基本只有 `apps/web`。

## 3. 当前 apps/web 结构

### 配置层

- `apps/web/package.json`
- `apps/web/vite.config.js`
- `apps/web/tailwind.config.js`
- `apps/web/postcss.config.js`
- `apps/web/eslint.config.mjs`
- `apps/web/jsconfig.json`

### 运行时源码

- `apps/web/src/app`
  React 入口、路由入口、全局样式
- `apps/web/src/features`
  按业务域组织页面、数据、组件与 feature 级资源
- `apps/web/src/shared`
  全站共享组件、hooks、lib、seo、ui

当前已经收口出的主要业务域：

- `src/features/home`
- `src/features/products`
- `src/features/news`
- `src/features/faq`
- `src/features/company`
- `src/features/legal`
- `src/features/site`

### 内容与静态资源

- `apps/web/content/news/*`
  多语言新闻 markdown
- `apps/web/public`
  直接对外发布的静态资源
- `apps/web/public/catalog-downloads`
  产品目录下载文件
- `apps/web/public/reports`
  大量证书/测试报告
- `apps/web/public/specs`
  产品规格书
- `apps/web/public/images`
  SEO 图、logo、二维码等
- `apps/web/src/features/**/assets`
  仅供源码 import 的业务图片
- `apps/web/src/shared/site/assets`
  站点共享品牌资源

### 构建与辅助脚本

- `apps/web/tools`
  构建、生成、图片转换、SEO 文件生成脚本
- `apps/web/plugins`
  Vite 自定义插件

## 4. 当前架构的主要问题

### 当前已落地进度

已经完成的重构包括：

- `src/app` 取代原 `src/main.jsx + src/App.jsx`
- `src/pages / src/data / src/components` 里的主要网站模块已迁入 `src/features/*`
- `src/components/ui` 已迁入 `src/shared/ui`
- `src/lib` 和 `src/hooks` 已迁入 `src/shared/lib` 与 `src/shared/hooks`
- 原先统一放在 `src/assets` 的站内图片，已按 `home / company / products / shared site` 下沉到对应模块

当前剩余工作主要集中在：

- `public` 下载与报告目录进一步规范
- `products.js` 继续细拆
- `content/news` 的内容读取层进一步模块化

### 问题 1：源码按技术类型堆放，不按业务模块组织

现在是：

- `pages`
- `components`
- `data`
- `lib`

这种方式在页面少时可用，但随着产品页、内容页、语言、SEO 模块增加，容易出现：

- 页面逻辑和对应数据分离过远
- 产品相关代码散落在 `pages/components/data/lib/assets`
- 新人接手时不容易快速定位一个业务模块的完整实现

### 问题 2：`products.js` 过重，数据文件承担了太多职责

`src/data/products.js` 同时包含：

- 图片导入
- 产品主数据
- 下载资源
- 产品关联关系
- 部分展示文案

这会导致：

- 文件越来越大
- 任意小改动都要动同一个大文件
- 不利于拆分产品模型、资源、翻译、SEO 信息

### 问题 3：页面层偏厚

像 `HomePage.jsx` 这类页面同时承担：

- SEO
- 动效
- 轮播交互
- 页面布局
- 内容数据

这会让页面文件持续膨胀，降低复用性和可测试性。

### 问题 4：静态资源边界不够清晰

当前资源分布大致是：

- `src/assets`
  参与打包、响应式图片处理
- `public/images`
  直接暴露
- `public/reports`
  超大静态附件

方向本身没错，但命名和归类还不够统一，尤其是：

- 产品图片和内容图片混在大目录中
- 报告目录非常深，历史文件较多
- 中英文/型号/日期混合命名，长期维护成本高

### 问题 5：内容系统和页面系统分离不彻底

已有 `content/news/*` markdown 内容，但新闻页逻辑、内容读取、SEO 组织还未完全模块化。后续如果继续扩展 blog、case study、help 文档，会更明显。

## 5. 更适合这个网站的目标结构

建议从“按技术分层”逐步转为“按业务模块 + 基础层”组织。

推荐目标：

```text
apps/web
├── content/                      # Markdown 内容
│   ├── news/
│   ├── blog/
│   └── help/
├── public/                       # 直接发布的静态资源
│   ├── images/
│   ├── downloads/
│   ├── reports/
│   └── specs/
├── src/
│   ├── app/                      # 应用级入口
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── router.jsx
│   │   └── providers/
│   ├── shared/                   # 全站共享能力
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── seo/
│   │   └── ui/
│   ├── features/                 # 业务模块
│   │   ├── home/
│   │   ├── products/
│   │   │   ├── components/
│   │   │   ├── data/
│   │   │   ├── pages/
│   │   │   ├── utils/
│   │   │   └── assets/
│   │   ├── news/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── faq/
│   │   └── b2b/
│   ├── content-system/           # 内容读取、markdown 解析、列表构建
│   └── styles/
├── plugins/
└── tools/
```

## 6. 针对当前项目的落地拆分建议

### 第一优先级：先拆 `products`

这是当前最适合优先收口的模块。

建议把下面这些内容从全局目录迁到产品模块内：

- `src/pages/ProductListingPage.jsx`
- `src/pages/ProductDetailPage.jsx`
- `src/pages/ProductModelPage.jsx`
- `src/components/ProductCard.jsx`
- `src/components/ProductGallery.jsx`
- `src/components/CategoryFilter.jsx`
- `src/data/products.js`
- `src/data/productTranslations.js`
- `src/lib/modelSlugs.js`
- `src/lib/productI18n.js`

建议目标：

```text
src/features/products
├── assets/
├── components/
│   ├── ProductCard.jsx
│   ├── ProductGallery.jsx
│   └── CategoryFilter.jsx
├── data/
│   ├── products.catalog.js
│   ├── products.media.js
│   ├── products.translations.js
│   └── products.downloads.js
├── pages/
│   ├── ProductListingPage.jsx
│   ├── ProductDetailPage.jsx
│   └── ProductModelPage.jsx
└── utils/
    ├── modelSlugs.js
    └── productI18n.js
```

### 第二优先级：抽离站点级布局

将以下公共站点组件收口：

- `Header.jsx`
- `Footer.jsx`
- `ScrollToTop.jsx`
- `OrganizationJsonLd.jsx`
- `InquiryButton.jsx`

建议目标：

```text
src/shared/site
├── Header.jsx
├── Footer.jsx
├── ScrollToTop.jsx
├── InquiryButton.jsx
└── seo/
    └── OrganizationJsonLd.jsx
```

### 第三优先级：整理内容模块

对于新闻、帮助、SEO 内容，建议统一成内容系统：

```text
src/features/news
├── pages/
├── components/
├── loaders/
└── seo/

src/content-system
├── loaders/
├── markdown/
└── manifests/
```

这样后续无论增加 blog、帮助中心还是案例页，都不会继续散在 `pages + data + content` 三处。

### 第四优先级：重新定义静态资源规则

建议统一规则：

- `src/features/**/assets`
  只放跟某个业务模块绑定、需要被 Vite import 的资源
- `src/shared/site/assets`
  放站点级品牌资源
- `public/images`
  只放无需 import 的品牌静态图
- `public/catalog-downloads`
  当前目录册下载入口，后续可统一收口为 `public/downloads`
- `public/reports`
  合规/检测报告
- `public/specs`
  规格书

进一步建议：

- 不再恢复顶层 `src/assets`，避免再次变成全站资源堆放区
- `public/reports` 下按 `product-line / model / report-type` 组织
- 文件名统一英文 slug，中文说明放清单文件中，不直接放在文件名里

## 7. 适合当前项目的页面架构理解

从网站视角，这个项目可以拆成 5 个业务域：

### 1. 品牌展示域

- Home
- About Us
- Contact
- B2B

### 2. 产品目录域

- Products Listing
- Product Detail
- Product Model
- Catalog Downloads

### 3. 内容 SEO 域

- News
- Sitemap
- 多语言内容页面

### 4. 信任与合规域

- Warranty
- Privacy
- Terms
- Do Not Sell
- Reports / Specs / Certificates

### 5. 全站基础设施域

- i18n
- SEO 元信息
- Router
- 图片处理
- UI 组件库

这个划分比单纯看 `pages/components/data` 更适合长期维护。

## 8. 建议的重构顺序

建议不要一次性重构全部目录，按下面顺序分批进行：

1. 新建目标目录，不移动业务逻辑
2. 先迁移产品模块相关文件
3. 再迁移站点级公共组件与 shared 层
4. 再迁移 news/content 模块
5. 最后清理静态资源边界与旧目录残留

这样做的好处：

- 风险最低
- 每一步都可以跑起来验证
- 不会因为大规模路径改动影响 SEO 页面

## 9. 当前项目的简化判断

如果你问“这个项目本质上应该按什么思路管理”，我的判断是：

它不是后台系统，不应该按服务层思路去拆。

它更适合：

- 以“页面/内容/产品”三大业务对象组织
- 以“shared/ui/lib”作为基础层
- 以“public downloads/reports/specs”作为静态资产层

## 10. 结论

当前项目不是不能维护，而是已经到了需要从“能跑”过渡到“可持续维护”的阶段。

最值得先动的不是样式，也不是路由，而是：

1. 产品模块拆分
2. 公共站点组件收口
3. 内容系统独立
4. 静态资源目录规范化

如果继续沿用当前结构继续加页面、加语言、加产品，后面维护成本会明显升高。
