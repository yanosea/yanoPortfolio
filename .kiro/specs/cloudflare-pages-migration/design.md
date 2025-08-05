# Design Document

## Overview

yanosea個人ポートフォリオサイトのCloudflareエコシステム完全移行における技術設計書。モノレポ構成を維持しながら、Docker+VPS環境からCloudflare Pages+Workers+KVへの段階的移行アプローチを定義する。

## アーキテクチャ設計

### 現在のアーキテクチャ
```
Current Architecture (Docker + VPS)
┌─────────────────────────────────────────┐
│ yanosea.org (VPS + Reverse Proxy)       │
├─────────────────────────────────────────┤
│ Docker Compose                          │
│ ┌─────────────┐  ┌─────────────────────┐│
│ │ Front       │  │ Back                ││
│ │ - Astro SSG │  │ - Go Echo           ││
│ │ - Static    │  │ - Spotify API       ││
│ │ - MDX Blog  │  │ - OAuth2            ││
│ └─────────────┘  └─────────────────────┘│
└─────────────────────────────────────────┘
```

### 移行後アーキテクチャ
```
Target Architecture (Cloudflare Ecosystem)
┌─────────────────────────────────────────────────────────┐
│ yanosea.org (Cloudflare Registrar + DNS)                │
├─────────────────────────────────────────────────────────┤
│ Edge Network (200+ Locations)                          │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────┐│
│ │ Pages          │ │ Workers         │ │ KV Storage  ││
│ │ - Astro SSG    │ │ - JavaScript    │ │ - Cache     ││
│ │ - Static CDN   │ │ - Spotify API   │ │ - Tokens    ││
│ │ - Auto Deploy  │ │ - Edge Runtime  │ │ - Temp Data ││
│ └─────────────────┘ └─────────────────┘ └─────────────┘│
├─────────────────────────────────────────────────────────┤
│ Security & Performance Layer                            │
│ - WAF, DDoS Protection, Auto SSL, HTTP/3               │
└─────────────────────────────────────────────────────────┘
```

### データフロー設計
```
User Request Flow
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Browser │───▶│ Cloudflare  │───▶│ Pages       │───▶│ Static      │
│         │    │ Edge        │    │ (Astro SSG) │    │ Response    │
└─────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                      │
                      ▼ (API Request)
               ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
               │ Workers     │───▶│ KV Storage  │───▶│ Spotify API │
               │ (Edge API)  │    │ (Cache)     │    │ (External)  │
               └─────────────┘    └─────────────┘    └─────────────┘
```

## コンポーネント設計

### 1. フロントエンド（Cloudflare Pages）

#### Astro設定更新
**ファイル**: `front/astro.config.mjs`
```javascript
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import mdx from "@astrojs/mdx";
import partytown from "@astrojs/partytown";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  site: 'https://yanosea.org',
  output: 'static', // 明示的に静的生成
  integrations: [
    icon(),
    mdx(),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
    (await import("@playform/compress")).default({
      Exclude: [".*hoisted.*"]
    }),
    sitemap(),
    tailwind(),
  ],
  server: { 
    port: parseInt(process.env.FRONT_PORT, 10) || 4321, 
    host: true 
  },
  image: {
    remotePatterns: [{ protocol: "https" }]
  }
});
```

