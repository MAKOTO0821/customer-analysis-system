# 🚀 CI/CD パイプライン設定ガイド

GitHub Actions を使った完全な CI/CD パイプラインの設定と運用ガイド。

---

## 📋 **ワークフロー概要**

### 1️⃣ テストワークフロー（`test.yml`）

```
トリガー：
  - main / master / develop ブランチへのプッシュ
  - Pull Request 作成時

実行内容：
  ✅ ユニットテスト（複数 Node.js バージョン）
  ✅ コード品質チェック
  ✅ ビルド検証
  ✅ カバレッジレポート生成
```

### 2️⃣ デプロイワークフロー（`deploy.yml`）

```
トリガー：
  - main ブランチへのプッシュ
  - Git タグ作成時（v*.*.* 形式）

実行内容：
  ✅ テスト実行確認
  ✅ バージョン情報取得
  ✅ リリースノート生成
  ✅ GitHub Releases へ公開
```

---

## 🛠️ **セットアップ手順**

### Step 1: GitHub リポジトリの作成

```bash
# ローカルリポジトリを初期化（既に Git が初期化されている場合はスキップ）
git init

# リモートリポジトリを追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# ブランチをリネーム（必要に応じて）
git branch -M main
```

### Step 2: ファイルをコミット

```bash
# ワークフローファイルをステージング
git add .github/workflows/

# README とドキュメントを追加
git add README.md

# テストファイルをコミット
git add mcp-customer-server/utils.test.js
git add mcp-customer-server/alerts.test.js

# 初回コミット
git commit -m "feat: CI/CD パイプラインを追加

- GitHub Actions 自動テスト実行
- 複数 Node.js バージョン対応
- 自動ビルド検証
- カバレッジレポート生成"
```

### Step 3: GitHub にプッシュ

```bash
# メインブランチにプッシュ
git push -u origin main

# または master ブランチの場合
git push -u origin master
```

### Step 4: GitHub で Actions を確認

1. GitHub リポジトリにアクセス
2. **Actions** タブをクリック
3. ワークフローが実行される様子を確認

---

## 📊 **ワークフロー詳細設定**

### test.yml の設定項目

```yaml
# ワークフロー名
name: 🧪 テスト駆動開発（TDD）- 自動テスト実行

# トリガー条件
on:
  push:
    branches: [ main, master, develop ]  # 対象ブランチ
    paths:                               # 対象パス
      - 'mcp-customer-server/**'
      - '.github/workflows/test.yml'
  pull_request:
    branches: [ main, master, develop ]
    paths:
      - 'mcp-customer-server/**'

# ジョブ定義
jobs:
  test:
    runs-on: ubuntu-latest              # 実行環境
    
    strategy:
      matrix:
        node-version: [16.x, 18.x, 20.x] # Node.js バージョンマトリックス
```

### 利用可能な実行環境

```
- ubuntu-latest      （推奨）
- ubuntu-20.04
- ubuntu-18.04
- windows-latest
- macos-latest
```

---

## 📈 **ワークフローの実行順序**

```
┌─────────────────────────────────────────┐
│ コミット / Pull Request                  │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 🧪 テスト実行（test ジョブ）             │
│ - Node.js 16.x でテスト                 │
│ - Node.js 18.x でテスト                 │
│ - Node.js 20.x でテスト                 │
│ - カバレッジレポート生成                 │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 📝 コード品質チェック（lint ジョブ）      │
│ - ファイル構造確認                       │
│ - package.json 検証                     │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 🔨 ビルド・検証（build ジョブ）          │
│ - 依存関係のセキュリティチェック         │
│ - npm audit 実行                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│ 📋 パイプラインサマリー                   │
│ - 全ジョブの実行結果表示                 │
└─────────────────────────────────────────┘
```

---

## 🔐 **シークレットの設定**

### 環境変数の登録方法

1. GitHub リポジトリの **Settings** をクリック
2. 左側メニューから **Secrets and variables** → **Actions** を選択
3. **New repository secret** をクリック
4. シークレット情報を入力

### 必要なシークレット例

