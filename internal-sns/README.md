# 社内SNS「Connect」

X（旧Twitter）風のUIを持つ社内向けSNS。Next.js + TypeScript + SQLite で実装。

## 起動方法

```bash
npm install
npx prisma db push
npm run dev
```

`http://localhost:3000` でアクセス可能。

## 必須機能

- ✅ アカウント作成・ログイン/ログアウト
- ✅ フォロー/フォロー解除/ブロック機能
- ✅ プロフィール編集
- ✅ 鍵アカウント（非公開）機能
- ✅ ツイート投稿・リプライ機能
- ✅ いいね・ユーザー検索

## 技術スタック

| 分類 | 技術 |
| --- | --- |
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript |
| UI | React 19 / Tailwind CSS v4 |
| DB | SQLite（Prisma ORM） |
| 認証 | Auth.js（NextAuth v5） |

## セキュリティ対応

- パスワードはbcryptjsでハッシュ化
- 認証・認可ロジックを一元管理（脆弱性対応済み）
- Zod による入力バリデーション

詳細は [docs/機能仕様書.md](docs/機能仕様書.md) を参照。

## テストアカウント

デフォルトDBに以下のテストアカウントが存在します：

| ユーザー名 | パスワード | 状態 |
| --- | --- | --- |
| test_taro | password123 | 非公開アカウント |
| hanako | password123 | 公開アカウント |

不要な場合は `prisma/dev.db` を削除し、`npx prisma db push` を再実行してリセット。

## 長期運用対応

### SQLiteの制限事項

本アプリケーションは **SQLiteを単一接続（`connection_limit=1`）で運用** しています。以下の点にご注意ください：

- **複数ユーザーの同時接続は推奨されません**（最大1接続に制限）
- SQLiteは本来シングルプロセスアクセス用のDBで、複数のプロセスからの並行アクセスは動作が不安定になる可能性があります
- ビジーウェイト設定（`busy_timeout=5000`）により、5秒程度の遅延が生じることがあります

### 本番環境への移行

複数ユーザーの同時接続が想定される場合（社員数が増加等）、以下のDBへの移行を推奨します：

#### 1. PostgreSQL への移行（推奨）

`.env` を変更：
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/internal_sns"
```

`prisma/schema.prisma` を変更：
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

移行コマンド：
```bash
npm install @prisma/client pg
npx prisma db push
```

#### 2. MySQL への移行

`.env` を変更：
```bash
DATABASE_URL="mysql://user:password@localhost:3306/internal_sns"
```

`prisma/schema.prisma` を変更：
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

#### 3. その他対応

- **バックアップ戦略**: 本番環境では定期的なDB自動バックアップを設定
- **監視**: APM（Application Performance Monitoring）ツールの導入検討
- **キャッシング**: RedisなどのインメモリキャッシュでDB負荷を軽減

## 開発時の参考

詳細な機能仕様・API一覧・認可ロジックについては [docs/機能仕様書.md](docs/機能仕様書.md) を参照してください。
