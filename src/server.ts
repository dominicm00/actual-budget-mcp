import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { budgetService } from "./budget-service.ts";

export function createBudgetMcpServer(): McpServer {
  const server = new McpServer({
    name: "actual-budget-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_uncategorized_transactions",
    {
      title: "Get Uncategorized Transactions",
      description:
        "Retrieve all transactions that have not been assigned to a category",
      annotations: {
        readOnlyHint: true,
      },
    },
    async () => {
      const transactions = await budgetService.getUncategorizedTransactions();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(transactions, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_categories",
    {
      title: "Get Budget Categories",
      description: "Retrieve all defined budget categories",
    },
    async () => {
      const categories = await budgetService.getCategories();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(categories, null, 2),
          },
        ],
      };
    },
  );

  server.registerTool(
    "categorize_transactions",
    {
      title: "Categorize Transactions",
      description: "Assign categories to multiple transactions",
      inputSchema: {
        categorizations: z
          .array(
            z.object({
              transactionId: z.string(),
              categoryId: z.string(),
            }),
          )
          .describe("List of transaction-category pairs"),
      },
      outputSchema: {
        failedCategorizations: z
          .array(
            z.object({
              transactionId: z.string(),
              categoryId: z.string(),
            }),
          )
          .describe("List of failed categorizations"),
      },
    },
    async ({ categorizations }) => {
      const result =
        await budgetService.categorizeTransactions(categorizations);
      return {
        structuredContent: result,
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    },
  );

  return server;
}
