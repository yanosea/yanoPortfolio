# Project Structure

## Root Directory Organization

```
yanoPortfolio/
├── README.md                    # プロジェクト概要・セットアップ手順
├── Makefile                     # 開発・デプロイ用タスク定義
├── docker-compose.yml           # コンテナオーケストレーション
├── .env.dev                     # 開発環境設定 (git ignore)
├── .env                         # 本番環境設定 (git ignore)  
├── .kiro/                       # Kiro Spec-Driven Development
│   ├── steering/                # プロジェクト全体ガイダンス
│   └── specs/                   # 機能仕様書（進行中: cloudflare-pages-migration）
├── front/                       # フロントエンド（Astro）
├── back/                        # バックエンド（Go/Workers移行中）
├── spotify-blog-migration.md    # Cloudflare移行ドキュメント
└── yanosea-org-diagram.drawio   # システム構成図
```

## Frontend Structure (front/)

### Astro Project Layout
```
front/
├── package.json                 # フロントエンド依存関係・スクリプト
├── pnpm-lock.yaml              # パッケージバージョンロック
├── astro.config.mjs            # Astro設定（サイト・統合設定）
├── tsconfig.json               # TypeScript設定
├── tailwind.config.cjs         # TailwindCSS設定
├── nginx.conf.template         # Docker用Nginx設定テンプレート
├── Dockerfile                  # フロントエンド用コンテナ定義
├── public/                     # 静的アセット
├── src/                        # アプリケーションソースコード
└── node_modules/               # 依存関係（.gitignore）
```

### Source Code Organization (src/)
```
src/
├── components/                  # 再利用可能コンポーネント
│   ├── BlogComments.astro      # ブログコメント機能
│   ├── FontToggleButton.astro  # フォント切り替えUI
│   ├── Footer.astro            # サイトフッター
│   ├── Header.astro            # サイトヘッダー
│   ├── SpotifyStatus.astro     # Spotify連携ウィジェット
│   ├── ThemeToggleButton.astro # ダークモード切り替え
│   ├── MainLinks.astro         # メインナビゲーション
│   ├── IconLink.astro          # アイコン付きリンク
│   ├── IconTextLink.astro      # テキスト付きアイコンリンク
│   ├── Pagination.astro        # ブログページネーション
│   ├── TableOfContents.astro   # 記事目次生成
│   └── Title.astro             # ページタイトルコンポーネント
├── layouts/                    # ページレイアウト
│   ├── BaseLayout.astro        # 全ページ共通レイアウト
│   └── PageLayout.astro        # 一般ページ用レイアウト
├── pages/                      # ルーティング・ページ生成
│   ├── index.astro             # ホームページ
│   ├── 404.astro               # エラーページ
│   ├── feed.xml.js             # RSS フィード生成
│   ├── about/index.astro       # プロフィールページ
│   ├── links/index.astro       # リンク集ページ
│   └── blog/                   # ブログ関連ページ
│       ├── [...page].astro     # ブログ一覧（ページネーション）
│       ├── [...slug].astro     # 個別記事ページ
│       └── tags/[tag]/[...page].astro  # タグ別一覧
├── content/                    # Content Collections
│   ├── config.ts               # コンテンツスキーマ定義
│   ├── about/about.mdx         # プロフィールMDXコンテンツ
│   ├── links/links.mdx         # リンク集MDXコンテンツ
│   └── blog/                   # ブログ記事集
│       ├── 20240311.mdx        # 個別記事（YYYYMMDD形式）
│       └── 20240507.mdx        # 個別記事（YYYYMMDD形式）
├── libs/                       # 共通ライブラリ・ユーティリティ
│   ├── blog.ts                 # ブログ機能ヘルパー
│   ├── common.ts               # 共通関数・定数
│   ├── spotify.ts              # Spotify API連携
│   └── types/track.ts          # Spotify楽曲型定義
└── env.d.ts                    # 環境変数型定義
```

### Static Assets (public/)
```
public/
├── favicon.ico                 # サイトアイコン
└── images/                     # 画像アセット
    ├── about/flower.webp       # プロフィールページ画像
    └── blog/                   # ブログ記事画像
        ├── 20240306/dog.webp   # 記事日付別フォルダ
        └── 20240507/           # 記事リソース
            ├── dog.webp        # 記事内画像
            ├── fee-domain.webp # 料金比較画像
            ├── fee-ssl.webp    # SSL料金比較
            ├── fee-vps.webp    # VPS料金比較
            └── yanosea-org-diagram.webp  # システム図
```

