# Actual Budget MCP Server

A personal budget MCP (Model Context Protocol) server with HTTP transport for accessing budget information remotely.

## Features

- **Remote HTTP Transport**: Uses streamable HTTP transport for remote access
- **Three Core Tools**:
  - `get_uncategorized_transactions`: Retrieve all uncategorized transactions
  - `get_categories`: Get all defined budget categories
  - `categorize_transactions`: Assign categories to multiple transactions

## Quick Start

### Installation

```bash
npm install
```

### Build

```bash
npm run build
```

### Run

```bash
npm start
```

The server will start on port 8080 by default. You can change this by setting the `PORT` environment variable.

### Development

```bash
npm run dev
```

## API Endpoints

- **MCP Endpoint**: `POST /mcp` - Main MCP protocol endpoint
- **Health Check**: `GET /health` - Server health status
- **Server Info**: `GET /mcp` - Server capabilities and information

## MCP Tools

### get_uncategorized_transactions

Returns all transactions that haven't been assigned to a category.

**Input**: None
**Output**: Array of transaction objects

### get_categories

Returns all available budget categories.

**Input**: None  
**Output**: Array of category objects

### categorize_transactions

Assigns categories to multiple transactions.

**Input**:
```json
{
  "categorizations": [
    {
      "transactionId": "txn_001",
      "categoryId": "cat_001"
    }
  ]
}
```

**Output**: Result object with success status and individual transaction results

## Usage with MCP Clients

### Claude Desktop

Add to your MCP configuration:

```json
{
  "mcpServers": {
    "actual-budget": {
      "command": "npx",
      "args": ["mcp-remote", "http://localhost:8080/mcp"]
    }
  }
}
```

### Direct HTTP Requests

```bash
curl -X POST http://localhost:8080/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_uncategorized_transactions"
    }
  }'
```

## Data Structure

### Transaction
```typescript
interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category?: string;
  account: string;
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  color?: string;
  groupName?: string;
}
```

## Environment Variables

- `PORT`: Server port (default: 8080)

## Development

This server uses stubbed data for development and testing. In a production environment, you would replace the `BudgetService` with actual database connections to your budget application.

## License

MIT