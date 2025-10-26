/* 輸入 Type */
export type BillInput = {
  date: string;
  location: string;
  tipPercentage: number;
  items: BillItem[];
};

export type BillItem = SharedBillItem | PersonalBillItem;

export type CommonBillItem = {
  price: number;
  name: string;
};

export type SharedBillItem = CommonBillItem & {
  isShared: true;
};

export type PersonalBillItem = CommonBillItem & {
  isShared: false;
  person: string;
};

/* 輸出 Type */
export type BillOutput = {
  date: string;
  location: string;
  subTotal: number;
  tip: number;
  totalAmount: number;
  items: PersonItem[];
};

export type PersonItem = {
  name: string;
  amount: number;
};

/* CLI 參數類型 */
export type CliArgs = {
  input: string;
  output: string;
  format?: 'json' | 'text';
};

/* 檔案處理結果類型 */
export type ProcessResult = {
  success: boolean;
  message: string;
  data?: BillOutput;
  error?: string;
};

/* 批次處理結果類型 */
export type BatchProcessResult = {
  success: boolean;
  processedFiles: number;
  errors: string[];
  results: ProcessResult[];
};
