# 快速開始指南 (Quick Start Guide)

## 安裝與建置

```bash
# 1. 安裝依賴
npm install

# 2. 編譯 TypeScript
npm run build
```

## 基本使用

### 1️⃣ 處理單一檔案 (JSON 輸出)

```bash
node dist/cli.js --input examples/input1.json --output results/output.json
```

**輸入範例 (examples/input1.json):**
```json
{
  "people": [
    {"name": "小明", "paid": 500},
    {"name": "小華", "paid": 300},
    {"name": "小李", "paid": 200}
  ]
}
```

**輸出結果 (results/output.json):**
```json
{
  "totalAmount": 1000,
  "perPersonAmount": 333.33,
  "payments": [
    {"from": "小李", "to": "小明", "amount": 133.33},
    {"from": "小華", "to": "小明", "amount": 33.33}
  ]
}
```

### 2️⃣ 處理單一檔案 (文字輸出)

```bash
node dist/cli.js --input examples/input1.json --output results/output.txt --format text
```

**輸出結果 (results/output.txt):**
```
=== 聚餐分帳結果 ===

總金額: $1000.00
每人應付: $333.33

支付明細:
  1. 小李 → 小明: $133.33
  2. 小華 → 小明: $33.33
```

### 3️⃣ 批次處理目錄

```bash
node dist/cli.js --input examples/ --output results/
```

這會自動處理 `examples/` 目錄中的所有 JSON 檔案，並將結果輸出到 `results/` 目錄。

## 命令列參數

| 參數 | 說明 | 必填 | 範例 |
|------|------|------|------|
| `--input` | 輸入檔案或目錄路徑 | ✅ | `examples/input.json` 或 `examples/` |
| `--output` | 輸出檔案或目錄路徑 | ✅ | `results/output.json` 或 `results/` |
| `--format` | 輸出格式 (json 或 text) | ❌ | `json` (預設) 或 `text` |
| `--help` | 顯示使用說明 | ❌ | - |

## 輸入 JSON 格式

### 基本格式
```json
{
  "people": [
    {"name": "姓名", "paid": 已付金額},
    ...
  ]
}
```

### 指定總金額（選填）
```json
{
  "people": [
    {"name": "Alice", "paid": 1200},
    {"name": "Bob", "paid": 0}
  ],
  "totalAmount": 2000
}
```

## 常見使用場景

### 場景 1: 朋友聚餐
三個朋友一起吃飯，小明付了 500，小華付了 300，小李付了 200。

**input.json:**
```json
{
  "people": [
    {"name": "小明", "paid": 500},
    {"name": "小華", "paid": 300},
    {"name": "小李", "paid": 200}
  ]
}
```

**執行:**
```bash
node dist/cli.js --input input.json --output output.txt --format text
```

### 場景 2: 公司團建
四個同事團建，Alice 墊付了全部費用 2000，其他人未付款。

**input.json:**
```json
{
  "people": [
    {"name": "Alice", "paid": 2000},
    {"name": "Bob", "paid": 0},
    {"name": "Charlie", "paid": 0},
    {"name": "David", "paid": 0}
  ]
}
```

### 場景 3: 已平衡的情況
兩個人各付了 350，無需再轉帳。

**input.json:**
```json
{
  "people": [
    {"name": "張三", "paid": 350},
    {"name": "李四", "paid": 350}
  ]
}
```

## 錯誤訊息

| 錯誤訊息 | 原因 | 解決方法 |
|----------|------|----------|
| 檔案不存在: xxx | 輸入檔案路徑不正確 | 檢查檔案路徑是否正確 |
| JSON 格式錯誤: 缺少 people 陣列 | JSON 缺少必要欄位 | 確保 JSON 包含 people 陣列 |
| 每個人必須有名字 | people 中缺少 name | 為每個人添加 name 欄位 |
| paid 必須是非負數 | paid 為負數或非數字 | 確保 paid 是非負數字 |

## 進階使用

### 批次處理多個檔案
```bash
# 將 examples 目錄中的所有 JSON 檔案處理為文字格式
node dist/cli.js --input examples/ --output results/ --format text
```

### 清理舊的編譯檔案
```bash
npm run clean
npm run build
```

## 技巧提示

1. **批次處理時**，程式會自動跳過非 JSON 檔案
2. **輸出目錄**如果不存在會自動建立
3. **文字格式**適合人類閱讀，JSON 格式適合程式處理
4. 使用 `--help` 查看內建使用說明

## 需要協助？

執行以下命令查看完整說明：
```bash
node dist/cli.js --help
```