#### Spotify連携コンポーネント更新
**ファイル**: `front/src/components/SpotifyStatus.astro`
```astro
---
// 環境別APIエンドポイント
const isDev = import.meta.env.DEV;
const SPOTIFY_API_URL = isDev 
  ? 'http://localhost:8787/api/spotify/status'  // Wrangler dev
  : import.meta.env.PUBLIC_SPOTIFY_API_URL || 'https://spotify-tracker.yanosea-workers.dev/api/spotify/status';

// サーバーサイドでの初期データ取得
let spotifyData = null;
try {
  const response = await fetch(SPOTIFY_API_URL, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    }
  });
  if (response.ok) {
    spotifyData = await response.json();
  }
} catch (error) {
  console.error('Initial Spotify fetch failed:', error);
}
---

{spotifyData && spotifyData.track ? (
  <div class="spotify-status" data-spotify-api={SPOTIFY_API_URL}>
    <div class="spotify-content">
      <img 
        src={spotifyData.track.image} 
        alt={`${spotifyData.track.album} album cover`}
        class="spotify-album-art"
        width="60"
        height="60"
        loading="lazy"
      />
      <div class="spotify-info">
        <div class="spotify-status-text" data-status>
          {spotifyData.isPlaying ? '🎵 Now Playing' : '⏸️ Last Played'}
        </div>
        <div class="spotify-track" data-track>{spotifyData.track.name}</div>
        <div class="spotify-artist" data-artist>{spotifyData.track.artist}</div>
        {spotifyData.playedAt && (
          <div class="spotify-time" data-time>
            {new Date(spotifyData.playedAt).toLocaleTimeString('ja-JP', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}
      </div>
    </div>
  </div>
) : (
  <div class="spotify-status spotify-offline">
    <div class="spotify-content">
      <div class="spotify-offline-icon">🎵</div>
      <div class="spotify-info">
        <div class="spotify-status-text">Music Offline</div>
      </div>
    </div>
  </div>
)}

<script>
// クライアントサイドでの定期更新
class SpotifyUpdater {
  constructor() {
    this.element = document.querySelector('[data-spotify-api]');
    this.apiUrl = this.element?.dataset.spotifyApi;
    this.updateInterval = 60000; // 1分間隔
    this.isUpdating = false;
  }

  async init() {
    if (!this.apiUrl) return;
    
    // 定期更新開始
    setInterval(() => this.updateTrack(), this.updateInterval);
    
    // Page Visibility API対応
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.updateTrack();
      }
    });
  }

  async updateTrack() {
    if (this.isUpdating) return;
    this.isUpdating = true;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const data = await response.json();
        this.updateDisplay(data);
      }
    } catch (error) {
      console.error('Spotify update failed:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  updateDisplay(data) {
    if (!data.track) return;

    const statusEl = document.querySelector('[data-status]');
    const trackEl = document.querySelector('[data-track]');
    const artistEl = document.querySelector('[data-artist]');
    const timeEl = document.querySelector('[data-time]');
    const albumArt = document.querySelector('.spotify-album-art');

    if (statusEl) {
      statusEl.textContent = data.isPlaying ? '🎵 Now Playing' : '⏸️ Last Played';
    }
    if (trackEl) trackEl.textContent = data.track.name;
    if (artistEl) artistEl.textContent = data.track.artist;
    if (albumArt) albumArt.src = data.track.image;
    
    if (timeEl && data.playedAt) {
      timeEl.textContent = new Date(data.playedAt).toLocaleTimeString('ja-JP', {
        hour: '2-digit', minute: '2-digit'
      });
    }
  }
}

// 初期化
if (typeof window !== 'undefined') {
  const updater = new SpotifyUpdater();
  document.addEventListener('DOMContentLoaded', () => updater.init());
}
</script>

<style>
  .spotify-status {
    background: var(--spotify-bg, linear-gradient(135deg, #1a1a1a, #2d2d2d));
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    max-width: 350px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .spotify-status:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }
  
  .spotify-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }
  
  .spotify-album-art {
    border-radius: 8px;
    object-fit: cover;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  
  .spotify-info {
    flex: 1;
    min-width: 0;
  }
  
  .spotify-status-text {
    font-size: 12px;
    color: #1DB954;
    margin-bottom: 6px;
    font-weight: 600;
  }
  
  .spotify-track {
    font-size: 16px;
    font-weight: 700;
    color: var(--text-primary, #ffffff);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }
  
  .spotify-artist {
    font-size: 14px;
    color: var(--text-secondary, #b3b3b3);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;
  }

  .spotify-time {
    font-size: 12px;
    color: var(--text-muted, #666);
  }

  .spotify-offline {
    opacity: 0.7;
  }

  .spotify-offline-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  /* ダークモード対応 */
  :global([data-theme="light"]) .spotify-status {
    background: linear-gradient(135deg, #ffffff, #f8f9fa);
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #1a1a1a;
  }

  :global([data-theme="light"]) .spotify-track {
    color: #1a1a1a;
  }

  :global([data-theme="light"]) .spotify-artist {
    color: #666666;
  }
</style>
```

