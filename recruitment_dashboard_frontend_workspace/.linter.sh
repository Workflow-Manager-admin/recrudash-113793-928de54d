#!/bin/bash
cd /home/kavia/workspace/code-generation/recrudash-113793-928de54d/recruitment_dashboard_frontend_workspace/recruitment_dashboard_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

