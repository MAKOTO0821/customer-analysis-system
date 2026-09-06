# 🎯 顧客分析システム - MCP + Web ダッシュボード

![Test Badge](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)
![Deploy Badge](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO)

完全に統合された営業分析システム。MCPサーバー、リアルタイムダッシュボード、自動テストを搭載。

---

## ✨ **主な機能**

### 📊 MCPサーバー（17ツール）
- ✅ 顧客データ分析
- ✅ 売上データ分析
- ✅ スタッフ別パフォーマンス分析
- ✅ SQLiteデータベース連携
- ✅ Slack通知送信
- ✅ Email自動送信

### 🌐 Web ダッシュボード
- ✅ リアルタイムデータ更新（WebSocket）
- ✅ リアルタイムアラート機能
- ✅ 目標達成度の可視化
- ✅ スタッフ・顧客別パフォーマンス表示
- ✅ JSON/PDF エクスポート機能

### 🧪 テスト駆動開発（TDD）
- ✅ 23個のユニットテスト
- ✅ 100% ステートメントカバレッジ
- ✅ Jest テストフレームワーク
- ✅ 自動カバレッジレポート

### 🚀 CI/CD パイプライン
- ✅ GitHub Actions 自動テスト実行
- ✅ 複数Node.jsバージョン対応
- ✅ 自動ビルド検証
- ✅ 自動デプロイ（GitHub Releases）

---

## 🚀 **クイックスタート**

### 前提条件
- Node.js 16.x 以上
- npm 8.x 以上
- SQLite3

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO

# 依存パッケージをインストール
cd mcp-customer-server
npm install
```

### データベース初期化

```bash
# SQLiteデータベースを初期化
node init-db.js

# 結果:
# ✅ 顧客データをインポート: 4 件
# ✅ 売上データをインポート: 7 件
```

### サーバー起動

```bash
# MCPサーバーを起動
node server.js

# または、ダッシュボードを起動
node dashboard-server-enhanced.js
# ブラウザで http://localhost:3001 を開く
```

### テスト実行

```bash
# すべてのテストを実行
npm test

# ウォッチモード（ファイル変更時に自動実行）
npm run test:watch

# カバレッジレポート付き
npm run test:coverage
```

---

## 📁 **プロジェクト構成**

```
顧客ファイル/
├── .github/
│   └── workflows/
│       ├── test.yml              ← テストワークフロー
│       └── deploy.yml            ← デプロイワークフロー
├── data/
│   ├── customers.json
│   ├── sales-records.csv
│   └── sales.db
├── mcp-customer-server/
│   ├── server.js                 ← MCPサーバー（17ツール）
│   ├── dashboard-server.js       ← ダッシュボード v1
│   ├── dashboard-server-enhanced.js ← ダッシュボード v2
│   ├── utils.js                  ← ユーティリティ関数
│   ├── utils.test.js             ← ユニットテスト（17テスト）
│   ├── alerts.test.js            ← アラートテスト（6テスト）
│   ├── public/
│   │   ├── index.html
│   │   └── index-enhanced.html
│   ├── package.json
│   └── TEST-SUMMARY.md
├── README.md                      ← このファイル
└── .mcp.json
```

---

## 🧪 **テスト実行結果**

```
✅ Test Suites: 2 passed, 2 total
✅ Tests:       23 passed, 23 total
✅ Time:        2.006 seconds
✅ Coverage:    100% Statements | 93.75% Branch | 100% Functions | 100% Lines
```

### テストカバレッジ

| ファイル   | Statements | Branch | Functions | Lines |
|-----------|-----------|--------|-----------|-------|
| utils.js  | 100%      | 93.75% | 100%      | 100%  |
| **合計**  | **100%**  | **93.75%** | **100%** | **100%** |

---

## 🚀 **CI/CD パイプライン**

### 自動テスト（`test.yml`）
```yaml
トリガー: Push / Pull Request
実行内容:
  ✅ ユニットテスト実行（Node.js 16.x, 18.x, 20.x）
  ✅ コード品質チェック
  ✅ ビルド検証
  ✅ カバレッジレポート生成
```

### 自動デプロイ（`deploy.yml`）
```yaml
トリガー: main ブランチへのプッシュ
実行内容:
  ✅ テスト実行
  ✅ バージョン自動採番
  ✅ リリースノート生成
  ✅ GitHub Releases へ自動公開
```

---

## 📊 **機能詳細**

### MCPサーバーツール（17個）

#### 分析ツール
- `analyze_customers` - 顧客データ統計
- `analyze_sales` - 売上データ統計
- `analyze_sales_by_staff` - スタッフ別分析
- `analyze_sales_by_month` - 月別分析

#### データベース連携
- `query_customers_from_db` - 全顧客取得
- `query_sales_from_db` - 全売上取得
- `get_db_statistics` - 統計情報取得

#### 通知機能
- `send_sales_report_to_slack` - Slack通知
- `send_email_report` - Email送信

+ その他 8ツール

### ダッシュボード機能

#### 基本機能（v1）
- リアルタイムデータ更新（5秒ごと）
- KPIカード表示
- スタッフ別パフォーマンス
- 顧客別売上

#### 強化機能（v2）
- リアルタイムアラート
- 目標達成度プログレスバー
- JSONレポート出力
- PDFエクスポート

---

## 🔧 **設定**

### 環境変数（`.env`）

```env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_RECIPIENT=recipient@gmail.com
```

### package.json スクリプト

```json
{
  "scripts": {
    "start": "node server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📈 **学習内容**

このプロジェクトを通じて学べる内容：

- ✅ MCPプロトコル実装
- ✅ Node.js 非同期処理
- ✅ SQLiteデータベース設計
- ✅ Express.js サーバー構築
- ✅ WebSocket リアルタイム通信
- ✅ 外部API統合（Slack, Gmail）
- ✅ Jest テストフレームワーク
- ✅ テスト駆動開発（TDD）
- ✅ GitHub Actions CI/CD
- ✅ Git バージョン管理

---

## 🤝 **貢献方法**

```bash
# 1. フォークする
# 2. フィーチャーブランチを作成
git checkout -b feature/amazing-feature

# 3. 変更をコミット
git commit -m 'Add some amazing feature'

# 4. ブランチにプッシュ
git push origin feature/amazing-feature

# 5. Pull Request を作成
```

---

## 📝 **ライセンス**

MIT License - 詳細は [LICENSE](LICENSE) を参照

---

## 📞 **サポート**

問題が発生した場合：

1. [Issues](https://github.com/YOUR_USERNAME/YOUR_REPO/issues) を確認
2. [ドキュメント](./mcp-customer-server/TEST-SUMMARY.md) を参照
3. 新しい Issue を作成

---

## 🎯 **ロードマップ**

- [ ] E2E テスト（Puppeteer/Playwright）
- [ ] パフォーマンステスト
- [ ] Docker コンテナ化
- [ ] Kubernetes デプロイ
- [ ] クラウド環境対応（AWS/GCP）
- [ ] 機械学習モデル統合
- [ ] 高度なレポート機能

---

**Made with ❤️ using Node.js, SQLite, and Express**

![GitHub last commit](https://img.shields.io/github/last-commit/YOUR_USERNAME/YOUR_REPO)
![GitHub repo size](https://img.shields.io/github/repo-size/YOUR_USERNAME/YOUR_REPO)
![GitHub license](https://img.shields.io/github/license/YOUR_USERNAME/YOUR_REPO)
