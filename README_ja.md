# ccmcp - Claude Code MCP コントロールパネル

🔧 Claude Code 用インタラクティブ MCP サーバー管理ツール

## 機能

- **📋 MCP サーバー一覧表示** - 設定済みの全 MCP サーバーを表示
- **🔄 サーバー切り替え** - 簡単なキー操作で MCP サーバーの有効/無効を切り替え
- **📊 ステータス監視** - MCP サーバーの実行状態を確認
- **🎮 インタラクティブインターフェース** - 矢印キーでナビゲート、スペースキーで切り替え
- **📤 mmcp へエクスポート** - Claude Code 設定を mmcp にエクスポートして複数 CLI 間で管理
- **🚀 高速・軽量** - TypeScript で構築された高速動作

## インストール

### オプション1: npx を使用（推奨）

```bash
# インストール不要で直接実行
npx ccmcp@latest

# または特定バージョンを実行
npx ccmcp@1.1.0
```

### オプション2: グローバルインストール

```bash
# npm からグローバルインストール
npm install -g ccmcp

# どこからでも実行可能
ccmcp
```

### オプション3: 開発環境セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/karaage0703/ccmcp.git
cd ccmcp
npm install
npm run build

# 直接実行
npm start

# またはローカルビルドからグローバルインストール
npm install -g .
ccmcp
```

## 使い方

### mmcp 連携

Claude Code の MCP サーバーを [mmcp](https://www.npmjs.com/package/mmcp) にエクスポートして複数 CLI 間で管理：

```bash
# 1. mmcp をインストール（未インストールの場合）
npm install -g mmcp

# 2. Claude Code 設定を mmcp 形式にエクスポート
ccmcp export-to-mmcp

# 3. ターゲット CLI エージェントを追加（例：Codex CLI）
mmcp agents add codex-cli

# 4. ターゲット CLI に設定を適用
mmcp apply
```

**mmcp とは？**
[mmcp](https://github.com/kou-pg-0131/mmcp) は、複数の AI エージェント（Claude Code、Codex CLI、Cursor、Gemini CLI など）間で MCP サーバー設定を一元管理する CLI ツールです。

### インタラクティブモード（デフォルト）

`ccmcp` を実行するだけでインタラクティブインターフェースが起動します：

```bash
# npx を使用
npx ccmcp@latest

# またはグローバルインストール済みの場合
ccmcp

# または開発環境から
npm start
```

**操作方法：**
- `↑/↓` - サーバー間を移動
- `SPACE` - サーバーの切り替え（無効化/有効化）
- `Q` - 終了

### 非インタラクティブモード

CI/スクリプトや非 TTY 環境に最適：

```bash
# npx を使用
CI=true npx ccmcp@latest

# またはグローバルインストール済みの場合
CI=true ccmcp

# または開発環境から
CI=true npm start
```

インタラクティブインターフェースなしで設定済みサーバーの一覧を表示します。

## 仕組み

ccmcp は安全なバックアップシステムを使用して Claude Code の MCP サーバーを管理します：

- **設定パス**: `~/.claude.json`（Claude Code のメイン設定）
- **バックアップパス**: `~/.ccmcp_backup.json`（無効化されたサーバーの保存場所）
- **サーバー管理**: アクティブファイルとバックアップファイル間でサーバーを移動
- **ステータス監視**: サーバーコマンドをテストして可用性を確認

### サーバーの状態

- **有効**: `~/.claude.json` にサーバーが存在し、アクティブ
- **無効**: `~/.ccmcp_backup.json` にサーバーが移動され、Claude Code からは非表示

このアプローチにより以下が保証されます：
- ✅ Claude Code が無効化されたサーバーを正しく利用不可として認識
- ✅ サーバー設定が復元のために安全に保持
- ✅ Claude Code の設定形式への干渉なし

## 設定ファイル

### アクティブサーバー（`~/.claude.json`）
```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"]
    }
  }
}
```

### 無効化されたサーバー（`~/.ccmcp_backup.json`）
```json
{
  "disabledServers": {
    "markitdown": {
      "command": "uvx",
      "args": ["markitdown-mcp"]
    }
  }
}
```

## 開発

```bash
# 依存関係をインストール
npm install

# 開発モードで実行
npm run dev

# 型チェック
npm run typecheck

# 配布用にビルド
npm run build
```

## 要件

- Node.js 20.19.4 以降
- Claude Code がインストール・設定済み
- macOS（現在の実装は macOS パスを想定）

## アーキテクチャ

- **TypeScript** - 型安全な開発
- **ネイティブ Node.js** - UI に外部依存なし
- **直接ファイル操作** - Claude 設定を直接読み書き
- **プロセス監視** - サーバーの可用性をテスト

## 関連プロジェクト

- [ccusage](https://github.com/ryoppippi/ccusage) - このプロジェクトのインスピレーション元となった Claude Code 使用状況分析ツール

## ライセンス

MIT License - 自由に使用・改変できます！
