export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  account: string;
}

export interface Category {
  id: string;
  name: string;
  color?: string;
  groupName?: string;
}

export interface CategorizeRequest {
  transactionId: string;
  categoryId: string;
}

export interface CategorizeTransactionsInput {
  categorizations: CategorizeRequest[];
}

export interface McpRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

export interface McpResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpToolResult {
  content: Array<{
    type: "text";
    text: string;
  }>;
}