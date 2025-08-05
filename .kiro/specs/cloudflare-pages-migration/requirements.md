# Requirements Document

## Project Overview
yanosea個人ポートフォリオサイト（yanosea.org）を現在のDocker + VPS環境からCloudflareエコシステム（Pages + Workers + KV Storage）へ完全移行するプロジェクト。モノレポ構成を維持しつつ、パフォーマンス向上・コスト削減・管理簡素化を実現する。

## Project Description (User Input)
`./spotify-blog-migration.md`に沿って移行したい。

## 機能要件

### FR-001: フロントエンド移行（Cloudflare Pages）
**優先度**: 高
**ユーザーストーリー**: 開発者として、既存のAstro SSGサイトをCloudflare Pagesで高速配信したい

**受け入れ条件**:
- [x] Astro 5.0.9 SSGサイトがCloudflare Pagesで正常動作する
- [x] MDXブログ記事（Content Collections）が完全に機能する
- [x] 既存の全機能が維持される：
  - ダークモード・ライトモード切り替え
  - 日本語フォント（DotGothic16、Zen Kaku Gothic New）
  - レスポンシブデザイン
  - SEO最適化（sitemap、RSS、OpenGraph）
- [x] 静的アセット最適化（WebP画像、CSS/JS圧縮）が動作する
- [x] ビルド時間が20分以内で完了する
- [x] 独自ドメイン（yanosea.org）でアクセス可能

**技術制約**:
- Node.js 21.6.2使用
- ビルドコマンド: `cd front && pnpm run build`
- 出力ディレクトリ: `front/dist`

### FR-002: バックエンドAPI移行（Cloudflare Workers）
**優先度**: 高
**ユーザーストーリー**: 開発者として、既存のGo APIサーバーをCloudflare Workersに移行してエッジコンピューティングを活用したい

**受け入れ条件**:
- [x] Spotify Web API連携機能が完全に動作する
  - 現在再生中楽曲取得（`/api/spotify/status`）
  - 最後に再生した楽曲取得（フォールバック）
  - OAuth2リフレッシュトークン自動更新
- [x] レスポンス時間が現在より向上する（エッジ配信効果）
- [x] CORS設定が適切に動作する
  - 本番: `yanosea.org`のみ許可
  - 開発: `localhost`許可
- [x] エラーハンドリングが堅牢である
- [x] キャッシュ戦略が最適化されている（1分間隔）

**技術制約**:
- JavaScript/TypeScript実装
- Wrangler CLI使用
- モノレポ構成維持（`back/`ディレクトリ活用）

### FR-003: データ永続化（Cloudflare KV）
**優先度**: 中
**ユーザーストーリー**: システムとして、Spotify認証トークンとAPIレスポンスを効率的にキャッシュしたい

**受け入れ条件**:
- [x] アクセストークンの自動更新・保存機能
- [x] APIレスポンス1分間キャッシュ機能
- [x] キャッシュヒット率90%以上達成
- [x] 無料枠内での運用（読み取り10万/日、書き込み1,000/日）
- [x] データセキュリティ確保（個人情報非保存）

**技術制約**:
- KV Storage使用
- 一時キャッシュのみ、永続データなし
- 自動期限切れ設定

### FR-004: CI/CD統合（GitHub Actions）
**優先度**: 中
**ユーザーストーリー**: 開発者として、コード更新時に自動でCloudflareサービスにデプロイしたい

**受け入れ条件**:
- [x] フロントエンド変更時にPages自動デプロイ
- [x] バックエンド変更時にWorkers自動デプロイ
- [x] モノレポ対応（パス別トリガー）
- [x] 手動デプロイオプション（`workflow_dispatch`）
- [x] デプロイ失敗時の適切な通知

**技術制約**:
- GitHub Actions使用
- Cloudflare API Token要求
- pnpm使用

### FR-005: 開発環境統合
**優先度**: 中
**ユーザーストーリー**: 開発者として、既存のMakefile開発フローを維持してローカル開発したい

