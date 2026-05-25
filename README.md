# andokensaku (コードネーム)

『安藤ケンサク』(任天堂・シフト, 2010, Wii) からメカニクスをインスパイアした
スマホ / iPad / Web 向けのオリジナル作品。検索ヒット数を題材にした 4 モード
収録のソロ専用ゲーム。

> ⚠️ **コードネーム**。最終的なアプリ名は未確定 (WordWeigh / SerchPop /
> ケンサクポップ / ワードバトラー が候補)。任天堂 IP に抵触しない名称が
> 確定したら `app.config.ts` の `name` と `bundleIdentifier` を更新する。

## アーキテクチャ

```
expo + react-native (SDK 52)
├── app/                     Expo Router (file-based routing)
├── src/
│   ├── core/                audio / haptic / storage / utils
│   ├── shared/              theme / hooks / components
│   ├── data/                zod schemas + repositories
│   └── features/            game engines + Zustand stores
├── assets/data/packs/       JSON 問題パック (バンドル配信)
└── tools/
    ├── mcp_search_server/   Google CSE ヒット数 MCP サーバ
    ├── question_generator/  Claude Desktop 用プロンプト
    └── validators/          pack JSON のスキーマ検証
```

### MVP モード (4)
| モード | 概要 |
|---|---|
| `compare` | ふたつの単語のヒット数を比較 |
| `speed` | 30秒で ○/✗ をテンポよく |
| `panel9` | 3x3 陣取り (AND 検索ヒット数) |
| `stairs` | ヒット数が増える単語を選び続ける |

## セットアップ

### 必要ツール
- Node.js 20+ (検証は v24)
- Bun 1.1+ (パッケージマネージャ)
- uv 0.11+ (Python tools 用)
- EAS CLI (ビルド / 配信時のみ)

### 初回

```powershell
bun install
bunx expo install --fix   # SDK と各ライブラリのバージョン整合
```

### 開発サーバ

```powershell
!              # QR コード経由
bun ios                # iOS Simulator (Mac)
bun android            # Android Emulator
bun web                # Web (Chromium / Safari)
```

### テスト

```powershell
bun test               # Jest (unit + engines)
bun typecheck          # tsc --noEmit
bun lint               # eslint
```

### E2E (Maestro)

```powershell
# Maestro は別途インストール: https://maestro.mobile.dev/
maestro test .maestro\smoke-home.yaml
```

### 問題データ生成 (Claude Desktop + MCP)

1. `tools/mcp_search_server/.env` に Google CSE API キーを設定
2. Claude Desktop の `claude_desktop_config.json` に
   `tools/mcp_search_server/README.md` の例を追記
3. Claude Desktop で
   `tools/question_generator/prompts/<mode>.md` をシステムプロンプトとして起動
4. 生成された JSON を `assets/data/packs/<mode>_vN.json` に保存
5. バリデーション:

```powershell
uv --project tools\mcp_search_server run python tools\validators\validate_packs.py
```

## デプロイ

```powershell
eas login
eas build -p ios          # TestFlight 用
eas build -p android      # Internal Testing 用
eas update --branch production   # OTA 配信 (問題パック差し替え)
bunx expo export -p web   # Web 静的ビルド → Cloudflare Pages / GitHub Pages
```

## 体験品質チェックリスト

- [ ] 起動から `app/index.tsx` まで 2 秒以内
- [ ] 正解時: 緑グロー + 紙吹雪 + Success haptic + correct.wav
- [ ] 不正解時: 赤揺れ + Error haptic + wrong.wav
- [ ] 設定 → BGM/SFX/Haptic/カラーモード/言語 が即時反映
- [ ] TalkBack / VoiceOver で全ボタン読み上げ
- [ ] Web で 60fps 維持 (Reanimated worklet)
- [ ] iPad の大画面でカード余白が崩れない

## ライセンス・IP

- 名称 / マスコット / ロゴ / 配色は全てオリジナル
- 「安藤ケンサク」「13ロボ」等の文言を一切含まない
- 宣伝文に「インスパイア」表現も入れない (Guideline 5.2 配慮)
