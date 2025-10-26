# 聚餐分帳計算程式 (Assignment 2)
## 

學生姓名：李偉基 Colin Lee
學生編號：19817751

## 使用說明
安裝程式庫：
[x ]npm install <p>
執行測試：
[ x]npm test <p>
執行程式：
# 基本用法 - 處理單一帳單
[ x ]npx ts-node src/cli.ts <p>
[ x ]--input=sample-data/single-bill.json <p>
[ x ]--output=result.json <p>

# 指定輸出格式為文字
[ x ]npx ts-node src/cli.ts --input=sample-data/single-bill.json <p>
[ x ]--output=result.txt --format=text <p>

 [ x ]批次處理（加分項目）- 處理目錄中的所有檔案 <p>
[ x ]npx ts-node src/cli.ts --input=sample-data/input-dir/ <p>
[ x ]--output=sample-data/output-dir/ --format=json <p>
檔案結構
[ x ]src/core.ts - 習作一的核心計算邏輯 <p>
[ x ]src/processor.ts - 檔案處理主程式（需要實作）<p>
[ x ]src/types.ts - 額外的型別定義 <p>
[ x ]sample-data/ - 範例資料檔案 <p>
[ x ]single-bill.json - 單筆帳單範例 <p>
[ x ]input-dir/ - 批次處理輸入目錄 <p>
[ x ]output-dir/ - 批次處理輸出目錄 <p>
實作要求
請根據 assignment-2.md 的要求實作 
[ x ]src/processor.ts 中的各個函數：<p>

基本功能：

[ x ]命令列參數解析
[ x ]檔案讀取和 JSON 解析
[ x ]檔案寫入（JSON 和文字格式）
[ x ]錯誤處理
加分項目：

[ x ]批次處理能力
[ x ]非同步檔案處理（使用 Promise-based fs API）
[ x ]文字格式輸出