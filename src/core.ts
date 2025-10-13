/**
 * 聚餐分帳計算核心 (Bill Splitting Computation Core)
 * 處理聚餐分帳的核心計算邏輯
 */

export interface Person {
  name: string;
  paid: number;
}

export interface BillSplittingData {
  people: Person[];
  totalAmount?: number;
}

export interface PaymentRecord {
  from: string;
  to: string;
  amount: number;
}

export interface BillSplittingResult {
  totalAmount: number;
  perPersonAmount: number;
  payments: PaymentRecord[];
}

/**
 * 計算每人應付金額
 */
export function calculatePerPersonAmount(totalAmount: number, numberOfPeople: number): number {
  return Math.round((totalAmount / numberOfPeople) * 100) / 100;
}

/**
 * 計算分帳結果
 */
export function calculateBillSplitting(data: BillSplittingData): BillSplittingResult {
  const { people } = data;
  
  if (!people || people.length === 0) {
    throw new Error('至少需要一個人的資料');
  }

  // 計算總金額
  const totalAmount = data.totalAmount || people.reduce((sum, person) => sum + person.paid, 0);
  
  // 計算每人應付金額
  const perPersonAmount = calculatePerPersonAmount(totalAmount, people.length);
  
  // 計算每個人的餘額（正數表示應收，負數表示應付）
  const balances = people.map(person => ({
    name: person.name,
    balance: Math.round((person.paid - perPersonAmount) * 100) / 100
  }));
  
  // 分離債權人和債務人
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  
  // 計算支付記錄
  const payments: PaymentRecord[] = [];
  let i = 0, j = 0;
  
  while (i < creditors.length && j < debtors.length) {
    const creditor = creditors[i];
    const debtor = debtors[j];
    
    const amount = Math.min(creditor.balance, Math.abs(debtor.balance));
    const roundedAmount = Math.round(amount * 100) / 100;
    
    if (roundedAmount > 0) {
      payments.push({
        from: debtor.name,
        to: creditor.name,
        amount: roundedAmount
      });
    }
    
    creditor.balance = Math.round((creditor.balance - amount) * 100) / 100;
    debtor.balance = Math.round((debtor.balance + amount) * 100) / 100;
    
    if (creditor.balance === 0) i++;
    if (debtor.balance === 0) j++;
  }
  
  return {
    totalAmount,
    perPersonAmount,
    payments
  };
}
