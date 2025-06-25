# HireIQ Lite Backend

## Environment Setup Instructions

This backend uses Python, FastAPI, and requires environment variables for Supabase (see `.env` example).

### 1. Create and Activate a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Python Requirements

```bash
pip install -r requirements.txt
```

### 3. Linting & Quality Checks

Ensure `flake8` is installed in your virtual environment:

```bash
which flake8
# or just rely on:
flake8
```

You can install it explicitly if missing:

```bash
pip install flake8
```

### 4. Local Run

Start the backend on your local development machine:

```bash
uvicorn src.api.main:app --reload
```

### 5. Environment Variables

See `.env` file in this folder for Supabase connection setup.

---

**Troubleshooting:**  
If you see errors like `venv/bin/activate: No such file or directory` or `flake8: command not found`, run the above setup steps to correct your environment.
