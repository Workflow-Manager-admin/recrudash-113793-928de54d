# Supabase Integration - HireIQ Lite

This project uses Supabase as the backend for authentication and storage of users, jobs, and applications.

## Auth

- Uses Supabase's email/password authentication.
- User role ("recruiter" or "candidate") is saved in the `profiles` table and is read at login for RBAC.

## Database

- **profiles**: Stores user profile, including role field (`id`, `email`, `role`)
- **jobs**: Stores job postings (`id`, `title`, `description`, `recruiter_id`)
- **applications**: Stores job applications (`id`, `candidate_id`, `job_id`)

## Usage

- `src/supabaseClient.js` sets up the Supabase client.
- All CRUD operations for jobs and applications are powered by Supabase (see code).
- To use in local development, ensure `SUPABASE_URL` / `SUPABASE_KEY` are present and match the project environment.

## Environment

This project expects these env variables or hardcodes in `supabaseClient.js` (production: move to .env):

```
SUPABASE_URL=https://rquvaaymanduddbwktxk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdXZhYXltYW5kdWRkYndrdHhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4MTkwOTcsImV4cCI6MjA2NjM5NTA5N30.iT_cuWebAjeMangmiYSbyutvYab4TlEBZU19QZhR0ss
```