#### 環境変数設定
**ファイル**: `front/.env`
```bash
# Cloudflare Workers APIエンドポイント
PUBLIC_SPOTIFY_API_URL=https://spotify-tracker.yanosea-workers.dev/api/spotify/status

# Cloudflare環境識別
PUBLIC_CLOUDFLARE_ENV=production
```

**ファイル**: `front/.env.dev`
```bash
# ローカル開発用
PUBLIC_SPOTIFY_API_URL=http://localhost:8787/api/spotify/status
PUBLIC_CLOUDFLARE_ENV=development

# 既存の設定維持
FRONT_PORT=4321
```

### 2. バックエンド（Cloudflare Workers）

#### Workers設定
**ファイル**: `back/wrangler.toml`
```toml
name = "spotify-tracker"
main = "src/index.js"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

# KV Storage設定
kv_namespaces = [
  { binding = "SPOTIFY_CACHE", id = "your-kv-namespace-id", preview_id = "your-preview-kv-id" }
]

# 環境変数（非機密情報）
[vars]
SPOTIFY_CLIENT_ID = "your-spotify-client-id"
CORS_ORIGIN_PROD = "https://yanosea.org"
CORS_ORIGIN_DEV = "*"
CACHE_TTL_SECONDS = 60
TOKEN_REFRESH_MARGIN = 300

# 開発環境設定
[env.development]
name = "spotify-tracker-dev"
vars = { ENVIRONMENT = "development" }

[env.production] 
name = "spotify-tracker-prod"
vars = { ENVIRONMENT = "production" }

# ルーティング（カスタムドメイン）
[[routes]]
pattern = "api.yanosea.org/*"
zone_name = "yanosea.org"
```

