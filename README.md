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

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Edit `.env` with your Actual Budget credentials:
```env
ACTUAL_URL=https://your-actual-server.com
ACTUAL_PASSWORD=your-server-password
BUDGET_ID=your-budget-id
BUDGET_PASSWORD=your-budget-password
PORT=8080
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

### Testing

```bash
npm test
```

## API Endpoints

- **MCP Endpoint**: `POST /mcp` - Main MCP protocol endpoint
- **Health Check**: `GET /health` - Server health status

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

### UncategorizedTransaction
```typescript
interface UncategorizedTransaction {
  id: string;
  payeeName: string;
  notes: string;
  amount: number; // In cents, negative = expense, positive = deposit
}
```

### Category
```typescript
interface Category {
  id: string;
  name: string;
  groupName: string;
}
```

### Categorization
```typescript
interface Categorization {
  transactionId: string;
  categoryId: string;
}
```

## Environment Variables

- `ACTUAL_URL`: Your Actual Budget server URL
- `ACTUAL_PASSWORD`: Password for your Actual Budget server
- `BUDGET_ID`: ID of the specific budget to access
- `BUDGET_PASSWORD`: Password for the specific budget
- `PORT`: Server port (default: 8080)
