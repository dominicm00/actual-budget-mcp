import api from "@actual-app/api";
import fs from "node:fs/promises";

type UncategorizedTransaction = {
  id: string;

  /**
   * Payee
   */
  importedPayee: string;
  notes: string;
  amount: number;
};

type Category = {
  id: string;
  name: string;
  groupName: string;

  /**
   * Whether or not transactions within this category are
   * displayed as income or expenses
   */
  isIncome: boolean;
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
      api.q("categories").select(["id", "name", "group.name", "is_income"]),
    )) as {
      data: {
        id: string;
        name: string;
        "group.name": string;
        is_income: boolean;
      }[];
    };

    return result.data.map((category) => ({
      id: category.id,
      name: category.name,
      groupName: category["group.name"],
      isIncome: category.is_income,
    }));
  }

  async getUncategorizedTransactions(): Promise<UncategorizedTransaction[]> {
    // Fetch remote updates
    await api.sync();

    const result = (await api.aqlQuery(
      api
        .q("transactions")
        .filter({ category: null })
        .select(["id", "imported_payee", "notes", "amount"]),
    )) as { data: UncategorizedTransaction[] };
    return result.data;
  }
}

export const budgetService = new BudgetService();
