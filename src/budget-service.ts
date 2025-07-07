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
  }

  async reset() {
    await fs.rm("/tmp/actual-mcp-data", { recursive: true });
  }

  async getCategories(): Promise<Category[]> {
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

  async getUncategorizedTransactions(): Promise<UncategorizedTransaction[]> {
    // Fetch remote updates
    await api.sync();

    const result = (await api.aqlQuery(
      api
        .q("transactions")
        .filter({ category: null })
        .select(["id", "payee.name", "notes", "amount"]),
    )) as UncategorizedTransactionApiResponse;

    console.log(`Fetched ${result.data.length} uncategorized transactions`);

    return result.data.map((transaction) => ({
      id: transaction.id,
      payeeName: transaction["payee.name"],
      notes: transaction.notes,
      amount: transaction.amount,
    }));
  }

  async categorizeTransactions(categorizations: Categorization[]): Promise<{
    failedCategorizations: Categorization[];
  }> {
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
