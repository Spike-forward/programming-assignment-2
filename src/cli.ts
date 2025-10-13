#!/usr/bin/env node
/**
 * 命令列介面
 * 處理命令列參數並執行檔案處理
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import { calculateBillSplitting } from './core';
import { 
  readJsonFile, 
  writeJsonFile, 
  writeTextFile, 
  scanJsonFiles, 
  ensureDirectory 
} from './fileIO';

interface CliOptions {
  input: string;
  output: string;
  format: 'json' | 'text';
}

/**
 * 解析命令列參數
 */
function parseArguments(): CliOptions | null {
  const args = process.argv.slice(2);
  const options: Partial<CliOptions> = {
    format: 'json'
  };
  
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
        options.input = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--format':
        const format = args[++i];
        if (format !== 'json' && format !== 'text') {
          console.error('錯誤: --format 只支援 json 或 text');
          return null;
        }
        options.format = format;
        break;
      case '--help':
        printHelp();
        return null;
      default:
        console.error(`未知的參數: ${args[i]}`);
        printHelp();
        return null;
    }
  }
  
  if (!options.input || !options.output) {
    console.error('錯誤: 必須提供 --input 和 --output 參數');
    printHelp();
    return null;
  }
  
  return options as CliOptions;
}

/**
 * 顯示使用說明
 */
function printHelp(): void {
  console.log(`
聚餐分帳計算工具

使用方式:
  node dist/cli.js --input <路徑> --output <路徑> [--format <格式>]

參數:
  --input <路徑>   輸入檔案或目錄路徑（支援 JSON 檔案或包含 JSON 檔案的目錄）
  --output <路徑>  輸出檔案或目錄路徑
  --format <格式>  輸出格式 (json 或 text)，預設為 json
  --help           顯示此說明訊息

範例:
  # 處理單一檔案
  node dist/cli.js --input examples/input.json --output examples/output.json

  # 處理單一檔案並輸出文字格式
  node dist/cli.js --input examples/input.json --output examples/output.txt --format text

  # 批次處理目錄中的所有 JSON 檔案
  node dist/cli.js --input examples/ --output results/
  `);
}

/**
 * 處理單一檔案
 */
async function processSingleFile(inputPath: string, outputPath: string, format: 'json' | 'text'): Promise<void> {
  try {
    console.log(`處理檔案: ${inputPath}`);
    
    // 讀取輸入檔案
    const inputData = await readJsonFile(inputPath);
    
    // 計算分帳結果
    const result = calculateBillSplitting(inputData);
    
    // 確保輸出目錄存在
    const outputDir = path.dirname(outputPath);
    await ensureDirectory(outputDir);
    
    // 寫入輸出檔案
    if (format === 'json') {
      await writeJsonFile(outputPath, result);
    } else {
      await writeTextFile(outputPath, result);
    }
    
    console.log(`✓ 結果已儲存至: ${outputPath}`);
  } catch (error) {
    console.error(`✗ 處理失敗: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 批次處理目錄
 */
async function processDirectory(inputDir: string, outputDir: string, format: 'json' | 'text'): Promise<void> {
  try {
    console.log(`掃描目錄: ${inputDir}`);
    
    // 掃描所有 JSON 檔案
    const jsonFiles = await scanJsonFiles(inputDir);
    
    if (jsonFiles.length === 0) {
      console.log('未找到任何 JSON 檔案');
      return;
    }
    
    console.log(`找到 ${jsonFiles.length} 個 JSON 檔案`);
    
    // 確保輸出目錄存在
    await ensureDirectory(outputDir);
    
    // 處理每個檔案
    let successCount = 0;
    let failCount = 0;
    
    for (const inputFile of jsonFiles) {
      try {
        const fileName = path.basename(inputFile, '.json');
        const extension = format === 'json' ? '.json' : '.txt';
        const outputFile = path.join(outputDir, `${fileName}_result${extension}`);
        
        await processSingleFile(inputFile, outputFile, format);
        successCount++;
      } catch (error) {
        failCount++;
        // 繼續處理下一個檔案
      }
    }
    
    console.log(`\n處理完成: ${successCount} 成功, ${failCount} 失敗`);
  } catch (error) {
    console.error(`✗ 批次處理失敗: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * 檢查路徑是否為目錄
 */
async function isDirectory(filePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(filePath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 主程式
 */
async function main(): Promise<void> {
  const options = parseArguments();
  
  if (!options) {
    process.exit(1);
  }
  
  try {
    const inputIsDir = await isDirectory(options.input);
    const outputIsDir = options.output.endsWith('/') || options.output.endsWith('\\');
    
    if (inputIsDir) {
      // 批次處理目錄
      await processDirectory(options.input, options.output, options.format);
    } else {
      // 處理單一檔案
      if (outputIsDir) {
        console.error('錯誤: 當輸入為檔案時，輸出必須也是檔案路徑');
        process.exit(1);
      }
      await processSingleFile(options.input, options.output, options.format);
    }
  } catch (error) {
    process.exit(1);
  }
}

// 執行主程式
main();
