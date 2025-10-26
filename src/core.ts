import { BillInput, BillOutput, BillItem, PersonalBillItem, PersonItem } from './types';

/* 核心函數 */
export function splitBill(input: BillInput): BillOutput {
  let date = formatDate(input.date);
  let location = input.location;
  let subTotal = calculateSubTotal(input.items); //計算總額calculate subtotal
  let tip = calculateTip(subTotal, input.tipPercentage);
  let totalAmount = subTotal + tip;
  let items = calculateItems(input.items, input.tipPercentage);
  adjustAmount(totalAmount, items);
  return {
    date,
    location,
    subTotal,
    tip,
    totalAmount,
    items,
  };
}

//傳入用餐資訊
export function formatDate(date: string): string {
  // input format: YYYY-MM-DD, e.g. "2024-03-21"
  // output format: YYYY年M月D日, e.g. "2024年3月21日"
  let parts = date.split("-");
  let year = parts[0];
  let month = parseInt(parts[1], 10); // remove leading zero
  let day = parseInt(parts[2], 10); // remove leading zero
  return `${year}年${month}月${day}日`;
}

//傳入收費項目
function calculateSubTotal(items: BillItem[]): number {
  // sum up all the price of the items
  let subtotal = items.reduce((acc, item) => acc + item.price, 0);
  return subtotal;
}

//傳入小費百分比
export function calculateTip(subTotal: number, tipPercentage: number): number {
  const tip = subTotal * (tipPercentage / 100);
  // round to the nearest 0.1
  return Math.round(tip * 10) / 10;
}

function scanPersons(items: BillItem[]): string[] {
  // scan the persons in the items
  return items
    .filter((item): item is PersonalBillItem => item.isShared === false)
    .map((item) => item.person);
}

function calculateItems(
  items: BillItem[],
  tipPercentage: number
): PersonItem[] {
  const names = scanPersons(items); //array of person names
  const persons = names.length; //number of persons
  return names.map((name) => ({
    name,
    amount: calculatePersonAmount({
      items,
      tipPercentage,
      name,
      persons,
    }),
  }));
}

function calculatePersonAmount(input: {
  items: BillItem[];
  tipPercentage: number;
  name: string;
  persons: number;
}): number {
  const { items, tipPercentage, name, persons } = input;
  // for shared items, split the price evenly
  // for personal items, do not split the price
  // return the amount for the person

  // Step 1: Calculate total shared amount
  const sharedTotal = items
    .filter((item) => item.isShared)
    .reduce((sum, item) => sum + item.price, 0);

  // Step 2: Calculate this person's share of shared items (split evenly)
  const sharedPerPerson = sharedTotal / persons;

  // Step 3: Calculate this person's personal items (non-shared assigned to them)
  const personalTotal = items
    .filter((item) => !item.isShared && item.person === name)
    .reduce((sum, item) => sum + item.price, 0);

  // Step 4: Subtotal for this person
  const subtotal = sharedPerPerson + personalTotal;

  // Step 5: Calculate tip on this person's subtotal
  const tip = subtotal * (tipPercentage / 100);

  // Step 6: Total amount (round to 1 decimal place to match test precision)
  const total = Number((subtotal + tip).toFixed(1));

  return total;
}

function adjustAmount(totalAmount: number, items: PersonItem[]): void {
  // Calculate sum of individual amounts
  const sumOfAmounts = items.reduce((sum, item) => sum + item.amount, 0);

  // Calculate discrepancy
  const discrepancy = Number((totalAmount - sumOfAmounts).toFixed(1));
  
  // adjust the personal amount to match the total amount
  if (discrepancy !== 0) {
    // Adjust the first person's amount by the discrepancy
    items[0].amount = Number((items[0].amount + discrepancy).toFixed(1));
  }
}
