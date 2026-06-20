# Pop Choice
Solution for scrimba's AI eng path assignment.

**AI-powered group movie recommendation engine** - collects multiple users' movie preferences and uses an LLM to synthesize a single search query, then finds the best matching movie via vector similarity search.

## How It Works

1. **Input** - Each user answers preference questions (mood, genre, tone, etc.)
2. **Synthesize** - An LLM (via OpenRouter) analyzes all answers and generates a single unified search query that balances conflicting preferences
3. **Embed** - The query is converted to a vector embedding using embedding model set in env variables
4. **Search** - A pgvector nearest-neighbor search against a Supabase movie database returns the top matches

## Tech Stack

- **Runtime:** Node.js
- **AI:** OpenAI SDK via OpenRouter (configurable base URL/model)
- **Vector DB:** Supabase (PostgreSQL + pgvector)
- **Text Splitting:** LangChain `RecursiveCharacterTextSplitter`

## Setup

```bash
npm install
cp example.env .env
```

Fill in the required environment variables in `.env`:

| Variable | Description |
|---|---|
| `OPENAI_API_KEY` | API key for OpenRouter (or any OpenAI-compatible provider) |
| `OPENAI_CHAT_COMPLETIONS_MODEL` | Model for query generation (e.g. `openrouter/free`) |
| `OPENAI_EMBEDDINGS_MODEL` | Model for embeddings (e.g. `text-embedding-ada-002`) |
| `OPENAI_BASE_URL` | Base URL for the API (e.g. `https://openrouter.ai/api/v1`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_API_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Supabase service_role key (used for DB init) |

### Database Prerequisites

Your Supabase project needs:

- A `movies` table with `content` (text) and `embedding` (vector) columns
- A `match_movies(query_embedding, match_threshold, match_count)` RPC function returning matching rows sorted by cosine distance

### Initialize the Database

Seeds the `movies` table with chunked and embedded movie data from `movies.txt`:

```bash
node --env.file=.env db-init.js
```

## Usage

```bash
node --env.file=.env index.js
```

Outputs the top matching movie descriptions to stdout.

### Example

`data.js` contains two users (Osaka and Chiyo from *Azumanga Daioh*) with contrasting tastes, the LLM must balance preferences for "dreamy/weird" vs. "wholesome/classic" to find the best group match.

## Project Structure

```
scrimba-pop-choice/
├── index.js          # Main orchestration: query synthesis, embedding, search
├── db-init.js        # Database seeding: chunk movies, generate embeddings, insert
├── data.js           # User preference data
├── movies.txt        # Raw movie dataset
├── example.env       # Environment variable template
├── package.json      # Project metadata and dependencies
└── .env              # Environment variables (gitignored)
```
