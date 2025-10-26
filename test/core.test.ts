import { expect } from 'chai';
import { splitBill, formatDate, calculateTip } from '../src/core';
import { BillInput } from '../src/types';

describe('Core Functions', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      expect(formatDate('2024-03-21')).to.equal('2024年3月21日');
      expect(formatDate('2024-12-01')).to.equal('2024年12月1日');
    });
  });

  describe('calculateTip', () => {
    it('should calculate tip correctly', () => {
      expect(calculateTip(100, 10)).to.equal(10);
      expect(calculateTip(100, 15)).to.equal(15);
      expect(calculateTip(100, 12.5)).to.equal(12.5);
    });
  });

  describe('splitBill', () => {
    it('should split bill correctly with shared and personal items', () => {
      const input: BillInput = {
        date: '2024-03-21',
        location: '開心小館',
        tipPercentage: 10,
        items: [
          {
            name: '牛排',
            price: 199,
            isShared: true
          },
          {
            name: '橙汁',
            price: 10,
            isShared: false,
            person: 'Alice'
          },
          {
            name: '薯條',
            price: 12,
            isShared: true
          },
          {
            name: '熱檸檬水',
            price: 8,
            isShared: false,
            person: 'Bob'
          },
          {
            name: '熱檸檬水',
            price: 8,
            isShared: false,
            person: 'Charlie'
          }
        ]
      };

      const result = splitBill(input);

      expect(result.date).to.equal('2024年3月21日');
      expect(result.location).to.equal('開心小館');
      expect(result.subTotal).to.equal(237);
      expect(result.tip).to.equal(23.7);
      expect(result.totalAmount).to.equal(260.7);
      expect(result.items).to.have.length(3);
      
      // Check that all amounts add up to total
      const sumOfAmounts = result.items.reduce((sum, item) => sum + item.amount, 0);
      expect(sumOfAmounts).to.be.closeTo(result.totalAmount, 0.1);
    });

    it('should handle only shared items', () => {
      const input: BillInput = {
        date: '2024-03-21',
        location: '餐廳',
        tipPercentage: 10,
        items: [
          {
            name: '主菜',
            price: 100,
            isShared: true
          },
          {
            name: '配菜',
            price: 50,
            isShared: true
          }
        ]
      };

      const result = splitBill(input);
      expect(result.subTotal).to.equal(150);
      expect(result.tip).to.equal(15);
      expect(result.totalAmount).to.equal(165);
      expect(result.items).to.have.length(0); // No personal items, so no people
    });

    it('should handle only personal items', () => {
      const input: BillInput = {
        date: '2024-03-21',
        location: '餐廳',
        tipPercentage: 10,
        items: [
          {
            name: '飲料',
            price: 30,
            isShared: false,
            person: 'Alice'
          },
          {
            name: '甜點',
            price: 20,
            isShared: false,
            person: 'Bob'
          }
        ]
      };

      const result = splitBill(input);
      expect(result.subTotal).to.equal(50);
      expect(result.tip).to.equal(5);
      expect(result.totalAmount).to.equal(55);
      expect(result.items).to.have.length(2);
      
      const aliceItem = result.items.find(item => item.name === 'Alice');
      const bobItem = result.items.find(item => item.name === 'Bob');
      
      expect(aliceItem?.amount).to.be.closeTo(33, 0.1);
      expect(bobItem?.amount).to.be.closeTo(22, 0.1);
    });
  });
});