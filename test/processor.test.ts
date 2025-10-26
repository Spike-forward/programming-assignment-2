import { expect } from 'chai';
import * as fs from 'fs/promises';
import * as path from 'path';
import { processSingleFile, formatBillAsText } from '../src/processor';
import { BillInput, BillOutput } from '../src/types';

describe('Processor Functions', () => {
  const testDir = path.join(__dirname, 'temp');
  const inputFile = path.join(testDir, 'test-input.json');
  const outputFile = path.join(testDir, 'test-output.json');

  before(async () => {
    // Create test directory
    await fs.mkdir(testDir, { recursive: true });
  });

  after(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('processSingleFile', () => {
    it('should process a valid JSON file successfully', async () => {
      const testInput: BillInput = {
        date: '2024-03-21',
        location: '測試餐廳',
        tipPercentage: 10,
        items: [
          {
            name: '主菜',
            price: 100,
            isShared: true
          },
          {
            name: '飲料',
            price: 20,
            isShared: false,
            person: 'Alice'
          }
        ]
      };

      // Write test input file
      await fs.writeFile(inputFile, JSON.stringify(testInput, null, 2));

      // Process the file
      const result = await processSingleFile(inputFile, outputFile, 'json');

      expect(result.success).to.be.true;
      expect(result.data).to.not.be.undefined;
      expect(result.data?.subTotal).to.equal(120);
      expect(result.data?.tip).to.equal(12);
      expect(result.data?.totalAmount).to.equal(132);

      // Check that output file was created
      const outputExists = await fs.access(outputFile).then(() => true).catch(() => false);
      expect(outputExists).to.be.true;
    });

    it('should handle invalid JSON file', async () => {
      // Write invalid JSON
      await fs.writeFile(inputFile, '{ invalid json }');

      const result = await processSingleFile(inputFile, outputFile, 'json');

      expect(result.success).to.be.false;
      expect(result.error).to.include('JSON 格式錯誤');
    });

    it('should handle non-existent file', async () => {
      const result = await processSingleFile('non-existent.json', outputFile, 'json');

      expect(result.success).to.be.false;
      expect(result.error).to.include('檔案不存在');
    });
  });

  describe('formatBillAsText', () => {
    it('should format bill as text correctly', () => {
      const input: BillInput = {
        date: '2024-03-21',
        location: '測試餐廳',
        tipPercentage: 10,
        items: [
          {
            name: '主菜',
            price: 100,
            isShared: true
          },
          {
            name: '飲料',
            price: 20,
            isShared: false,
            person: 'Alice'
          }
        ]
      };

      const output: BillOutput = {
        date: '2024年3月21日',
        location: '測試餐廳',
        subTotal: 120,
        tip: 12,
        totalAmount: 132,
        items: [
          { name: 'Alice', amount: 66 }
        ]
      };

      const text = formatBillAsText(output, input);

      expect(text).to.include('===== 聚餐分帳結果 =====');
      expect(text).to.include('日期：2024年3月21日');
      expect(text).to.include('地點：測試餐廳');
      expect(text).to.include('均分項目：');
      expect(text).to.include('1. 主菜 ($100.0)');
      expect(text).to.include('非均分項目 - Alice：');
      expect(text).to.include('1. 飲料 ($20.0)');
      expect(text).to.include('小結：$120.0');
      expect(text).to.include('小費：$12.0');
      expect(text).to.include('總金額：$132.0');
      expect(text).to.include('分帳結果：');
      expect(text).to.include('1. Alice 應付：$66.0');
    });
  });
});