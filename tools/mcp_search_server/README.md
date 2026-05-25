# mcp-search-server

Google Custom Search ヒット数を返す MCP サーバ。`andokensaku` の問題データ生成
パイプラインから Claude Desktop 経由で叩く前提。

## 提供ツール

| ツール | 引数 | 戻り値 |
|---|---|---|
| `search_hit_count` | `query: str` | 単一クエリの推定ヒット数 |
| `batch_hit_count` | `queries: list[str]` | 複数クエリを逐次取得 (キャッシュ優先) |
| `and_hit_count` | `term_a, term_b` | AND 検索ヒット数 (panel9 用) |
| `compare_words` | `word_a, word_b` | 2 語を比較し勝者と倍率を返す |
| `cache_stats` | なし | キャッシュヒット率と当日残量 |

## 設計の要点

- **SQLite キャッシュ**: 同一クエリは絶対に再呼出ししない。`.cache/cse.db` に保存。
- **日次クォータガード**: 既定 100 件/日 (CSE 無料枠)。超過で `QuotaExceededError`。
- **正規化**: NFKC で全/半角・合字を統一。AND 検索のキャッシュキーは順不同。
- **`fetched_at`**: 取得時刻を全レスポンスに付与。問題 JSON の `snapshot_date` に転記する。

## セットアップ

```powershell
cd C:\Users\riE62\python\andokensaku\tools\mcp_search_server
Copy-Item .env.example .env   # 編集して GOOGLE_CSE_API_KEY / CX を入れる
uv sync
uv run mcp-search-server      # stdio 待機すれば OK
```

API キー / CX の取得:
1. Google Cloud Console で **Custom Search API** を有効化 → API キー発行
2. <https://programmablesearchengine.google.com/> で検索エンジンを作成 → CX 取得
3. 全 Web 検索にする場合は「ウェブ全体を検索」を ON

## Claude Desktop 連携

`%APPDATA%\Claude\claude_desktop_config.json` に以下を追記:

```jsonc
{
  "mcpServers": {
    "search-hit-count": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\Users\\riE62\\python\\andokensaku\\tools\\mcp_search_server",
        "run",
        "mcp-search-server"
      ],
      "env": {
        "GOOGLE_CSE_API_KEY": "your-key-here",
        "GOOGLE_CSE_CX": "your-cx-here"
      }
    }
  }
}
```

Claude Desktop を再起動して「search_hit_count で 東京 のヒット数を取得して」と話しかけ、
JSON が返ってくれば OK。

## 開発

```powershell
uv run python -m mcp_search_server   # 起動 (stdio)
uv run pytest                        # テスト (今後追加)
```
