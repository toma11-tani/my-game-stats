# My Game Stats - プロジェクトドキュメント

## 📋 プロジェクト概要

**My Game Stats** は、阪神タイガースファンのための野球観戦記録アプリケーションです。ユーザーが実際に球場で観戦した試合を記録し、選手成績や観戦統計を確認できるモバイル専用Webアプリです。

### 主な特徴
- 📱 スマートフォン専用の最適化されたUI/UX
- 🎨 Apple風の洗練されたデザイン（shadcn/ui使用）
- 🎯 阪神タイガースカラー（#F6D32D）を効果的に使用
- ⚡ 高速なレスポンスとOptimistic UI
- 🗄️ 完全なデータベース駆動設計

## 🛠 技術スタック

### フロントエンド
- **Next.js 15+** - App Router使用
- **TypeScript** - 型安全性の確保
- **Tailwind CSS** - ユーティリティファーストのスタイリング
- **shadcn/ui** - 高品質なUIコンポーネント
- **React Hooks** - `useOptimistic`, `useTransition`を活用

### バックエンド
- **Supabase** - PostgreSQLデータベース＋リアルタイムAPI
- **Next.js Server Actions** - サーバーサイドのデータ変更処理

### フォント
- **Inter** - 欧文フォント
- **Noto Sans JP** - 日本語フォント

## 📂 プロジェクト構造

```
MyGameStats/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト（フォント設定、ナビゲーション）
│   ├── page.tsx                 # ホーム画面（ダッシュボード）
│   ├── games/                   # 試合関連ページ
│   │   ├── page.tsx            # 試合一覧
│   │   └── [id]/               # 動的ルート
│   │       └── page.tsx        # 試合詳細（スコアボード、成績、メモ）
│   ├── stats/                   # 統計ページ
│   │   └── page.tsx            # 選手成績（観戦時のみ）
│   ├── profile/                 # プロフィールページ
│   │   └── page.tsx            # 観戦履歴、球場別統計
│   └── actions.ts               # Server Actions（チェックイン、メモ更新）
│
├── components/                   # 再利用可能なコンポーネント
│   ├── ui/                      # shadcn/uiコンポーネント
│   ├── bottom-nav.tsx           # ボトムナビゲーション
│   ├── game-card.tsx            # 試合カード（Optimistic UI）
│   ├── memo-editor.tsx          # メモ編集機能
│   └── player-stat-card.tsx     # 選手成績カード
│
├── lib/                         # ユーティリティ・API
│   ├── api.ts                   # Supabaseデータ取得関数
│   ├── supabase.ts              # Supabaseクライアント初期化
│   ├── types.ts                 # TypeScript型定義
│   └── utils.ts                 # ユーティリティ関数
│
├── public/                      # 静的ファイル
├── .env.local                   # 環境変数（Supabase認証情報）
├── schema.sql                   # データベーススキーマ
└── seed.sql                     # サンプルデータ
```

## 🗄️ データベース構造

### テーブル一覧

#### 1. `teams` - チーム情報
```sql
- id: UUID (主キー)
- name: TEXT (チーム名: "阪神", "巨人" など)
- abbreviation: TEXT (1文字略称: "神", "巨" など)
- color_primary: TEXT (HEXカラーコード)
- color_secondary: TEXT (サブカラー、nullable)
- created_at: TIMESTAMP
```

#### 2. `players` - 選手情報
```sql
- id: UUID (主キー)
- team_id: UUID (外部キー → teams)
- name: TEXT (選手名)
- position: TEXT (ポジション)
- number: INTEGER (背番号)
- created_at: TIMESTAMP
```

#### 3. `games` - 試合情報
```sql
- id: UUID (主キー)
- date: DATE (試合日)
- opponent_team_id: UUID (外部キー → teams)
- stadium: TEXT (球場名)
- home_score: INTEGER (阪神の得点)
- away_score: INTEGER (相手チームの得点)
- result_type: TEXT ('win', 'loss', 'draw')
- created_at: TIMESTAMP
```

#### 4. `game_player_stats` - 打者成績
```sql
- id: UUID (主キー)
- game_id: UUID (外部キー → games)
- player_id: UUID (外部キー → players)
- at_bats: INTEGER (打数)
- hits: INTEGER (安打)
- homeruns: INTEGER (本塁打)
- rbi: INTEGER (打点)
- runs: INTEGER (得点)
- stolen_bases: INTEGER (盗塁)
- created_at: TIMESTAMP
```

#### 5. `game_pitcher_stats` - 投手成績
```sql
- id: UUID (主キー)
- game_id: UUID (外部キー → games)
- player_id: UUID (外部キー → players)
- result: TEXT (勝敗: '勝', '負', 'S' など)
- innings: DECIMAL (投球回)
- balls: INTEGER (投球数)
- hits: INTEGER (被安打)
- strikeouts: INTEGER (奪三振)
- walks: INTEGER (与四球)
- runs: INTEGER (失点)
- created_at: TIMESTAMP
```

#### 6. `user_attendance` - ユーザー観戦記録
```sql
- id: UUID (主キー)
- user_id: UUID (ユーザーID、現在は固定値)
- game_id: UUID (外部キー → games)
- memo: TEXT (観戦メモ)
- created_at: TIMESTAMP
```

### データベース設計の特徴

1. **完全正規化**: データの重複を排除
2. **チーム情報のDB管理**: 略称・カラーもすべてDBから取得
3. **外部キー制約**: データ整合性の保証
4. **UUID使用**: グローバルに一意な識別子

## 🎯 主要機能

### 1. ホーム画面（ダッシュボード）
- 観戦成績サマリー（勝率、試合数、勝敗内訳）
- 最近の試合一覧（最新3試合）
- タイガースイエローを使ったアクセント

