# My Game Stats - 阪神タイガース観戦記録アプリ

現地観戦した試合の選手成績を自動で集計し、自分だけの相性データ（観戦時打率など）が見られるアプリです。

## 技術スタック

- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS** + **shadcn/ui**
- **Supabase** (PostgreSQL)

## 特徴

- スマホ最適化されたボトムナビゲーション
- クリーンで洗練されたUIデザイン
- 観戦成績の自動集計
- 選手ごとの観戦時打率の可視化

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルは既に作成されています。

### 3. データベースのセットアップ

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. プロジェクトを開き、左サイドバーから「SQL Editor」を選択
3. `schema.sql` の内容を貼り付けて実行
4. 次に `seed.sql` の内容を貼り付けて実行

### 4. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## プロジェクト構成

```
MyGameStats/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # ダッシュボード（ホーム）
│   ├── games/             # 試合一覧ページ
│   ├── stats/             # 選手成績ページ
│   └── profile/           # マイページ
├── components/            # Reactコンポーネント
│   ├── ui/               # shadcn/ui コンポーネント
│   └── bottom-nav.tsx    # ボトムナビゲーション
├── lib/                  # ユーティリティ
│   ├── supabase.ts      # Supabaseクライアント
│   ├── types.ts         # 型定義
│   └── utils.ts         # ヘルパー関数
├── schema.sql           # データベーススキーマ
└── seed.sql             # サンプルデータ
```

## データベーススキーマ

- `teams` - チーム情報
- `players` - 選手情報
- `games` - 試合情報
- `game_stats` - 試合ごとの選手成績
- `user_attendance` - ユーザーの観戦記録

## MVP (Ver 1.0) の範囲

- 阪神タイガース専用
- 観戦成績の表示（勝率、試合数など）
- 最近の試合一覧
- 選手ごとの観戦時成績

## 今後の展開

- NPB12球団対応
- 選手検索機能
- 詳細な統計分析
- グラフ表示
- ソーシャル機能