#### Workers実装
**ファイル**: `back/src/index.js`
```javascript
// Cloudflare Workers Entry Point
export default {
  async fetch(request, env, ctx) {
    return await handleRequest(request, env, ctx);
  }
};

async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  
  // CORS設定
  const corsHeaders = getCorsHeaders(env);
  
  // Preflight request処理
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // ヘルスチェック
  if (url.pathname === '/health') {
    return Response.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: env.ENVIRONMENT 
    }, { headers: corsHeaders });
  }

  // Spotify API エンドポイント
  if (url.pathname === '/api/spotify/status') {
    return await handleSpotifyStatus(request, env, corsHeaders);
  }

  // 404
  return new Response('Not Found', { 
    status: 404, 
    headers: corsHeaders 
  });
}

async function handleSpotifyStatus(request, env, corsHeaders) {
  try {
    // レート制限チェック
    const rateLimitKey = `rate_limit:${getClientIP(request)}`;
    const rateLimitCount = await env.SPOTIFY_CACHE.get(rateLimitKey);
    
    if (rateLimitCount && parseInt(rateLimitCount) > 30) { // 30req/min
      return Response.json({
        error: 'Rate limit exceeded',
        isPlaying: false
      }, { 
        status: 429, 
        headers: { ...corsHeaders, 'Retry-After': '60' }
      });
    }

    // キャッシュチェック
    const cached = await getCachedSpotifyStatus(env);
    if (cached) {
      await incrementRateLimit(env, rateLimitKey);
      return Response.json(cached, { headers: corsHeaders });
    }

    // 新しいデータ取得
    const spotifyData = await fetchSpotifyData(env);
    
    // キャッシュ保存
    await cacheSpotifyStatus(env, spotifyData);
    await incrementRateLimit(env, rateLimitKey);

    return Response.json(spotifyData, { 
      headers: { 
        ...corsHeaders,
        'Cache-Control': 'public, max-age=30'
      }
    });

  } catch (error) {
    console.error('Spotify API Error:', error);
    
    return Response.json({
      error: 'Failed to fetch Spotify status',
      isPlaying: false,
      track: null
    }, { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}

async function fetchSpotifyData(env) {
  // 有効なアクセストークン取得
  const accessToken = await getValidAccessToken(env);
  
  // 現在再生中チェック
  const currentlyPlaying = await fetch(
    'https://api.spotify.com/v1/me/player/currently-playing', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (currentlyPlaying.status === 200) {
    const playingData = await currentlyPlaying.json();
    if (playingData && playingData.item) {
      return formatTrackData(playingData, true);
    }
  }

  // フォールバック: 最近再生した楽曲
  const recentlyPlayed = await fetch(
    'https://api.spotify.com/v1/me/player/recently-played?limit=1', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (recentlyPlayed.status === 200) {
    const recentData = await recentlyPlayed.json();
    if (recentData.items && recentData.items.length > 0) {
      return formatTrackData(recentData.items[0], false);
    }
  }

  // データなし
  return {
    isPlaying: false,
    track: null,
    error: 'No track data available'
  };
}

async function getValidAccessToken(env) {
  const tokenKey = 'spotify_access_token';
  const cachedToken = await env.SPOTIFY_CACHE.get(tokenKey, { type: 'json' });
  
  // 有効期限チェック（余裕を持って5分前）
  const now = Date.now();
  const refreshMargin = (env.TOKEN_REFRESH_MARGIN || 300) * 1000;
  
  if (cachedToken && now < (cachedToken.expires_at - refreshMargin)) {
    return cachedToken.access_token;
  }

  // トークンリフレッシュ
  const newToken = await refreshAccessToken(env);
  
  // 新しいトークンをキャッシュ
  const expiresAt = now + (newToken.expires_in * 1000);
  await env.SPOTIFY_CACHE.put(tokenKey, JSON.stringify({
    access_token: newToken.access_token,
    expires_at: expiresAt,
    refreshed_at: now
  }), { expirationTtl: newToken.expires_in });

  return newToken.access_token;
}

async function refreshAccessToken(env) {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${btoa(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`)}`
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN
    })
  });

  if (!response.ok) {
    throw new Error(`Token refresh failed: ${response.status}`);
  }

  return await response.json();
}

function formatTrackData(data, isCurrentlyPlaying) {
  const track = isCurrentlyPlaying ? data.item : data.track;
  
  return {
    isPlaying: isCurrentlyPlaying,
    track: {
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url,
      external_url: track.external_urls.spotify
    },
    playedAt: isCurrentlyPlaying ? null : data.played_at,
    timestamp: new Date().toISOString()
  };
}

async function getCachedSpotifyStatus(env) {
  const cacheKey = 'spotify_status';
  const cached = await env.SPOTIFY_CACHE.get(cacheKey, { type: 'json' });
  
  if (!cached) return null;
  
  const cacheAge = Date.now() - cached.timestamp;
  const ttl = (env.CACHE_TTL_SECONDS || 60) * 1000;
  
  return cacheAge < ttl ? cached.data : null;
}

async function cacheSpotifyStatus(env, data) {
  const cacheKey = 'spotify_status';
  const cacheData = {
    timestamp: Date.now(),
    data: data
  };
  
  const ttl = env.CACHE_TTL_SECONDS || 60;
  await env.SPOTIFY_CACHE.put(cacheKey, JSON.stringify(cacheData), {
    expirationTtl: ttl
  });
}

function getCorsHeaders(env) {
  const isDev = env.ENVIRONMENT === 'development';
  const origin = isDev ? env.CORS_ORIGIN_DEV : env.CORS_ORIGIN_PROD;
  
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json'
  };
}

function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Forwarded-For') || 
         'unknown';
}

async function incrementRateLimit(env, key) {
  const current = await env.SPOTIFY_CACHE.get(key) || '0';
  const newCount = parseInt(current) + 1;
  await env.SPOTIFY_CACHE.put(key, newCount.toString(), { expirationTtl: 60 });
}
```