### 2. 試合一覧ページ
- 月別グループ表示
- チェックイン/チェックアウト機能（Optimistic UI）
- 試合結果による色分け（勝利=黄色、敗北=グレー）
- 試合詳細へのリンク

### 3. 試合詳細ページ
- **スコアボード**: イニングごとの得点表（1文字略称使用）
- **打者成績タブ**: 打数、安打、打点、本塁打、盗塁
- **投手成績タブ**: 勝敗、投球回、球数、被安打、奪三振、与四球、失点
- **メモ機能**: 試合の感想を記録・編集

### 4. Stats（統計）ページ
- 観戦した試合での選手成績集計
- 打率順ソート
- ランキング表示（1位=金トロフィー、2位=銀、3位=銅）

### 5. プロフィールページ
- 観戦成績サマリー
- 球場別統計
- 観戦履歴（メモ付き）

## 🎨 デザインシステム

### カラーパレット
- **背景**: `bg-slate-50` (純白を避けた柔らかい背景)
- **テキスト**: `text-slate-900` (#1e293b, 純黒を避けた読みやすいテキスト)
- **アクセント**: `#F6D32D` (タイガースイエロー、重要なアクション専用)
- **ダークモード**: スコアボード・ヘッダーで `bg-slate-900` 使用

### デザイン原則
1. **Apple風の洗練さ**: 適切な余白、シャドウ、角丸
2. **安っぽくない**: shadcn/uiの高品質コンポーネント使用
3. **色の節度**: タイガースイエローは必要最小限
4. **モバイルファースト**: `max-w-lg` で幅を制限

## 🔄 主要なAPI関数

### データ取得（`lib/api.ts`）

```typescript
// 試合一覧（観戦済みフラグ付き）
getAllGamesWithAttendance()

// 試合詳細
getGameDetail(gameId: string)
getGameBatterStats(gameId: string)
getGamePitcherStats(gameId: string)

// ホームチーム情報
getHomeTeam()

// 統計
getAttendanceStats()
getPlayerStatsForAttendedGames()
getStadiumStats()

// メモ
getUserMemo(gameId: string)
```

### データ変更（`app/actions.ts`）

```typescript
// チェックイン/チェックアウト
checkInGame(gameId: string)
checkOutGame(gameId: string)

// メモ更新
updateMemo(gameId: string, memo: string)
```

## 🚀 セットアップ手順

### 1. リポジトリのクローン
```bash
git clone https://github.com/toma11-tani/my-game-stats.git
cd MyGameStats
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)でプロジェクト作成
2. SQL Editorで `schema.sql` を実行
3. SQL Editorで `seed.sql` を実行（サンプルデータ）

### 4. 環境変数の設定
`.env.local` ファイルを作成:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

`http://localhost:3000` でアプリケーションにアクセス

## 📝 設計思想

### 1. データベース駆動設計
チーム名、略称、カラーなど、すべてのチーム情報をデータベースで管理。フロントエンドにハードコードされた値は一切なし。これにより、DBの更新だけでアプリ全体に反映される柔軟性を実現。

### 2. Optimistic UI
チェックイン/チェックアウト機能で `useOptimistic` を使用。サーバーの応答を待たずに即座にUIを更新し、スムーズなユーザー体験を提供。

### 3. Server Components優先
可能な限りServer Componentsを使用してデータ取得を行い、クライアントサイドのJavaScriptを最小化。

### 4. 型安全性
TypeScriptで厳密な型定義を行い、開発時のエラーを防止。

### 5. モバイルファースト
スマートフォンでの使用を前提とした設計。`max-w-lg`で幅を制限し、タッチ操作に最適化。

## 🔐 セキュリティ

### 現在の実装
- ユーザーIDは仮の固定値（`00000000-0000-0000-0000-000000000000`）
- Supabase RLS（Row Level Security）は未実装

### 今後の改善予定
- Supabase Authによる認証機能の実装
- RLSポリシーの設定（ユーザーごとのデータアクセス制御）

## 🐛 既知の制限事項

1. **イニングスコア未実装**: スコアボードは合計得点のみ表示
2. **認証機能なし**: 全ユーザーが同じデータを共有
3. **画像アップロード未対応**: メモはテキストのみ

## 📈 今後の拡張予定

- [ ] ユーザー認証機能（Supabase Auth）
- [ ] イニングごとの得点入力機能
- [ ] 写真アップロード機能
- [ ] 座席位置記録機能
- [ ] 一緒に観戦した人の記録
- [ ] SNSシェア機能
- [ ] データエクスポート機能（CSV, JSON）
- [ ] PWA対応（オフライン機能）

## 🤝 開発履歴

このプロジェクトは Claude Code（Claude Sonnet 4.5）との共同開発により作成されました。

### 主要なマイルストーン

1. **初期セットアップ** - Next.js + Supabase + shadcn/ui
2. **ダッシュボード実装** - 観戦成績サマリー、最近の試合
3. **試合一覧ページ** - チェックイン機能、Optimistic UI
4. **プロフィールページ** - 観戦履歴、球場別統計
5. **Stats機能** - 選手成績集計、ランキング表示
6. **試合詳細ページ** - スコアボード、打者/投手成績、メモ機能
7. **DB駆動化** - チーム情報の完全DB管理、ハードコード削除
8. **モバイル最適化** - 試合詳細画面のスマホ専用レイアウト

## 📄 ライセンス

このプロジェクトは個人利用を目的としています。

---

**開発者**: toma11-tani
**リポジトリ**: https://github.com/toma11-tani/my-game-stats
**最終更新**: 2026年1月10日
