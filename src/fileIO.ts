/**
 * 檔案 I/O 處理模組
 * 處理 JSON 檔案的讀取和寫入
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { BillSplittingData, BillSplittingResult } from './core';

export interface FileIOError {
  message: string;
  filePath?: string;
  originalError?: Error;
}

/**
 * 讀取 JSON 檔案
 */
export async function readJsonFile(filePath: string): Promise<BillSplittingData> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // 驗證資料格式
    if (!data.people || !Array.isArray(data.people)) {
      throw new Error('JSON 格式錯誤: 缺少 people 陣列');
    }
    
    for (const person of data.people) {
      if (!person.name || typeof person.name !== 'string') {
        throw new Error('JSON 格式錯誤: 每個人必須有名字');
      }
      if (typeof person.paid !== 'number' || person.paid < 0) {
        throw new Error('JSON 格式錯誤: paid 必須是非負數');
      }
    }
    
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`JSON 格式錯誤: ${error.message}`);
    }
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`檔案不存在: ${filePath}`);
    }
    throw error;
  }
}

/**
 * 寫入 JSON 檔案
 */
export async function writeJsonFile(filePath: string, data: BillSplittingResult): Promise<void> {
  try {
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');
  } catch (error) {
    throw new Error(`寫入檔案失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 寫入文字格式檔案
 */
export async function writeTextFile(filePath: string, data: BillSplittingResult): Promise<void> {
  try {
    let textContent = '=== 聚餐分帳結果 ===\n\n';
    textContent += `總金額: $${data.totalAmount.toFixed(2)}\n`;
    textContent += `每人應付: $${data.perPersonAmount.toFixed(2)}\n\n`;
    textContent += '支付明細:\n';
    
    if (data.payments.length === 0) {
      textContent += '  無需支付（已平衡）\n';
    } else {
      data.payments.forEach((payment, index) => {
        textContent += `  ${index + 1}. ${payment.from} → ${payment.to}: $${payment.amount.toFixed(2)}\n`;
      });
    }
    
    await fs.writeFile(filePath, textContent, 'utf-8');
  } catch (error) {
    throw new Error(`寫入檔案失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 掃描目錄中的所有 JSON 檔案
 */
export async function scanJsonFiles(dirPath: string): Promise<string[]> {
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(dirPath, file));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`目錄不存在: ${dirPath}`);
    }
    throw new Error(`讀取目錄失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 確保目錄存在
 */
export async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (error) {
    throw new Error(`建立目錄失敗: ${error instanceof Error ? error.message : String(error)}`);
  }
}
