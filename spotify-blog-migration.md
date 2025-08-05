# Spotify Now Playing on Cloudflare Pages

Cloudflare PagesでホスティングしているブログにSpotifyの再生中/最後に再生した楽曲を表示するシステムの構築ガイド

**プロジェクト構造**: モノレポ継続（front/back構成を活用）  
**実装方式**: 既存backディレクトリをCloudflare Workers実装に置き換え

## 概要

### システム構成（モノレポ継続）
- **フロントエンド**: Cloudflare Pages (Astro SSG) → `front/`
- **API**: Cloudflare Workers（リアルタイム） → `back/`
- **キャッシュ**: Cloudflare Workers KV（一時的なキャッシュのみ）
- **認証**: Spotify Web API
- **ビルド・デプロイ**: GitHub Actions → Cloudflare Pages
- **開発環境**: Makefileによる統合管理

### Astro SSG対応
現在のyanoPortfolioプロジェクトはAstroフレームワークを使用しており、Cloudflare Pagesとの相性は優秀です：

**✅ 対応可能な機能**:
- MDX ブログ記事（Content Collections）
- 静的アセット最適化（画像、CSS、JS）
- RSS フィード・サイトマップ自動生成
- 日本語フォント対応
- ダークモード・レスポンシブデザイン

**🔄 移行が必要な機能**:
- **Go APIサーバー** → **Cloudflare Workers**に移行（`back/`ディレクトリ活用）
- **Docker環境** → **Cloudflare Pages**による自動ビルド・デプロイ
- **動的Spotify連携** → **静的生成 + Workers API**
- **開発環境** → **Makefileコマンド**の更新

### データフロー

```
ユーザー → Cloudflare Pages (front/) → Cloudflare Workers API (back/) → Spotify API
                                                ↓
                                       KV Storage (キャッシュのみ)
```

### 開発フロー（モノレポ）

```
開発者 → make dev.start → front/ (Astro) + back/ (Workers)
      → 統合テスト → make deploy → Cloudflare Pages + Workers
```


## 必要なサービス

1. **Spotify App** (無料)
   - Client ID/Secret取得用
   - Web APIアクセス用

2. **Cloudflare アカウント** (無料)
   - Workers: 10万リクエスト/日（実使用量: 1-2%程度）
   - KV Storage: キャッシュ専用（アクセストークン、APIレスポンスの一時保存）
   - DB保存なし、履歴記録なし

3. **GitHub** (既存)
   - リポジトリ管理・ソースコード
   - GitHub Actions（CI/CDパイプライン）

4. **独自ドメイン** (オプション)
   - Cloudflare Registrarで独自ドメイン管理

## セットアップ手順

### 1. Spotify App作成

