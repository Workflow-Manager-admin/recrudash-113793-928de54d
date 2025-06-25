#!/bin/bash
set -e

# Run from the directory this script is in (backend_workspace)
cd "$(dirname "$0")"

# Create venv in backend_workspace if it does not exist
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate

# Install requirements (requirements.txt is in backend/)
pip install --upgrade pip
pip install -r backend/requirements.txt
pip install flake8

# Run flake8 on backend/src/
flake8 backend/src/

deactivate
