# Memory MCP Server

A Model Context Protocol (MCP) server that provides persistent memory storage with vector similarity search capabilities.

## Features

- Persistent memory storage using Supabase
- Vector similarity search for semantic memory retrieval
- Secure API key management
- RESTful API endpoints for memory operations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
Create a `.env` file with:
```
# API Keys
OPENAI_API_KEY=your_openai_key
SMITHERY_API_KEY=your_smithery_key

# Environment
NODE_ENV=development
```

3. Start the server:
```bash
npm start
```

## API Endpoints

- `POST /memory` - Save a new memory
- `GET /memory/search` - Search memories using semantic similarity
- `GET /memory` - List all memories
- `DELETE /memory/:id` - Delete a memory

## Project Structure

- `index.js` - Main server file
- `services/supabase-service.js` - Supabase interaction service
- `services/memory-service.js` - Memory operations service
- `utils/vector-utils.js` - Vector operations utilities

## Development

- Node.js
- Express
- Supabase
- OpenAI API
- Vector similarity search

## License

MIT 