1. [Spotify for Developers](https://developer.spotify.com/dashboard)にアクセス
2. 新規アプリ作成
3. Client ID/Secretを取得
4. Redirect URIに `http://localhost:8888/callback` を設定
5. Refresh Tokenを取得（別途認証フロー実装が必要）

### 2. Cloudflare Workers セットアップ

#### 2.1 KV Namespace作成（キャッシュ用）
```bash
# Wrangler CLIをインストール
npm install -g wrangler

# ログイン
wrangler login

# KV namespace作成（APIレスポンスとトークンのキャッシュ用）
wrangler kv:namespace create "SPOTIFY_CACHE"
```

#### 2.2 Worker作成（モノレポ構成）

既存の`back/`ディレクトリを活用してWorkers実装を配置します。

**back/wrangler.toml**
```toml
name = "spotify-tracker"
main = "src/index.js"
compatibility_date = "2024-01-01"

kv_namespaces = [
  { binding = "SPOTIFY_CACHE", id = "your-kv-namespace-id" }
]

[vars]
SPOTIFY_CLIENT_ID = "your-client-id"
```

**back/src/index.js**
```javascript
export default {
  // APIエンドポイント（リアルタイム対応）
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const headers = {
      'Access-Control-Allow-Origin': 'https://yanosea.org', // または開発時は '*'
      'Access-Control-Allow-Methods': 'GET',
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=30' // 30秒キャッシュ
    };
    
    // OPTIONS リクエストの処理
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers });
    }
    
    if (url.pathname === '/api/spotify/status') {
      try {
        // 1分以内のキャッシュがあれば使用
        const cached = await env.SPOTIFY_CACHE.get('spotify_status', { type: 'json' });
        if (cached && Date.now() - cached.timestamp < 60000) {
          return Response.json(cached.data, { headers });
        }
        
        // トークン取得
        const token = await getValidToken(env);
        
        // 現在再生中の楽曲取得
        const currentlyPlaying = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let responseData = {};
        
        if (currentlyPlaying.status === 200) {
          const playing = await currentlyPlaying.json();
          responseData = {
            isPlaying: true,
            track: {
              name: playing.item.name,
              artist: playing.item.artists[0].name,
              album: playing.item.album.name,
              image: playing.item.album.images[0].url
            }
          };
        } else {
          // 何も再生していない場合は最後に再生した楽曲
          const recentlyPlayed = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (recentlyPlayed.status === 200) {
            const recent = await recentlyPlayed.json();
            if (recent.items.length > 0) {
              const track = recent.items[0].track;
              responseData = {
                isPlaying: false,
                track: {
                  name: track.name,
                  artist: track.artists[0].name,
                  album: track.album.name,
                  image: track.album.images[0].url
                },
                playedAt: recent.items[0].played_at
              };
            }
          }
        }
        
        // キャッシュに保存
        const cacheData = {
          timestamp: Date.now(),
          data: responseData
        };
        await env.SPOTIFY_CACHE.put('spotify_status', JSON.stringify(cacheData));
        
        return Response.json(responseData, { headers });
        
      } catch (error) {
        console.error('Spotify API error:', error);
        return Response.json({ 
          isPlaying: false, 
          error: 'Failed to fetch Spotify status' 
        }, { headers, status: 500 });
      }
    }
    
    return new Response('Not Found', { status: 404 });
  }
};

// アクセストークンの取得（リフレッシュトークン対応）
async function getValidToken(env) {
  // KVからトークンを取得
  const tokenData = await env.SPOTIFY_CACHE.get('access_token', { type: 'json' });
  
  // トークンが有効期限内ならそのまま使用
  if (tokenData && Date.now() < tokenData.expires_at) {
    return tokenData.token;
  }
  
  // トークンをリフレッシュ
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(env.SPOTIFY_CLIENT_ID + ':' + env.SPOTIFY_CLIENT_SECRET)
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: env.SPOTIFY_REFRESH_TOKEN
    })
  });
  
  const data = await response.json();
  
  // 新しいトークンをKVに保存
  await env.SPOTIFY_CACHE.put('access_token', JSON.stringify({
    token: data.access_token,
    expires_at: Date.now() + (data.expires_in * 1000) - 60000 // 1分前に期限切れとする
  }));
  
  return data.access_token;
}
```

#### 2.3 デプロイ（モノレポ構成）
```bash
# backディレクトリで実行
cd back

# シークレット設定
wrangler secret put SPOTIFY_CLIENT_SECRET
wrangler secret put SPOTIFY_REFRESH_TOKEN

# デプロイ
wrangler deploy

# または Makefile 経由でのデプロイ
make deploy.back
```

### 3. Astro SSG + Cloudflare Pages セットアップ

#### 3.1 Astro設定変更

**front/astro.config.mjs**
```javascript
export default defineConfig({
  site: 'https://yanosea.org', // 独自ドメイン使用
  output: 'static', // 静的生成モード
  integrations: [
    // 既存の設定を維持
    icon(),
    mdx(),
    sitemap(),
    tailwind(),
    (await import("@playform/compress")).default()
  ]
});
```

#### 3.2 Cloudflare Pages セットアップ

##### 3.2.1 Cloudflare Pagesプロジェクト作成
1. [Cloudflare Dashboard](https://dash.cloudflare.com)にログイン
2. **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. GitHubリポジトリ選択: `yanosea/yanoPortfolio`
4. ビルド設定:
   ```
   Build command: cd front && npm run build
   Build output directory: front/dist
   Root directory: /
   Environment variables: 
     - NODE_VERSION: 21.6.2
   ```

##### 3.2.2 カスタムドメイン設定
```bash
# Cloudflare Pages Dashboard → Custom domains
# yanosea.org を追加
# DNS設定は自動で行われる（Cloudflare DNSの場合）
```

##### 3.2.3 GitHub Actions（オプション：モノレポ対応）

**.github/workflows/deploy-workers.yml**
```yaml
name: Deploy to Cloudflare Workers

on:
  push:
    branches: [ main ]
    paths: [ 'back/**' ]  # バックエンド変更時のみ
  workflow_dispatch: # 手動実行許可

jobs:
  deploy-workers:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '21.6.2'
          
      - name: Install Wrangler CLI
        run: npm install -g wrangler
          
      - name: Deploy Workers
        run: |
          cd back
          wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

**.github/workflows/deploy-pages.yml**
```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [ main ]
    paths: [ 'front/**' ]  # フロントエンド変更時のみ
  workflow_dispatch: # 手動実行許可

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        
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
          pnpm install
          
      - name: Build Astro site
        run: |
          cd front
          pnpm run build
          
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: yanoportfolio
          directory: front/dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 4. Spotify連携のアップデート

#### 4.1 Astroコンポーネント実装（推奨）

**src/components/SpotifyStatus.astro**
```astro
---
// Cloudflare Workers APIエンドポイント
const SPOTIFY_API_URL = import.meta.env.PUBLIC_SPOTIFY_API_URL || 'https://spotify-tracker.your-subdomain.workers.dev/api/spotify/status';

// サーバーサイドでデータ取得
let spotifyData = null;
try {
  const response = await fetch(SPOTIFY_API_URL);
  if (response.ok) {
    spotifyData = await response.json();
  }
} catch (error) {
  console.error('Failed to fetch Spotify data:', error);
}
---

{spotifyData && spotifyData.track && (
  <div class="spotify-status" data-spotify-api={SPOTIFY_API_URL}>
    <div class="spotify-content">
      <img 
        src={spotifyData.track.image} 
        alt={spotifyData.track.album}
        class="spotify-album-art"
        width="60"
        height="60"
      />
      <div class="spotify-info">
        <div class="spotify-status-text">
          {spotifyData.isPlaying ? '🎵 Now Playing' : '⏸️ Last Played'}
        </div>
        <div class="spotify-track">{spotifyData.track.name}</div>
        <div class="spotify-artist">{spotifyData.track.artist}</div>
      </div>
    </div>
  </div>
)}

<script>
  // クライアントサイドでの定期更新
  const spotifyElement = document.querySelector('[data-spotify-api]');
  if (spotifyElement) {
    const apiUrl = spotifyElement.dataset.spotifyApi;
    
    // 1分ごとに更新
    setInterval(async () => {
      try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        
        if (data.track) {
          // DOM更新ロジック
          updateSpotifyDisplay(data);
        }
      } catch (error) {
        console.error('Failed to update Spotify status:', error);
      }
    }, 60000);
  }
  
  function updateSpotifyDisplay(data) {
    const statusText = document.querySelector('.spotify-status-text');
    const trackName = document.querySelector('.spotify-track');
    const artistName = document.querySelector('.spotify-artist');
    const albumArt = document.querySelector('.spotify-album-art');
    
    if (statusText) statusText.textContent = data.isPlaying ? '🎵 Now Playing' : '⏸️ Last Played';
    if (trackName) trackName.textContent = data.track.name;
    if (artistName) artistName.textContent = data.track.artist;
    if (albumArt) albumArt.src = data.track.image;
  }
</script>

<style>
  .spotify-status {
    background: var(--spotify-bg, #1a1a1a);
    border-radius: 12px;
    padding: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    max-width: 320px;
  }
  
  .spotify-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .spotify-album-art {
    border-radius: 6px;
    object-fit: cover;
  }
  
  .spotify-info {
    flex: 1;
    min-width: 0;
  }
  
  .spotify-status-text {
    font-size: 12px;
    color: #1DB954;
    margin-bottom: 4px;
  }
  
  .spotify-track {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .spotify-artist {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
```

#### 4.2 環境変数設定

**.env**
```bash
PUBLIC_SPOTIFY_API_URL=https://spotify-tracker.your-subdomain.workers.dev/api/spotify/status
```

#### 4.3 レイアウトに組み込み

**src/layouts/BaseLayout.astro**
```astro
---
import SpotifyStatus from '../components/SpotifyStatus.astro';
// 他のインポート...
---

<html>
  <body>
    <!-- 既存のコンテンツ -->
    
    <!-- Spotify Status -->
    <SpotifyStatus />
  </body>
</html>
```

#### 4.4 別実装オプション: JavaScriptウィジェット

**public/js/spotify-widget.js**
```javascript
class SpotifyWidget {
  constructor() {
    // Cloudflare WorkerのURL
    this.apiUrl = 'https://spotify-tracker.your-subdomain.workers.dev/api/spotify/status';
    this.updateInterval = 60000; // 1分ごと
    this.container = null;
  }

  async init() {
    // ウィジェットコンテナ作成
    this.createContainer();
    
    // 初回取得
    await this.updateTrack();
    
    // 定期更新
    setInterval(() => this.updateTrack(), this.updateInterval);
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'spotify-widget';
    this.container.className = 'spotify-widget';
    document.body.appendChild(this.container);
  }

  async updateTrack() {
    try {
      const response = await fetch(this.apiUrl);
      const data = await response.json();
      
      if (data.track) {
        this.displayTrack(data);
      } else {
        this.hideWidget();
      }
    } catch (error) {
      console.error('Failed to fetch Spotify data:', error);
      this.hideWidget();
    }
  }

  displayTrack(data) {
    const { isPlaying, track } = data;
    
    this.container.innerHTML = `
      <div class="spotify-content">
        <img src="${track.image}" alt="${track.album}" class="spotify-album-art">
        <div class="spotify-info">
          <div class="spotify-status">
            ${isPlaying ? '🎵 Now Playing' : '⏸️ Last Played'}
          </div>
          <div class="spotify-track">${track.name}</div>
          <div class="spotify-artist">${track.artist}</div>
        </div>
      </div>
    `;
    
    this.container.classList.add('visible');
  }

  hideWidget() {
    this.container.classList.remove('visible');
  }
}

// 初期化
document.addEventListener('DOMContentLoaded', () => {
  const widget = new SpotifyWidget();
  widget.init();
});
```

#### 3.2 スタイリング

**css/spotify-widget.css**
```css
.spotify-widget {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: #1a1a1a;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  max-width: 320px;
}

.spotify-widget.visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.spotify-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.spotify-album-art {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
}

.spotify-info {
  flex: 1;
  min-width: 0;
}

.spotify-status {
  font-size: 12px;
  color: #1DB954;
  margin-bottom: 4px;
}

.spotify-track {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.spotify-artist {
  font-size: 12px;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ダークモード対応 */
@media (prefers-color-scheme: light) {
  .spotify-widget {
    background: #fff;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  }
  
  .spotify-track {
    color: #1a1a1a;
  }
  
  .spotify-artist {
    color: #666;
  }
}
```

#### 3.3 HTMLに組み込み

**index.html** (または適切なレイアウトファイル)
```html
<!-- Spotifyウィジェット -->
<link rel="stylesheet" href="/css/spotify-widget.css">
<script src="/js/spotify-widget.js"></script>
```

## 料金・制限事項

### 無料枠での運用

すべてのサービスが無料枠内で運用可能です（モノレポ構成での運用）：

#### Spotify API
- **料金**: 無料
- **制限**: レート制限あり（通常の使用では問題なし）
- **認証**: OAuth2による更新が必要

#### Cloudflare Workers
- **無料枠**: 10万リクエスト/日
- **実際の使用量見積もり**:
  - ページビュー: 1日1,000回と仮定
  - 各ビューで1回API呼び出し
  - **使用率: 約1%**（1,000 ÷ 100,000）

#### Cloudflare KV Storage
- **無料枠**: 
  - 1GB ストレージ
  - 10万回/日の読み取り
  - 1,000回/日の書き込み
- **実際の使用**:
  - アクセストークンの保存（1時間ごと更新）: 24回/日
  - キャッシュの保存: 最大1,000回/日
  - **使用率: 読み取り1%、書き込み2.4%**

#### Cloudflare Pages
- **料金**: 完全無料
- **制限**: 
  - ビルド数: 500回/月
  - 帯域幅: 無制限
  - ビルド時間: 20分以内
  - 並行ビルド: 1個（無料プラン）

### リクエスト数の詳細計算

| アクセスパターン | 1日のリクエスト数 | Workers使用率 |
|----------------|-----------------|--------------|
| 100 PV/日 | 100 | 0.1% |
| 1,000 PV/日 | 1,000 | 1% |
| 10,000 PV/日 | 10,000 | 10% |
| 50,000 PV/日 | 50,000 | 50% |

通常の個人ブログであれば、無料枠の10%も使用しません。

## セキュリティ考慮事項

1. **Spotify認証情報**
   - Client Secret、Refresh TokenはCloudflare Secretsに保存
   - フロントエンドには露出しない
   - トークンの自動更新でセキュリティを維持

2. **CORS設定**
   - Workers側で適切なCORSヘッダーを設定
   - 本番環境では `yanosea.org` のみ許可
   - 開発環境では `localhost` も許可

3. **レート制限**
   - Spotify API: 適切な間隔で呼び出し
   - Workers側でキャッシュ戦略を実装
   - 悪意のあるリクエストからの保護

4. **データ保存**
   - KVにはキャッシュとトークンのみ保存
   - 個人情報や再生履歴は保存しない
   - 一時的なデータは自動期限切れ

## トラブルシューティング

### Refresh Tokenの取得
Spotify Web APIのRefresh Token取得には初回認証フローが必要。
別途、ローカルでOAuth認証フローを実装して取得する。

### CORSエラー
- WorkersのレスポンスヘッダーにCORS設定が正しく含まれているか確認
- 開発環境では `Access-Control-Allow-Origin: '*'` に設定
- 本番環境では特定のドメインのみ許可

### データが更新されない
1. Cloudflare Workersのリアルタイムログを確認
2. アクセストークンが正しく更新されているか確認
3. Spotify APIのレスポンスを確認
4. KVのキャッシュが正しく機能しているか確認

### トークンエラー
- Refresh Tokenの有効期限切れ
- Client ID/Secretの設定ミス
- Cloudflare Secretsへの保存ミス

## 独自ドメイン設定 (Cloudflare Registrar)

### ドメイン移管手順

#### 1. XserverからAuth Code取得
1. Xserverコントロールパネルにログイン
2. ドメイン管理画面でAuth Code（認証鍵）を取得
3. ドメインロックを解除

#### 2. Cloudflare Registrarに移管
1. [Cloudflare Dashboard](https://dash.cloudflare.com)にログイン
2. **Domain Registration** → **Transfer Domain**
3. ドメイン名入力（例: yanosea.org）
4. Auth Codeを入力
5. 移管手続き完了（1年延長料金: 約$12-15）

#### 3. DNS設定（Cloudflare Pages用）

移管後、DNS設定が大幅に簡素化されます：

```
# Cloudflare Pages + 独自ドメイン
Type  Name  Content                    Proxy Status  
CNAME @     yanoportfolio.pages.dev   Proxied ✅
CNAME www   yanoportfolio.pages.dev   Proxied ✅
```

**優位性**: 
- **Proxy Status: Proxied** 使用可能（Cloudflareのセキュリティ・最適化機能活用）
- DNS設定が簡単（CNAMEレコード2つのみ）
- 自動SSL証明書（Let's Encrypt）
- DDoS保護・Web Application Firewall自動適用

#### 4. Cloudflare Pages設定

Cloudflare Pages Dashboard内で設定完了：
1. **Pages** → **yanoportfolio** → **Custom domains**
2. `yanosea.org` を追加
3. DNS設定は自動で適用
4. SSL証明書も自動発行・更新

### 料金比較

| 項目 | Xserver | Cloudflare Registrar |
|------|---------|---------------------|
| .org年間料金 | 約¥3,500 | 約$12-15 (¥1,800-2,300) |
| WHOIS保護 | 有料 | 無料 |
| DNSSEC | なし | 無料 |
| DNS管理 | 基本 | 高機能 |

年間約¥1,000-1,500の節約となり、機能も向上します。

### 移管完了後の構成

```
yanosea.org (Cloudflare Registrar)
├── DNS (Cloudflare) - Proxied
├── Cloudflare Pages (yanoPortfolio front/)
├── Cloudflare Workers (yanoPortfolio back/)
├── SSL証明書 (Cloudflare自動発行・更新)
├── WAF・DDoS保護 (自動適用)
└── エッジキャッシュ最適化 (自動)
```

完全にCloudflareエコシステム内で統合され、最高レベルの管理簡素化と性能最適化を実現します。

## Cloudflare Pages 追加メリット

### 🚀 GitHub Pages比較での優位性

| 項目 | GitHub Pages | Cloudflare Pages |
|------|-------------|-----------------|
| **帯域制限** | 100GB/月 | 無制限 |
| **ビルド時間** | 10分 | 20分 |
| **ビルド数** | 無制限？ | 500回/月 |
| **カスタムドメインSSL** | Let's Encrypt | Cloudflare SSL |
| **CDN** | GitHub CDN | 世界最速 Cloudflare CDN |
| **セキュリティ** | 基本 | WAF・DDoS・ボット対策 |
| **Analytics** | なし | 標準対応 |
| **統合性** | 単体サービス | Workers・KV・Analytics統合 |

### 🔧 開発・運用効率

**統合管理**:
- Pages・Workers・DNS・Domain・Analytics すべて同一ダッシュボード
- 統一されたログ・監視・アラート
- 同一請求・料金管理

**パフォーマンス**:
- エッジキャッシュ自動最適化
- 画像・CSS・JS自動圧縮
- HTTP/3・IPv6完全対応
- 200+エッジロケーション

**セキュリティ**:
- Web Application Firewall標準
- DDoS攻撃自動緩和
- ボット管理・レート制限
- 脅威インテリジェンス連携