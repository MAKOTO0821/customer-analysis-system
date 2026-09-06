# 🔌 カスタム顧客分析 MCP サーバー

このMCPサーバーは、顧客ファイルプロジェクトのデータを分析するClaudeの拡張機能です。

## 📋 機能

### 提供ツール

1. **analyze_customers** - 顧客データの統計
   - 総顧客数
   - アクティブ顧客数
   - 非アクティブ顧客数
   - バージョン情報

2. **analyze_sales** - 売上データの統計
   - 総売上
   - 売上記録数
   - ユニーク顧客数
   - ユニーク製品数
   - 平均注文額

3. **get_customer_by_id** - 顧客情報取得
   - 指定IDの顧客詳細情報を取得

4. **get_active_customers** - アクティブ顧客一覧
   - ステータスが「active」の顧客一覧

## 🚀 セットアップ手順

### 前提条件
- Node.js v14以上がインストール済み

### インストール

```bash
# MCP サーバーディレクトリへ移動
cd mcp-customer-server

# 依存関係をインストール（このサーバーは外部依存なし）
npm install
```

### Claude Code での設定

1. Claude Code の設定ファイルを開く
   - `.claude/launch.json` または `settings.json`

2. MCP サーバー設定を追加

```json
{
  "mcp": {
    "servers": {
      "customer-analysis": {
        "command": "node",
        "args": [
          "path/to/mcp-customer-server/server.js"
        ],
        "env": {
          "NODE_PATH": "path/to/mcp-customer-server"
        }
      }
    }
  }
}
```

3. Claude Code を再起動

### 使用例

Claude に以下のように指示できるようになります：

```
"顧客データの統計を表示して"
→ MCP が analyze_customers を実行
→ 結果: 総顧客数: 4, アクティブ: 3, 非アクティブ: 1

"売上の統計情報をください"
→ MCP が analyze_sales を実行
→ 結果: 総売上: 241,000円, 平均注文額: 30,125円

"ID 1 の顧客情報を表示"
→ MCP が get_customer_by_id を実行
→ 結果: 田中太郎の詳細情報
```

## 🧪 テスト方法

### 直接実行

```bash
# サーバーを起動
node server.js

# 別のターミナルから JSON リクエストを送信
echo '{"method":"tools/list"}' | node server.js
```

### Claude Code での使用

1. MCP を設定後、Claude Code を起動
2. 以下のようにClaudeに指示
   ```
   "顧客データを分析して、統計情報を教えて"
   ```
3. MCPが自動的にツールを呼び出します

## 📊 データソース

このMCPサーバーは以下のファイルを使用します：

- `../data/customers.json` - 顧客マスタデータ
- `../data/sales-records.csv` - 売上記録

ファイルが存在しない場合は、エラーが返されます。

## 🔧 トラブルシューティング

### サーバーが起動しない

```
Error: Cannot find module...
→ Node.js がインストール済みか確認
→ ファイルパスが正しいか確認
```

### データが見つからない

```
Error: ENOENT: no such file or directory
→ data/ フォルダが親ディレクトリに存在するか確認
→ customers.json, sales-records.csv が存在するか確認
```

### Claudeからツールが呼び出されない

1. Claude Code の設定ファイルを確認
2. ファイルパスが絶対パスになっているか確認
3. Claude Code を再起動

## 📝 実装詳細

- **言語**: Node.js (JavaScript)
- **プロトコル**: 標準入出力 (stdio) ベースのMCP
- **依存関係**: なし（標準ライブラリのみ）

## 🎓 学習ポイント

このMCPサーバーから学べること：

1. MCPの基本的な実装方法
2. JSON RPC プロトコルの仕組み
3. ファイル I/O の実装
4. ツールの定義方法
5. エラーハンドリング

## 🚀 拡張アイデア

以下のような機能を追加できます：

- データベース連携（SQLite, PostgreSQL）
- 外部API呼び出し（天気、為替データなど）
- キャッシング機能
- ログ機能
- 複雑な分析関数

## ⚖️ ライセンス

MIT License

---

**作成日**: 2026-09-06<br>
**バージョン**: 1.0.0<br>
**状態**: 開発版