#### package.json設定
**ファイル**: `back/package.json`
```json
{
  "name": "yanosea-workers",
  "version": "1.0.0",
  "description": "Cloudflare Workers for yanosea.org",
  "main": "src/index.js",
  "scripts": {
    "dev": "wrangler dev --port 8787 --compatibility-date=2024-01-01",
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production",
    "deploy:dev": "wrangler deploy --env development",
    "tail": "wrangler tail",
    "kv:create": "wrangler kv:namespace create SPOTIFY_CACHE",
    "secret:put": "wrangler secret put"
  },
  "devDependencies": {
    "wrangler": "^3.78.12"
  },
  "engines": {
    "node": ">=18"
  }
}
```

### 3. CI/CD（GitHub Actions）

#### Pages Deploy Workflow
**ファイル**: `.github/workflows/deploy-pages.yml`
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
    paths: [ 'front/**', '.github/workflows/deploy-pages.yml' ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'production'
        type: choice
        options: ['production', 'preview']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment || 'production' }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '21.6.2'
          cache: 'pnpm'
          cache-dependency-path: front/pnpm-lock.yaml

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: latest

      - name: Install dependencies
        run: |
          cd front
          pnpm install --frozen-lockfile

      - name: Run build checks
        run: |
          cd front
          pnpm run astro check

      - name: Build site
        run: |
          cd front
          pnpm run build
        env:
          PUBLIC_SPOTIFY_API_URL: ${{ vars.PUBLIC_SPOTIFY_API_URL }}
          NODE_ENV: production

      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: yanoportfolio
          directory: front/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
          wranglerVersion: '3'

      - name: Notify deployment
        if: success()
        run: |
          echo "✅ Pages deployment successful!"
          echo "🌐 URL: https://yanosea.org"
```

#### Workers Deploy Workflow  
**ファイル**: `.github/workflows/deploy-workers.yml`
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [ main ]
    paths: [ 'back/**', '.github/workflows/deploy-workers.yml' ]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'production'
        type: choice
        options: ['production', 'development']

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment || 'production' }}
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '21.6.2'
          cache: 'npm'
          cache-dependency-path: back/package-lock.json

      - name: Install dependencies
        run: |
          cd back
          npm ci

      - name: Validate wrangler config
        run: |
          cd back
          npx wrangler config validate

      - name: Deploy Workers
        run: |
          cd back
          npx wrangler deploy --env ${{ inputs.environment || 'production' }}
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

      - name: Notify deployment
        if: success()
        run: |
          echo "⚡ Workers deployment successful!"
          echo "🔗 API: https://spotify-tracker.yanosea-workers.dev"
```

### 4. 開発環境統合（Makefile更新）

