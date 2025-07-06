import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { budgetService } from "./budget-service.js";

export function createBudgetMcpServer(): McpServer {
  const server = new McpServer({
    name: "actual-budget-mcp",
    version: "1.0.0",
  });

  server.registerTool(
    "get_uncategorized_transactions",
    {
      title: "Get Uncategorized Transactions",
      description: "Retrieve all transactions that have not been assigned to a category",
      inputSchema: {}
    },
    async () => {
      const transactions = budgetService.getUncategorizedTransactions();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(transactions, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "get_categories",
    {
      title: "Get Budget Categories",
      description: "Retrieve all defined budget categories",
      inputSchema: {}
    },
    async () => {
      const categories = budgetService.getCategories();
      return {
        content: [{
          type: "text",
          text: JSON.stringify(categories, null, 2)
        }]
      };
    }
  );

  server.registerTool(
    "categorize_transactions",
    {
      title: "Categorize Transactions",
      description: "Assign categories to multiple transactions",
      inputSchema: {
        categorizations: z.array(z.object({
          transactionId: z.string(),
          categoryId: z.string()
        }))
      }
    },
    async ({ categorizations }) => {
      const result = budgetService.categorizeTransactions(categorizations);
      return {
        content: [{
          type: "text",
          text: JSON.stringify(result, null, 2)
        }]
      };
    }
  );

  return server;
}