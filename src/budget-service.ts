import { Transaction, Category, CategorizeRequest } from './types.js';

export class BudgetService {
  private transactions: Transaction[] = [
    {
      id: "txn_001",
      amount: -45.67,
      description: "Coffee Shop",
      date: "2024-01-15",
      account: "Checking"
    },
    {
      id: "txn_002", 
      amount: -123.45,
      description: "Grocery Store",
      date: "2024-01-14",
      account: "Checking"
    },
    {
      id: "txn_003",
      amount: -89.99,
      description: "Gas Station",
      date: "2024-01-13",
      account: "Checking"
    },
    {
      id: "txn_004",
      amount: -25.00,
      description: "Online Subscription",
      date: "2024-01-12",
      account: "Credit Card"
    },
    {
      id: "txn_005",
      amount: -78.50,
      description: "Restaurant",
      date: "2024-01-11",
      account: "Checking"
    }
  ];

  private categories: Category[] = [
    {
      id: "cat_001",
      name: "Food & Dining",
      color: "#FF6B6B",
      groupName: "Spending"
    },
    {
      id: "cat_002",
      name: "Transportation",
      color: "#4ECDC4",
      groupName: "Spending"
    },
    {
      id: "cat_003",
      name: "Groceries",
      color: "#45B7D1",
      groupName: "Spending"
    },
    {
      id: "cat_004",
      name: "Entertainment",
      color: "#96CEB4",
      groupName: "Spending"
    },
    {
      id: "cat_005",
      name: "Utilities",
      color: "#FFEAA7",
      groupName: "Bills"
    },
    {
      id: "cat_006",
      name: "Subscriptions",
      color: "#DDA0DD",
      groupName: "Bills"
    },
    {
      id: "cat_007",
      name: "Income",
      color: "#98D8C8",
      groupName: "Income"
    }
  ];

  getUncategorizedTransactions(): Transaction[] {
    return this.transactions.filter(t => !t.category);
  }

  getCategories(): Category[] {
    return this.categories;
  }

  categorizeTransactions(categorizations: CategorizeRequest[]): { success: boolean; message: string; results: Array<{ transactionId: string; success: boolean; error?: string }> } {
    const results: Array<{ transactionId: string; success: boolean; error?: string }> = [];
    
    for (const categorization of categorizations) {
      const transaction = this.transactions.find(t => t.id === categorization.transactionId);
      const category = this.categories.find(c => c.id === categorization.categoryId);
      
      if (!transaction) {
        results.push({
          transactionId: categorization.transactionId,
          success: false,
          error: "Transaction not found"
        });
        continue;
      }
      
      if (!category) {
        results.push({
          transactionId: categorization.transactionId,
          success: false,
          error: "Category not found"
        });
        continue;
      }
      
      transaction.category = category.name;
      results.push({
        transactionId: categorization.transactionId,
        success: true
      });
    }
    
    const successfulCount = results.filter(r => r.success).length;
    const totalCount = results.length;
    
    return {
      success: successfulCount === totalCount,
      message: `Successfully categorized ${successfulCount} of ${totalCount} transactions`,
      results
    };
  }
}

export const budgetService = new BudgetService();