**ファイル**: `Makefile`
```makefile
# Variables
BACK_DIR := ./back
FRONT_DIR := ./front
RUN_FILE := ./.yanoPortfolio.run
DEV_ENV_FILE := ./.env.dev
BACK_PID_FILE := $(BACK_DIR)/.pid
FRONT_PID_FILE := $(FRONT_DIR)/.pid

# Environment variables
ifneq (,$(wildcard $(DEV_ENV_FILE)))
	include $(DEV_ENV_FILE)
	export
endif

.DEFAULT_GOAL := help

#
# Cloudflare Development
#
.PHONY: dev.start dev.stop dev.front.start dev.front.stop dev.back.start dev.back.stop

# Start both frontend and backend for Cloudflare development
dev.start: dev.back.start dev.front.start
	@echo ""
	@echo "🚀 Cloudflare development environment started!"
	@echo "📄 Frontend: http://localhost:$(FRONT_PORT)"
	@echo "⚡ Backend: http://localhost:8787"
	@echo ""

# Stop both development servers
dev.stop: dev.back.stop dev.front.stop
	@echo ""
	@echo "🛑 Development servers stopped!"
	@echo ""

# Start frontend (Astro) development server
dev.front.start:
	@set -e; \
	if [ -e $(FRONT_PID_FILE) ]; then \
		echo "Frontend already running..."; \
		exit 1; \
	fi; \
	cd $(FRONT_DIR) && \
	echo "🔧 Installing frontend dependencies..." && \
	if command -v pnpm >/dev/null 2>&1; then \
		pnpm install; \
	else \
		npm install; \
	fi && \
	echo "🌐 Starting Astro development server..." && \
	set -a && source ../$(DEV_ENV_FILE) && set +a && \
	(pnpm start > /dev/null 2>&1 || npm start > /dev/null 2>&1) & \
	sleep 3 && \
	SERVER_PID=$$(lsof -i:$(FRONT_PORT) -t); \
	if [ -z "$$SERVER_PID" ]; then \
		echo "❌ Failed to start frontend server"; \
		exit 1; \
	fi; \
	echo $$SERVER_PID > $(FRONT_PID_FILE) && \
	echo "✅ Frontend server started on port $(FRONT_PORT) (PID: $$SERVER_PID)"

# Start backend (Wrangler) development server  
dev.back.start:
	@set -e; \
	if [ -e $(BACK_PID_FILE) ]; then \
		echo "Backend already running..."; \
		exit 1; \
	fi; \
	cd $(BACK_DIR) && \
	echo "🔧 Installing backend dependencies..." && \
	npm install && \
	echo "⚡ Starting Wrangler development server..." && \
	set -a && source ../$(DEV_ENV_FILE) && set +a && \
	npx wrangler dev --port 8787 > /dev/null 2>&1 & \
	sleep 3 && \
	SERVER_PID=$$(lsof -i:8787 -t); \
	if [ -z "$$SERVER_PID" ]; then \
		echo "❌ Failed to start backend server"; \
		exit 1; \
	fi; \
	echo $$SERVER_PID > $(BACK_PID_FILE) && \
	echo "✅ Backend server started on port 8787 (PID: $$SERVER_PID)"

# Stop frontend server
dev.front.stop:
	@set -e; \
	if [ ! -e $(FRONT_PID_FILE) ]; then \
		echo "Frontend server not running..."; \
		exit 1; \
	fi; \
	PID=$$(cat $(FRONT_PID_FILE)); \
	if ps -p $$PID > /dev/null; then \
		kill $$PID; \
	fi; \
	rm -f $(FRONT_PID_FILE); \
	echo "🛑 Frontend server stopped"

# Stop backend server
dev.back.stop:
	@set -e; \
	if [ ! -e $(BACK_PID_FILE) ]; then \
		echo "Backend server not running..."; \
		exit 1; \
	fi; \
	PID=$$(cat $(BACK_PID_FILE)); \
	if ps -p $$PID > /dev/null; then \
		kill $$PID; \
	fi; \
	rm -f $(BACK_PID_FILE); \
	echo "🛑 Backend server stopped"

#
# Cloudflare Deployment
#
.PHONY: deploy deploy.front deploy.back

# Deploy both frontend and backend
deploy: deploy.back deploy.front
	@echo ""
	@echo "🚀 Full deployment completed!"
	@echo ""

# Deploy frontend to Cloudflare Pages
deploy.front:
	@echo "📄 Deploying frontend to Cloudflare Pages..."
	@cd $(FRONT_DIR) && \
	pnpm install && \
	pnpm run build && \
	echo "✅ Frontend deployment triggered via Pages integration"

# Deploy backend to Cloudflare Workers
deploy.back:
	@echo "⚡ Deploying backend to Cloudflare Workers..."
	@cd $(BACK_DIR) && \
	npm install && \
	npx wrangler deploy --env production && \
	echo "✅ Backend deployed successfully"

#
# Legacy Docker Support (for migration period)
#
.PHONY: docker.start docker.stop

# Legacy Docker start (for rollback)
docker.start:
	@echo "🐳 Starting legacy Docker environment..."
	@docker-compose -f docker-compose.yml build --no-cache
	@docker-compose -f docker-compose.yml up -d
	@touch $(RUN_FILE)
	@echo "✅ Legacy environment started"

# Legacy Docker stop
docker.stop:
	@echo "🐳 Stopping legacy Docker environment..."
	@docker-compose down
	@docker image prune -af
	@rm -f $(RUN_FILE)
	@echo "🛑 Legacy environment stopped"

# Help
.PHONY: help
help:
	@echo ""
	@echo "🚀 Cloudflare Development Commands:"
	@echo ""
	@echo "  dev.start       - Start full development environment"
	@echo "  dev.stop        - Stop all development servers"
	@echo "  dev.front.start - Start Astro frontend only (port $(FRONT_PORT))"
	@echo "  dev.front.stop  - Stop frontend server"
	@echo "  dev.back.start  - Start Wrangler backend only (port 8787)"
	@echo "  dev.back.stop   - Stop backend server"
	@echo ""
	@echo "  deploy          - Deploy both frontend and backend"
	@echo "  deploy.front    - Deploy frontend to Pages"
	@echo "  deploy.back     - Deploy backend to Workers"
	@echo ""
	@echo "🐳 Legacy Docker Commands (for rollback):"
	@echo "  docker.start    - Start legacy Docker environment"
	@echo "  docker.stop     - Stop legacy Docker environment"
	@echo ""
```