## Backend Structure (back/)

### Current: Go API Server
```
back/
├── go.mod                      # Go モジュール定義
├── go.sum                      # 依存関係チェックサム
├── Dockerfile                  # バックエンド用コンテナ定義
├── main.go                     # アプリケーションエントリポイント
├── router/router.go            # HTTPルーティング設定
├── handler/api/                # APIエンドポイントハンドラ
│   ├── lastplayed.go          # 最後に再生した楽曲API
│   └── nowplaying.go          # 現在再生中楽曲API
├── logic/                      # ビジネスロジック層
│   ├── lastplayed.go          # 最後再生楽曲取得処理
│   └── nowplaying.go          # 現在再生楽曲取得処理
└── auth/spotify.go             # Spotify OAuth2認証処理
```

### Migration Target: Cloudflare Workers
```
back/
├── wrangler.toml               # Workers設定・デプロイ設定
├── package.json                # Workers依存関係
├── src/                        # Workers ソースコード
│   ├── index.js                # Workers エントリポイント
│   ├── spotify.js              # Spotify API連携
│   └── utils.js                # ユーティリティ関数
└── types/                      # TypeScript型定義
```

## Content Organization

### MDX Blog Posts
- **ファイル名**: YYYYMMDD.mdx 形式（例: 20240507.mdx）
- **Frontmatter**: 日付、タイトル、説明、タグ、画像メタデータ
- **画像**: `/public/images/blog/{YYYYMMDD}/` に配置
- **言語**: 主に日本語、英語コメント併記

### Content Collections Schema
```typescript
// content/config.ts
const blog = defineCollection({
  type: "content",
  schema: z.object({
    date: z.date(),                    // 投稿日
    title: z.string(),                 // 記事タイトル
    title_icon: z.string(),            # タイトルアイコン
    description: z.string(),           // SEO説明文
    images: z.array(z.object({         // 記事内画像
      url: z.string(),
      alt: z.string(),
    }).optional()),
    tags: z.array(z.string()).optional(), // タグ分類
  }),
});
```

## File Naming Conventions

### Component Files
- **Astro Components**: PascalCase.astro（例: SpotifyStatus.astro）
- **Layout Files**: PascalCase.astro（例: BaseLayout.astro）
- **Page Files**: kebab-case.astro またはルーティング規約

### Library Files  
- **TypeScript Files**: camelCase.ts（例: blogHelper.ts）
- **Type Definition**: camelCase.ts（例: track.ts）
- **Utility Functions**: camelCase.ts（例: common.ts）

### Content Files
- **Blog Posts**: YYYYMMDD.mdx（例: 20240311.mdx）
- **Static Content**: descriptive-name.mdx（例: about.mdx）
- **Images**: kebab-case.webp（例: system-diagram.webp）

## Import Organization

### Import Order (TypeScript/Astro)
1. **External libraries** (astro, react, etc.)
2. **Internal components** (../components/)
3. **Internal utilities** (../libs/)
4. **Type imports** (../types/)
5. **Static assets** (images, etc.)

### Example Import Structure
```typescript
// External
import { defineCollection, z } from "astro:content";
import moment from "moment";

// Components
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";

// Utilities  
import { formatDate } from "../libs/common";
import { getSpotifyTrack } from "../libs/spotify";

// Types
import type { Track } from "../libs/types/track";
```

## Key Architectural Principles

### 1. **Content-First Design**
- Astro Content Collectionsによる型安全コンテンツ管理
- MDX使用でMarkdown + Reactコンポーネント統合
- 静的サイト生成による高速ロード・SEO最適化

### 2. **Monorepo Organization**  
- Frontend/Backend 分離による関心の分離
- 統一されたMakefileによる開発フロー管理
- Docker Compose統合環境による本番環境近似

### 3. **Progressive Enhancement**
- 基本機能はSSG、動的機能はクライアントサイドで拡張
- Spotify連携: 初期データSSG + 定期更新JavaScript
- テーマ・フォント切り替え: 基本CSS + JavaScript強化

### 4. **Performance-First**
- 静的アセット最適化（画像WebP、CSS/JS圧縮）
- 日本語フォント subsets使用による読み込み最適化  
- Critical CSS インライン化、非同期リソース読み込み

### 5. **Developer Experience**
- TypeScript全面採用による型安全性
- Prettier統一フォーマット、ESLint品質管理
- Volta Node.jsバージョン管理、pnpm高速インストール
- Make/Docker 統合による環境構築簡素化