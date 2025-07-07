import { test, describe, before, after } from "node:test";
import { strict as assert } from "node:assert";
import { BudgetService } from "./budget-service.ts";

describe("BudgetService", () => {
  const service = new BudgetService();

  before(async () => {
    await service.initialize();
  });

  after(async () => {
    await service.reset();
  });

  test("should get categories", async () => {
    const categories = await service.getCategories();
    assert.ok(Array.isArray(categories), "Categories should be an array");
    console.log(`Found ${categories?.length || 0} categories`);
    if (categories?.length > 0) {
      console.log("Sample categories:", categories.slice(0, 3));
    }
  });

  test("should get uncategorized transactions", async () => {
    const transactions = await service.getUncategorizedTransactions();

    assert.ok(Array.isArray(transactions), "Transactions should be an array");
    console.log(
      `Found ${transactions?.length || 0} uncategorized transactions`,
    );
    if (transactions?.length > 0) {
      console.log("Sample transactions:", transactions.slice(0, 3));
    }
  });
});
