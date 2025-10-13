# 功能實作清單 (Feature Implementation Checklist)

## 核心功能 ✓
- [x] **檔案 I/O 處理**
  - 使用 `fs/promises` API 實作非同步檔案讀寫
  - JSON 格式驗證（檢查 people 陣列、name 和 paid 欄位）
  - 支援 JSON 格式輸出

- [x] **命令列介面**
  - 使用 `process.argv` 解析命令列參數
  - 支援 `--input` 參數（檔案或目錄路徑）
  - 支援 `--output` 參數（檔案或目錄路徑）
  - 支援 `--help` 顯示使用說明

- [x] **錯誤處理**
  - 檔案不存在錯誤處理
  - JSON 格式錯誤處理
  - 完整的錯誤訊息提示

- [x] **模組化設計**
  - `core.ts`: 核心計算邏輯
  - `fileIO.ts`: 檔案 I/O 處理
  - `cli.ts`: 命令列介面
  - 重用計算函數設計

- [x] **TypeScript 開發**
  - 完整的型別定義
  - 嚴格模式啟用
  - 編譯配置完善

- [x] **版本控制**
  - 使用 Git 進行版本控制
  - 適當的 .gitignore 配置
  - 清晰的提交訊息

## 加分項目 ✓

### 批次處理能力（+10 分）
- [x] 支援處理多筆聚餐分帳資料
- [x] 支援輸入目錄（自動掃描所有 JSON 檔案）
- [x] 支援輸出目錄（批次輸出結果）
- [x] 自動跳過非 JSON 檔案
- [x] 顯示處理進度和統計（成功/失敗數量）

### 非同步檔案處理（+5 分）
- [x] 使用 `async/await` 語法
- [x] 使用 Promise-based fs API (`fs/promises`)
- [x] 所有檔案操作都是非同步的

### 文字格式輸出（+3 分）
- [x] 支援 `--format` 參數（json 或 text）
- [x] 格式化的文字報告輸出
- [x] 清晰的中文格式顯示

## 額外功能

- [x] 完整的使用說明文件（README.md）
- [x] 範例輸入檔案（3 個不同場景）
- [x] 自動建立輸出目錄
- [x] 優雅的錯誤訊息（中文）
- [x] 支援指定總金額（可選）
- [x] 正確處理平衡情況（無需支付）

## 測試場景

### 1. 單一檔案處理 (JSON)
```bash
node dist/cli.js --input examples/input1.json --output results/output1.json
```

### 2. 單一檔案處理 (文字格式)
```bash
node dist/cli.js --input examples/input2.json --output results/output2.txt --format text
```

### 3. 批次處理目錄
```bash
node dist/cli.js --input examples/ --output results/
```

### 4. 錯誤處理
- 檔案不存在
- JSON 格式錯誤
- 缺少必要欄位

## 技術亮點

1. **模組化架構**：清晰的職責分離，便於維護和擴展
2. **型別安全**：完整的 TypeScript 型別定義
3. **非同步處理**：使用現代的 async/await 語法
4. **錯誤處理**：完善的異常捕捉和使用者友善的錯誤訊息
5. **批次能力**：支援單檔案和目錄批次處理
6. **多格式輸出**：支援 JSON 和文字兩種輸出格式
7. **國際化**：中文介面和訊息

## 核心演算法

使用**貪婪演算法**計算最少支付次數：
1. 計算每個人的餘額（已付 - 應付）
2. 分離債權人（餘額 > 0）和債務人（餘額 < 0）
3. 使用雙指標配對，最小化支付次數
4. 精確到小數點後兩位
