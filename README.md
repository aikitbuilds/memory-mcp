# Memory Context Protocol Server with Gemini Integration

This server implements a Memory Context Protocol (MCP) system that uses Gemini 2.5 Pro for chat interactions and maintains a memory system using vector similarity search.

## Features

- Chat interface using Gemini 2.5 Pro
- Memory storage and retrieval using vector similarity search
- Automatic context enhancement from relevant memories
- RESTful API endpoints for chat and memory management

## Prerequisites

- Node.js (v14 or higher)
- Supabase account and project
- Google AI Studio API key (for Gemini)
- OpenAI API key (for embeddings)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
OPENAI_API_KEY=your_openai_api_key
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
PORT=3000
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

1. Start the server:
   ```bash
   npm start
   ```

2. For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Chat Endpoints

- `POST /chat`
  - Send a message to the chat
  - Request body: `{ "message": "your message" }`
  - Returns: `{ "response": "gemini response" }`

- `POST /chat/reset`
  - Reset the chat history
  - Returns: `{ "message": "Chat history reset successfully" }`

### Memory Endpoints

- `POST /memory`
  - Save a new memory
  - Request body: `{ "content": "memory content", "metadata": {} }`
  - Returns: Saved memory object

- `GET /memory/search`
  - Search for similar memories
  - Query parameters: `query`, `limit`, `threshold`
  - Returns: Array of similar memories

## Testing

Run tests with:
```bash
npm test
```

## License

MIT 