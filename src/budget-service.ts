import api from "@actual-app/api";
import fs from "node:fs/promises";

type UncategorizedTransaction = {
  id: string;
  payeeName: string;
  notes: string;

  /**
   * Transaction amount in cents. Negative indicates an expense, positive indicates a deposit.
   */
  amount: number;
};

type Category = {
  id: string;
  name: string;
  groupName: string;
};

type Categorization = {
  transactionId: string;
  categoryId: string;
};

type CategoryApiResponse = {
  data: {
    id: string;
    name: string;
    "group.name": string;
  }[];
};

type UncategorizedTransactionApiResponse = {
  data: {
    id: string;
    "payee.name": string;
    imported_payee: string;
    notes: string;
    amount: number;
  }[];
};

export class BudgetService {
  private initialized = false;

  async initialize() {
    await fs.mkdir("/tmp/actual-mcp-data", { recursive: true });

    await api.init({
      // Budget data will be cached locally here, in subdirectories for each file.
      dataDir: "/tmp/actual-mcp-data",
      // This is the URL of your running server
      serverURL: process.env.ACTUAL_URL,
      // This is the password you use to log into the server
      password: process.env.ACTUAL_PASSWORD,
    });

    await api.downloadBudget(process.env.BUDGET_ID, {
      password: process.env.BUDGET_PASSWORD,
    });

    this.initialized = true;
  }

  private async ensureCacheExists(): Promise<void> {
    try {
      await fs.access("/tmp/actual-mcp-data");
    } catch {
      console.log("Cache directory missing, reinitializing...");
      this.initialized = false;
      await this.initialize();
    }
  }

  async reset() {
    await fs.rm("/tmp/actual-mcp-data", { recursive: true });
    this.initialized = false;
  }

  async getCategories(): Promise<Category[]> {
    await this.ensureCacheExists();
    
    // Fetch remote updates
    await api.sync();

    const result = (await api.aqlQuery(
      api.q("categories").select(["id", "name", "group.name"]),
    )) as CategoryApiResponse;

    console.log(`Fetched ${result.data.length} categories`);

    return result.data.map((category) => ({
      id: category.id,
      name: category.name,
      groupName: category["group.name"],
    }));
  }

  async getUncategorizedTransactions(limit: number = 100, offset: number = 0): Promise<{
    transactions: UncategorizedTransaction[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    await this.ensureCacheExists();
    
    // Fetch remote updates
    await api.sync();

    // First, get the total count
    const countResult = (await api.aqlQuery(
      api
        .q("transactions")
        .filter({ category: null })
        .calculate({ $count: "id" }),
    )) as { data: number };

    const total = countResult.data;

    // Then get the paginated results
    const result = (await api.aqlQuery(
      api
        .q("transactions")
        .filter({ category: null })
        .select(["id", "payee.name", "notes", "amount"])
        .limit(limit)
        .offset(offset),
    )) as UncategorizedTransactionApiResponse;

    console.log(`Fetched ${result.data.length} of ${total} uncategorized transactions (limit: ${limit}, offset: ${offset})`);

    const transactions = result.data.map((transaction) => ({
      id: transaction.id,
      payeeName: transaction["payee.name"],
      notes: transaction.notes,
      amount: transaction.amount,
    }));

    return {
      transactions,
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    };
  }

  async categorizeTransactions(categorizations: Categorization[]): Promise<{
    failedCategorizations: Categorization[];
  }> {
    await this.ensureCacheExists();
    
    const failedCategorizations: Categorization[] = [];

    await api.batchBudgetUpdates(async () => {
      const results = await Promise.allSettled(
        categorizations.map(({ transactionId, categoryId }) =>
          api.updateTransaction(transactionId, { category: categoryId }),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === "rejected") {
          failedCategorizations.push(categorizations[index]);
        }
      });
    });

    console.log(
      `Updated ${categorizations.length - failedCategorizations.length} transactions successfully, ${failedCategorizations.length} failed`,
    );

    return {
      failedCategorizations,
    };
  }
}

export const budgetService = new BudgetService();
await budgetService.initialize();
