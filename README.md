# 聚餐分帳擴展與檔案處理 (Bill Splitting Extension with File I/O)

這是一個基於 TypeScript 開發的聚餐分帳計算工具，支援從 JSON 檔案讀取資料、計算分帳結果，並輸出格式化的結果到檔案。

## 功能特色

### 核心功能
- ✅ **檔案 I/O 處理**：從 JSON 檔案讀取聚餐分帳資料，驗證格式正確性，輸出 JSON 格式結果
- ✅ **命令列介面**：支援 `--input`、`--output` 參數，使用 Node.js 內建的 `process.argv`
- ✅ **錯誤處理**：處理檔案不存在、JSON 格式錯誤等異常情況
- ✅ **模組化設計**：重用計算函數，使用 TypeScript 開發
- ✅ **版本控制**：使用 Git 進行版本控制

### 加分項目
- ✅ **批次處理能力（+10 分）**：支援處理多筆聚餐分帳資料，支援輸入/輸出目錄，自動掃描目錄中的所有 JSON 檔案，跳過非 JSON 檔案
- ✅ **非同步檔案處理（+5 分）**：使用 async/await 處理檔案 I/O 操作（使用 Promise-based fs API）
- ✅ **文字格式輸出（+3 分）**：支援 `--format` 參數控制輸出格式（json 或 text），支援輸出格式化的文字報告

## 安裝

```bash
# 安裝依賴
npm install

# 編譯 TypeScript
npm run build
```

## 使用方式

### 命令列參數

```bash
node dist/cli.js --input <路徑> --output <路徑> [--format <格式>]
```

**參數說明：**
- `--input <路徑>`：輸入檔案或目錄路徑（支援 JSON 檔案或包含 JSON 檔案的目錄）
- `--output <路徑>`：輸出檔案或目錄路徑
- `--format <格式>`：輸出格式（`json` 或 `text`），預設為 `json`
- `--help`：顯示使用說明

### 使用範例

#### 1. 處理單一檔案（JSON 輸出）

```bash
node dist/cli.js --input examples/input1.json --output results/output1.json
```

#### 2. 處理單一檔案（文字輸出）

```bash
node dist/cli.js --input examples/input1.json --output results/output1.txt --format text
```

#### 3. 批次處理目錄

```bash
node dist/cli.js --input examples/ --output results/
```

這會自動掃描 `examples/` 目錄中的所有 JSON 檔案並處理。

## 輸入格式

輸入的 JSON 檔案格式如下：

```json
{
  "people": [
    {
      "name": "小明",
      "paid": 500
    },
    {
      "name": "小華",
      "paid": 300
    },
    {
      "name": "小李",
      "paid": 200
    }
  ]
}
```

或者可以指定總金額：

```json
{
  "people": [
    {
      "name": "Alice",
      "paid": 1200
    },
    {
      "name": "Bob",
      "paid": 0
    }
  ],
  "totalAmount": 2000
}
```

**欄位說明：**
- `people`：參與分帳的人員列表（必填）
  - `name`：人員姓名（必填）
  - `paid`：該人員已支付的金額（必填，非負數）
- `totalAmount`：總金額（選填，若未提供則以所有人支付金額總和計算）

## 輸出格式

### JSON 格式

```json
{
  "totalAmount": 1000,
  "perPersonAmount": 333.33,
  "payments": [
    {
      "from": "小華",
      "to": "小明",
      "amount": 33.33
    },
    {
      "from": "小李",
      "to": "小明",
      "amount": 133.33
    }
  ]
}
```

### 文字格式

```
=== 聚餐分帳結果 ===

總金額: $1000.00
每人應付: $333.33

支付明細:
  1. 小華 → 小明: $33.33
  2. 小李 → 小明: $133.33
```

## 專案結構

```
programming-assignment-2/
├── src/
│   ├── core.ts       # 聚餐分帳計算核心邏輯
│   ├── fileIO.ts     # 檔案 I/O 處理模組
│   └── cli.ts        # 命令列介面
├── examples/         # 範例輸入檔案
│   ├── input1.json
│   ├── input2.json
│   └── input3.json
├── dist/            # 編譯後的 JavaScript 檔案
├── package.json
├── tsconfig.json
└── README.md
```

## 技術規格

- **語言**：TypeScript 5.x
- **執行環境**：Node.js
- **檔案 I/O**：使用 `fs/promises` API（非同步操作）
- **命令列參數**：使用 `process.argv`
- **錯誤處理**：完整的錯誤捕捉與訊息提示

## 核心演算法

本程式使用貪婪演算法來計算最少的支付次數：

1. 計算每個人的餘額（已付金額 - 應付金額）
2. 將參與者分為債權人（餘額為正）和債務人（餘額為負）
3. 使用雙指標演算法配對債權人和債務人，計算最優支付方案

## 開發

```bash
# 清理編譯產物
npm run clean

# 重新編譯
npm run build

# 執行程式
npm start -- --input examples/input1.json --output results/output1.json
```

## License

ISC
