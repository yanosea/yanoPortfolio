# Technology Stack

## Architecture
**モノレポ構成**: フロントエンドとバックエンドを単一リポジトリで管理する統合開発環境

### Current Architecture
```
yanosea.org
├── Frontend (Astro SSG) - front/
│   ├── 静的サイト生成
│   ├── MDX ブログ記事
│   └── TypeScript + TailwindCSS
├── Backend (Go API) - back/
│   ├── Spotify Web API連携  
│   ├── Echo フレームワーク
│   └── OAuth2 認証
└── Development (Docker + Makefile)
    ├── 統合開発環境
    └── プロダクション・デプロイ
```

### Migration Target: Cloudflare Ecosystem
```
yanosea.org (Cloudflare Registrar)
├── Cloudflare Pages (Astro SSG) - front/
├── Cloudflare Workers (JavaScript API) - back/
├── Cloudflare KV (キャッシュ) 
└── GitHub Actions (CI/CD)
```

## Frontend Stack

### Core Framework
- **Astro 5.0.9**: 静的サイト生成、コンテンツフォーカス
- **TypeScript**: 型安全性、開発者体験向上
- **Node.js 21.6.2**: Voltaでバージョン管理

### UI/Styling
- **TailwindCSS 3.4.17**: ユーティリティファーストCSS
- **@tailwindcss/typography**: ブログ記事スタイリング
- **astro-icon**: アイコン管理システム
- **日本語フォント**: @fontsource/dotgothic16, @fontsource/zen-kaku-gothic-new

### Content Management
- **@astrojs/mdx**: MDX記事執筆（Markdown + React）
- **Astro Content Collections**: 型安全コンテンツ管理
- **Zod**: コンテンツスキーマ検証

### Integrations & Optimization
- **@astrojs/sitemap**: XML サイトマップ自動生成
- **@astrojs/rss**: RSS フィード生成
- **@playform/compress**: アセット圧縮最適化
- **@astrojs/partytown**: Third-party スクリプト最適化

### Development Tools
- **pnpm**: 高速パッケージマネージャー
- **Prettier**: コード整形（astro, tailwindcss プラグイン対応）

## Backend Stack

### Current: Go API Server
- **Go 1.24.1**: 高パフォーマンス、型安全性
- **Echo v4**: 軽量Webフレームワーク
- **OAuth2**: Spotify認証・トークン管理
- **Spotify Web API**: リアルタイム音楽データ取得

### Migration Target: Cloudflare Workers
- **JavaScript/TypeScript**: エッジコンピューティング
- **Cloudflare Workers**: サーバーレス関数実行
- **Cloudflare KV**: 高速key-value ストレージ
- **Spotify Web API**: 既存連携維持

### API Endpoints
- `/api/spotify/nowplaying`: 現在再生中楽曲
- `/api/spotify/lastplayed`: 最後に再生した楽曲

## Development Environment

### Package Management
- **pnpm**: フロントエンド依存関係管理
- **Go modules**: バックエンド依存関係管理
- **Volta**: Node.js バージョン固定（21.6.2）

### Common Commands
```bash
# 開発環境
make dev.start          # 開発サーバー起動（front + back）
make dev.stop           # 開発サーバー停止
make dev.front.start    # フロントエンドのみ起動
make dev.back.start     # バックエンドのみ起動

# プロダクション
make start              # Docker Compose起動
make stop               # Docker Compose停止

# フロントエンド操作
cd front/
pnpm install            # 依存関係インストール
pnpm start              # 開発サーバー (astro dev)
pnpm build              # ビルド (astro check && astro build)
```

## Environment Variables

### Development (.env.dev)
```bash
FRONT_PORT=4321         # Astro開発サーバーポート
BACK_PORT=8080          # Go APIサーバーポート
```

### Production (.env)
```bash
FRONT_CONTAINER_NAME    # Dockerコンテナ名
BACK_CONTAINER_NAME     # Dockerコンテナ名  
FRONT_SSL_PATH          # SSL証明書パス
SPOTIFY_CLIENT_ID       # Spotify App ID
SPOTIFY_CLIENT_SECRET   # Spotify App Secret
SPOTIFY_REFRESH_TOKEN   # OAuth2リフレッシュトークン
```

### Cloudflare Migration (.env)
```bash
PUBLIC_SPOTIFY_API_URL  # Workers API エンドポイント
CLOUDFLARE_API_TOKEN    # CI/CD用認証トークン
CLOUDFLARE_ACCOUNT_ID   # アカウント識別子
```

## Port Configuration

### Development Ports
- **Frontend**: 4321 (Astro dev server)
- **Backend**: 8080 (Go Echo server)
- **Environment Variable Driven**: .env.dev で設定

### Production
- **Docker Compose**: 環境変数によるポート動的設定
- **SSL Termination**: Nginxプロキシ経由
- **Cloudflare Migration**: エッジでのSSL終端

## Build & Deployment

### Current: Docker
- **Multi-stage builds**: フロントエンド・バックエンド個別最適化
- **Nginx**: 静的ファイル配信 + APIプロキシ
- **Docker Compose**: 統合環境管理

### Migration: Cloudflare
- **GitHub Actions**: CI/CD パイプライン
- **Cloudflare Pages**: 自動ビルド・デプロイ
- **Wrangler CLI**: Workers デプロイ管理
- **Build Command**: `cd front && pnpm run build`
- **Output Directory**: `front/dist`

## Performance Considerations

### Frontend Optimization
- **Static Site Generation**: 高速初期ロード
- **Image Optimization**: WebP自動変換
- **Asset Compression**: CSS/JS minification
- **Font Loading**: 日本語Webフォント最適化

### Backend Optimization  
- **Connection Pooling**: HTTP/DB接続管理
- **Response Caching**: Spotify API レスポンス一時保存
- **Token Management**: OAuth2トークン自動更新

### Migration Benefits
- **Edge Computing**: 世界200+拠点での高速レスポンス
- **Cloudflare CDN**: 静的アセット配信最適化
- **KV Storage**: 低レイテンシ key-value アクセス