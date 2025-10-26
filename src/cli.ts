import { promises as fs } from 'fs';
import * as path from 'path';
import { CliArgs } from './types';
import { processSingleFile, processBatchFiles } from './processor';

/**
 * 解析命令列參數
 */
function parseCliArgs(): CliArgs {
  const args = process.argv.slice(2);
  const parsed: Partial<CliArgs> = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--input=')) {
      parsed.input = arg.split('=')[1];
    } else if (arg.startsWith('--output=')) {
      parsed.output = arg.split('=')[1];
    } else if (arg.startsWith('--format=')) {
      const format = arg.split('=')[1];
      if (format === 'json' || format === 'text') {
        parsed.format = format;
      } else {
        console.error(`錯誤: 不支援的格式 "${format}"。支援的格式: json, text`);
        process.exit(1);
      }
    } else if (arg === '--input' && i + 1 < args.length) {
      parsed.input = args[++i];
    } else if (arg === '--output' && i + 1 < args.length) {
      parsed.output = args[++i];
    } else if (arg === '--format' && i + 1 < args.length) {
      const format = args[++i];
      if (format === 'json' || format === 'text') {
        parsed.format = format;
      } else {
        console.error(`錯誤: 不支援的格式 "${format}"。支援的格式: json, text`);
        process.exit(1);
      }
    }
  }
  
  if (!parsed.input) {
    console.error('錯誤: 缺少 --input 參數');
    console.error('用法: npx ts-node src/cli.ts --input=<輸入檔案或目錄> --output=<輸出檔案或目錄> [--format=json|text]');
    process.exit(1);
  }
  
  if (!parsed.output) {
    console.error('錯誤: 缺少 --output 參數');
    console.error('用法: npx ts-node src/cli.ts --input=<輸入檔案或目錄> --output=<輸出檔案或目錄> [--format=json|text]');
    process.exit(1);
  }
  
  return {
    input: parsed.input,
    output: parsed.output,
    format: parsed.format || 'json'
  };
}

/**
 * 檢查路徑是否為目錄
 */
async function isDirectory(path: string): Promise<boolean> {
  try {
    const stats = await fs.stat(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * 主函數
 */
async function main(): Promise<void> {
  try {
    const args = parseCliArgs();
    
    console.log('聚餐分帳計算程式');
    console.log('==================');
    console.log(`輸入: ${args.input}`);
    console.log(`輸出: ${args.output}`);
    console.log(`格式: ${args.format}`);
    console.log('');
    
    const inputIsDir = await isDirectory(args.input);
    const outputIsDir = await isDirectory(args.output);
    
    // 檢查輸入和輸出的目錄/檔案狀態是否匹配
    if (inputIsDir && outputIsDir) {
      // 輸入是目錄，輸出也是目錄
      console.log('批次處理模式: 處理目錄中的所有 JSON 檔案');
      const result = await processBatchFiles(args.input, args.output, args.format);
      
      if (result.success) {
        console.log(`✅ 批次處理完成！成功處理 ${result.processedFiles} 個檔案`);
        if (result.errors.length > 0) {
          console.log('\n處理過程中的錯誤:');
          result.errors.forEach(error => console.log(`  - ${error}`));
        }
      } else {
        console.error('❌ 批次處理失敗');
        result.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      }
    } else if (!inputIsDir && !outputIsDir) {
      // 輸入是檔案，輸出也是檔案
      console.log('單一檔案處理模式');
      const result = await processSingleFile(args.input, args.output, args.format);
      
      if (result.success) {
        console.log('✅ 檔案處理完成！');
        if (result.data) {
          console.log(`總金額: $${result.data.totalAmount.toFixed(1)}`);
          console.log(`參與人數: ${result.data.items.length}`);
        }
      } else {
        console.error(`❌ 檔案處理失敗: ${result.error}`);
        process.exit(1);
      }
    } else {
      console.error('錯誤: 輸入和輸出的類型不匹配');
      console.error('  - 如果輸入是目錄，輸出也應該是目錄');
      console.error('  - 如果輸入是檔案，輸出也應該是檔案');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('程式執行錯誤:', error instanceof Error ? error.message : '未知錯誤');
    process.exit(1);
  }
}

// 執行主函數
if (require.main === module) {
  main().catch(error => {
    console.error('未預期的錯誤:', error);
    process.exit(1);
  });
}