```yaml
# SLACK_WEBHOOK_URL
- 名前: SLACK_WEBHOOK_URL
  値: https://hooks.slack.com/services/...

# GITHUB_TOKEN（自動提供）
- 自動的に利用可能
- リリース作成に使用
```

### ワークフロー内での使用方法

```yaml
- name: Slack に通知
  run: |
    curl -X POST ${{ secrets.SLACK_WEBHOOK_URL }} \
      -d '{"text":"テスト完了"}'
```

---

## 📊 **ステータスバッジの追加**

### README に追加

```markdown
![Test Badge](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/test.yml/badge.svg)
![Deploy Badge](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)
```

### バッジの確認方法

```
https://github.com/[USERNAME]/[REPO]/actions/workflows/[WORKFLOW].yml/badge.svg
```

---

## 📈 **カバレッジレポートの生成**

### Codecov との連携

```yaml
- name: カバレッジレポートをアップロード
  uses: codecov/codecov-action@v3
  with:
    files: ./mcp-customer-server/coverage/lcov.info
    flags: unittests
    fail_ci_if_error: false
```

### ローカルでカバレッジを確認

```bash
cd mcp-customer-server
npm run test:coverage

# coverage/lcov-report/index.html をブラウザで開く
```

---

## 🚨 **トラブルシューティング**

### ワークフローが実行されない

```yaml
確認事項：
1. ✅ .github/workflows/*.yml ファイルが存在するか
2. ✅ main / master ブランチに正しくプッシュされているか
3. ✅ ファイルのパス指定が正しいか
4. ✅ YAML フォーマットが正しいか（インデントなど）
```

### テストが失敗する

```bash
# ローカルで再現してみる
cd mcp-customer-server
npm ci
npm test -- --coverage --watchAll=false

# ログを確認
npm test -- --verbose
```

### カバレッジレポートが生成されない

```bash
# テストコマンドを確認
npm test -- --coverage

# coverage ディレクトリが作成されているか確認
ls -la coverage/

# jest.config.js の設定確認
cat jest.config.js || echo "jest.config.js not found"
```

---

## 🔄 **手動でワークフローをトリガー**

GitHub UI から手動実行：

1. **Actions** タブを開く
2. 左側から実行したいワークフローを選択
3. **Run workflow** をクリック
4. **Branch** を選択して実行

---

## 📝 **ワークフロー内での通知設定**

### Slack 通知（オプション）

```yaml
- name: Slack に通知
  if: always()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "CI/CD パイプライン完了",
        "status": "${{ job.status }}"
      }
```

### Email 通知（オプション）

```yaml
- name: Email を送信
  if: failure()
  uses: dawidd6/action-send-mail@v3
  with:
    server_address: smtp.gmail.com
    server_port: 465
    username: ${{ secrets.EMAIL_USER }}
    password: ${{ secrets.EMAIL_PASSWORD }}
    subject: "CI/CD パイプラインが失敗しました"
    to: your-email@example.com
```

---

## 🎯 **ベストプラクティス**

✅ **テストファイルの名前付け規則**
```
- <機能>.test.js
- <機能>.spec.js
例: utils.test.js, alerts.test.js
```

✅ **コミットメッセージの書き方**
```
feat: 新機能の追加
fix: バグ修正
test: テスト追加
ci: CI/CD パイプラインの変更
docs: ドキュメント更新
```

✅ **ブランチ戦略**
```
main       ← 本番リリース
develop    ← 開発用
feature/*  ← 機能開発
bugfix/*   ← バグ修正
```

---

## 📚 **参考リソース**

- [GitHub Actions ドキュメント](https://docs.github.com/ja/actions)
- [Jest テストフレームワーク](https://jestjs.io/)
- [Node.js アクション](https://github.com/actions/setup-node)
- [Codecov](https://codecov.io/)

---

## 🎓 **学習した CI/CD 概念**

✅ GitHub Actions ワークフロー
✅ マトリックス戦略（複数環境での実行）
✅ ジョブの依存関係管理
✅ シークレット情報の管理
✅ アーティファクトのアップロード
✅ リリース自動化
✅ ステータスバッジの生成

**CI/CD パイプラインの実装が完了しました！🚀**
