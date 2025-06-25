# Supabase Integration - HireIQ Lite Backend

This backend service (FastAPI) uses Supabase as its database and authentication provider. The configuration is handled via environment variables stored in `.env`.

## Required Environment Variables

- `SUPABASE_URL`: Your Supabase Project URL (e.g. https://YOURPROJECT.supabase.co)
- `SUPABASE_KEY`: Your Supabase API Key (Service Role or anon/public key)
- `SUPABASE_DB_URL`: (Optional for direct DB connection) The Postgres connection URI for the Supabase project

## Where to Configure

These variables should be placed in `backend/.env`:

```
SUPABASE_URL=<your-supabase-project-url>
SUPABASE_KEY=<your-supabase-key>
SUPABASE_DB_URL=<your-postgres-connection-uri>
```

## Loading in Code

Environment variables are loaded at backend startup using `python-dotenv`. To access them in code, use:

```python
import os

supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
supabase_db_url = os.getenv("SUPABASE_DB_URL")
```

## Usage Notes

- These variables should **never** be hardcoded in the source code for security reasons.
- The `.env` file should be gitignored.
- Future Supabase client connections should use these env variables.

----
Task: Connect backend FastAPI container to Supabase.