## セキュリティ設計

### 認証・認可
- **Spotify認証**: OAuth2 Refresh Token方式
- **Secrets管理**: Cloudflare Secrets（暗号化保存）
- **CORS設定**: 本番環境では`yanosea.org`のみ許可
- **レート制限**: IP別30req/minの制限実装

### データ保護
- **機密情報**: KVStorageにアクセストークンのみ（暗号化済み）
- **個人情報**: 一切保存しない（GDPR準拠）
- **キャッシュ戦略**: 1分間のみの一時保存
- **トラフィック**: 全てHTTPS強制、HTTP/3対応

## パフォーマンス設計

### 最適化戦略
- **Edge Computing**: 200+拠点での分散処理
- **Static Generation**: Astro SSGによる事前生成
- **Intelligent Caching**: 多層キャッシュ戦略
- **Asset Optimization**: WebP変換、圧縮最適化

### 監視・メトリクス
- **Core Web Vitals**: LCP<2.5s, FID<100ms, CLS<0.1
- **API Response**: 平均500ms以内
- **Cache Hit Rate**: 95%以上を目標
- **Availability**: 99.9%稼働率

## 移行計画

### Phase 1: Infrastructure Setup (Week 1)
1. Cloudflare アカウント・サービス設定
2. KV Namespace作成・設定
3. GitHub Actions環境準備
4. 開発環境構築

### Phase 2: Backend Migration (Week 1-2)  
1. Workers実装・テスト
2. Spotify API連携移行
3. KV Storage統合
4. セキュリティ・パフォーマンステスト

### Phase 3: Frontend Migration (Week 2-3)
1. Pages設定・ビルド最適化
2. コンポーネント更新・統合テスト
3. カスタムドメイン設定
4. SSL・セキュリティ設定

### Phase 4: Go-Live (Week 3-4)
1. DNS切り替え準備
2. 本番デプロイ・検証
3. 監視・ログ設定
4. 旧環境停止・クリーンアップ

---
**STATUS**: Design completed and ready for review  
**NEXT STEP**: Run `/kiro:spec-tasks cloudflare-pages-migration` after reviewing this design