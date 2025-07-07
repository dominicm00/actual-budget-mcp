# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development & Testing
- `npm start` - Start the MCP server using Node's native TypeScript support
- `npm run dev` - Start in development mode with file watching
- `npm test` - Run tests using Node's native test runner
- `npm run test -- --watch` - Run tests in watch mode

### Single Test Execution
- `node --test test/budget-service.test.ts` - Run specific test file

## Architecture Overview

This is a **Model Context Protocol (MCP) server** that provides remote access to Actual Budget data via Streamable HTTP transport. The architecture follows a three-layer pattern:

### Core Components

1. **MCP Server Layer** (`src/server.ts`)
   - Implements the MCP protocol using `@modelcontextprotocol/sdk`
   - Registers three tools: `get_uncategorized_transactions`, `get_categories`, `categorize_transactions`
   - Uses Zod schemas for input/output validation
   - Returns structured content and text representations

2. **HTTP Transport Layer** (`src/index.ts`)
   - Express.js server with CORS configuration
   - Implements `StreamableHTTPServerTransport` for MCP over HTTP
   - Session management with UUID-based session IDs
   - Handles POST (client-to-server), GET (SSE notifications), DELETE (session termination)

3. **Budget Service Layer** (`src/budget-service.ts`)
   - Integrates with `@actual-app/api` for budget data access
   - Manages local data caching in `/tmp/actual-mcp-data`
   - Implements AQL queries for categories and uncategorized transactions
   - Handles batch transaction updates with error handling

### Key Technical Decisions

- **Native TypeScript**: Uses Node.js native type stripping functionality, no build step required (no flag needed as of Node v24)
- **Session Management**: Each MCP client gets a unique session with persistent transport
- **Error Handling**: Comprehensive error handling with JSON-RPC 2.0 error responses
- **Data Sync**: Calls `api.sync()` before get operations to ensure fresh data

### Environment Configuration

Required environment variables (see `.env.example`):
- `ACTUAL_URL` - Your Actual Budget server URL
- `ACTUAL_PASSWORD` - Server password
- `BUDGET_ID` - Specific budget ID to access
- `BUDGET_PASSWORD` - Budget-specific password
- `PORT` - Server port (default: 8080)

### Testing Strategy

- Uses Node's native test runner with `describe`/`test` pattern
- Tests are written in TypeScript and run directly without compilation
- Focus on integration testing of the BudgetService layer
- Environment-dependent tests require actual Actual Budget credentials

### MCP Protocol Implementation

The server implements the MCP specification with:
- Tool registration with input/output schemas
- Session-based HTTP transport with SSE support
- Proper JSON-RPC 2.0 error handling
- CORS configuration for web client access

### Data Flow

1. Client connects via HTTP POST to `/mcp`
2. Session established with UUID, transport stored
3. MCP tools called through JSON-RPC protocol
4. BudgetService queries Actual Budget API
5. Results returned as both structured content and JSON text
6. Session persists for subsequent requests via `mcp-session-id` header