**受け入れ条件**:
- [x] `make dev.start`でローカル統合開発環境起動
- [x] フロントエンド（Astro）+ バックエンド（Wrangler）同時起動
- [x] ホットリロード機能維持
- [x] 環境変数管理（`.env.dev`）継続
- [x] 既存開発フロー最小限の変更

## 非機能要件

### NFR-001: パフォーマンス
**ユーザーストーリー**: サイト訪問者として、現在より高速なページ読み込みを体験したい

**受け入れ条件**:
- [x] 初期ページ読み込み時間: 2秒以内（現在より20%改善）
- [x] Spotify API応答時間: 500ms以内
- [x] エッジキャッシュヒット率: 95%以上
- [x] Core Web Vitals改善:
  - LCP（Largest Contentful Paint）: 2.5秒以内
  - FID（First Input Delay）: 100ms以内
  - CLS（Cumulative Layout Shift）: 0.1以内

### NFR-002: 可用性
**受け入れ条件**:
- [x] サービス稼働率: 99.9%以上
- [x] Spotify API障害時のグレースフル劣化
- [x] 複数エッジロケーション対応（200+拠点）
- [x] DDoS攻撃自動緩和

### NFR-003: セキュリティ
**受け入れ条件**:
- [x] Spotify認証情報の安全な管理
  - Client Secret、Refresh TokenをCloudflare Secrets保存
  - フロントエンド露出防止
- [x] HTTPS強制（自動SSL証明書）
- [x] WAF（Web Application Firewall）適用
- [x] 適切なCORS設定

### NFR-004: コスト効率
**受け入れ条件**:
- [x] 月額コスト削減: 現在より50%以上削減
- [x] すべて無料プラン内での運用
- [x] 使用量監視・アラート設定
- [x] 予期しない課金防止策

### NFR-005: 運用性
**受け入れ条件**:
- [x] 統一管理ダッシュボード（Cloudflare）
- [x] 包括的ログ・監視機能
- [x] 簡素化されたデバッグ・トラブルシューティング
- [x] ドキュメント整備

## 制約事項

### 技術制約
- Cloudflare無料プラン制限内での実装
- Workers: 10万リクエスト/日
- KV Storage: 読み取り10万/日、書き込み1,000/日  
- Pages: ビルド500回/月、20分以内
- モノレポ構成維持必須

### ビジネス制約
- 移行期間中のサービス停止時間: 最大1時間
- 既存URL構造維持（SEO影響回避）
- 既存機能の完全互換性確保

### セキュリティ制約
- 個人情報非保存（GDPR準拠）
- Spotify APIレート制限遵守
- 認証情報の暗号化保存

## 受け入れテスト計画

### フロントエンド検証
- [x] 全ページ正常表示確認
- [x] レスポンシブデザイン動作確認
- [x] ダークモード切り替え確認
- [x] ブログ記事表示・ナビゲーション確認
- [x] RSS・Sitemap生成確認

### バックエンド検証
- [x] Spotify API連携動作確認
- [x] エラーハンドリング確認
- [x] パフォーマンス測定
- [x] セキュリティ検査

### 統合テスト
- [x] フロントエンド-バックエンド連携確認
- [x] CI/CD パイプライン動作確認
- [x] 本番環境デプロイ確認
- [x] 負荷テスト

## 優先順位とマイルストーン

### Phase 1: バックエンド移行（Week 1-2）
1. Cloudflare Workers実装
2. KV Storage設定
3. Spotify API連携移行
4. 単体テスト

### Phase 2: フロントエンド移行（Week 2-3）
1. Cloudflare Pages設定
2. ビルド設定最適化
3. カスタムドメイン設定
4. 統合テスト

### Phase 3: CI/CD・運用（Week 3-4）
1. GitHub Actions設定
2. 監視・ログ設定
3. 本番切り替え
4. 旧環境停止

### Phase 4: 最適化（Week 4-5）
1. パフォーマンス調整
2. ドキュメント整備
3. 運用手順確立

---
**STATUS**: Requirements completed and ready for review
**NEXT STEP**: Run `/kiro:spec-design cloudflare-pages-migration` after reviewing these requirements