import { BillInput, BillOutput, ProcessResult, BatchProcessResult } from './types';
import { splitBill } from './core';

// Node.js 18+ 支援 import fs/promises，若發生錯誤請改用下列兩行
import { promises as fs } from 'fs';
import * as path from 'path';

/**
 * 讀取 JSON 檔案並解析為 BillInput
 */
export async function readBillFromFile(filePath: string): Promise<BillInput> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const billData = JSON.parse(content);
    
    // 驗證 JSON 格式
    validateBillInput(billData);
    
    return billData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON 格式錯誤: ${error.message}`);
    }
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      throw new Error(`檔案不存在: ${filePath}`);
    }
    throw new Error(`讀取檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 驗證 BillInput 格式
 */
function validateBillInput(data: any): asserts data is BillInput {
  if (!data || typeof data !== 'object') {
    throw new Error('無效的 JSON 格式');
  }
  
  if (!data.date || typeof data.date !== 'string') {
    throw new Error('缺少或無效的 date 欄位');
  }
  
  if (!data.location || typeof data.location !== 'string') {
    throw new Error('缺少或無效的 location 欄位');
  }
  
  if (typeof data.tipPercentage !== 'number' || data.tipPercentage < 0) {
    throw new Error('缺少或無效的 tipPercentage 欄位');
  }
  
  if (!Array.isArray(data.items)) {
    throw new Error('缺少或無效的 items 欄位');
  }
  
  for (const item of data.items) {
    if (!item || typeof item !== 'object') {
      throw new Error('無效的 item 格式');
    }
    
    if (!item.name || typeof item.name !== 'string') {
      throw new Error('缺少或無效的 item name');
    }
    
    if (typeof item.price !== 'number' || item.price < 0) {
      throw new Error('缺少或無效的 item price');
    }
    
    if (typeof item.isShared !== 'boolean') {
      throw new Error('缺少或無效的 item isShared 欄位');
    }
    
    if (!item.isShared && (!item.person || typeof item.person !== 'string')) {
      throw new Error('個人項目缺少 person 欄位');
    }
  }
}

/**
 * 將 BillOutput 寫入 JSON 檔案
 */
export async function writeBillToJsonFile(filePath: string, output: BillOutput): Promise<void> {
  try {
    const jsonContent = JSON.stringify(output, null, 2);
    await fs.writeFile(filePath, '\uFEFF' + jsonContent, { encoding: 'utf8' });
  } catch (error) {
    throw new Error(`寫入檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 將 BillOutput 轉換為文字格式
 */
export function formatBillAsText(output: BillOutput, originalInput: BillInput): string {
  const sharedItems = originalInput.items.filter(item => item.isShared);
  const personalItems = originalInput.items.filter(item => !item.isShared);
  
  // 按人員分組個人項目
  const personalItemsByPerson = personalItems.reduce((acc, item) => {
    if (!acc[item.person]) {
      acc[item.person] = [];
    }
    acc[item.person].push(item);
    return acc;
  }, {} as Record<string, typeof personalItems>);

  let text = '===== 聚餐分帳結果 =====\n';
  text += `日期：${output.date}\n`;
  text += `地點：${output.location}\n\n`;
  
  // 均分項目
  if (sharedItems.length > 0) {
    text += '均分項目：\n';
    sharedItems.forEach((item, index) => {
      text += `${index + 1}. ${item.name} ($${item.price.toFixed(1)})\n`;
    });
    text += '\n';
  }
  
  // 非均分項目
  Object.entries(personalItemsByPerson).forEach(([person, items]) => {
    text += `非均分項目 - ${person}：\n`;
    items.forEach((item, index) => {
      text += `${index + 1}. ${item.name} ($${item.price.toFixed(1)})\n`;
    });
    text += '\n';
  });
  
  text += `小結：$${output.subTotal.toFixed(1)}\n\n`;
  text += `小費：$${output.tip.toFixed(1)}\n\n`;
  text += `總金額：$${output.totalAmount.toFixed(1)}\n\n`;
  text += '分帳結果：\n';
  
  output.items.forEach((item, index) => {
    text += `${index + 1}. ${item.name} 應付：$${item.amount.toFixed(1)}\n`;
  });
  
  return text;
}

/**
 * 將 BillOutput 寫入文字檔案
 */
export async function writeBillToTextFile(filePath: string, output: BillOutput, originalInput: BillInput): Promise<void> {
  try {
    const textContent = formatBillAsText(output, originalInput);
    await fs.writeFile(filePath, '\uFEFF' + textContent, { encoding: 'utf8' });
  } catch (error) {
    throw new Error(`寫入檔案失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
  }
}

/**
 * 處理單一檔案
 */
export async function processSingleFile(inputPath: string, outputPath: string, format: 'json' | 'text' = 'json'): Promise<ProcessResult> {
  try {
    const billInput = await readBillFromFile(inputPath);
    const billOutput = splitBill(billInput);
    
    if (format === 'text') {
      await writeBillToTextFile(outputPath, billOutput, billInput);
    } else {
      await writeBillToJsonFile(outputPath, billOutput);
    }
    
    return {
      success: true,
      message: `成功處理檔案: ${inputPath}`,
      data: billOutput
    };
  } catch (error) {
    return {
      success: false,
      message: `處理檔案失敗: ${inputPath}`,
      error: error instanceof Error ? error.message : '未知錯誤'
    };
  }
}

/**
 * 檢查是否為 JSON 檔案
 */
function isJsonFile(fileName: string): boolean {
  return path.extname(fileName).toLowerCase() === '.json';
}

/**
 * 批次處理目錄中的所有 JSON 檔案
 */
export async function processBatchFiles(inputDir: string, outputDir: string, format: 'json' | 'text' = 'json'): Promise<BatchProcessResult> {
  try {
    // 確保輸出目錄存在
    await fs.mkdir(outputDir, { recursive: true });
    
    // 讀取輸入目錄中的所有檔案
    const files = await fs.readdir(inputDir);
    const jsonFiles = files.filter(file => isJsonFile(file));
    
    if (jsonFiles.length === 0) {
      return {
        success: false,
        processedFiles: 0,
        errors: ['輸入目錄中沒有找到 JSON 檔案'],
        results: []
      };
    }
    
    const results: ProcessResult[] = [];
    const errors: string[] = [];
    
    // 處理每個 JSON 檔案
    for (const fileName of jsonFiles) {
      const inputPath = path.join(inputDir, fileName);
      const outputFileName = path.basename(fileName, '.json') + '-result' + (format === 'text' ? '.txt' : '.json');
      const outputPath = path.join(outputDir, outputFileName);
      
      const result = await processSingleFile(inputPath, outputPath, format);
      results.push(result);
      
      if (!result.success) {
        errors.push(`${fileName}: ${result.error}`);
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    
    return {
      success: successCount > 0,
      processedFiles: successCount,
      errors,
      results
    };
  } catch (error) {
    return {
      success: false,
      processedFiles: 0,
      errors: [`批次處理失敗: ${error instanceof Error ? error.message : '未知錯誤'}`],
      results: []
    };
  }
}