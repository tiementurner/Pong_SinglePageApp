#!/bin/bash

# Check if SESSION_MANAGER is set
if [ -z "$SESSION_MANAGER" ]; then
    echo "SESSION_MANAGER is not set"
fi

# Extract the value from SESSION_MANAGER
extracted_value=$(echo $SESSION_MANAGER | sed -n 's/.*\/\([^.]*\)\.codam\.nl.*/\1/p')

if [ -z "$extracted_value" ]; then
    echo "Could not extract value from SESSION_MANAGER"
else
    # Define the new frontend URL
    new_frontend_url="http://$extracted_value:3000"
    export FRONTEND_URL=$new_frontend_url

    new_callback_url="http://$extracted_value:3001/auth/login/callback"
    export CALLBACK_URL=$new_callback_url
fi

export DATABASE_HOST=db
export DATABASE_PORT=5433

echo "Environment variables updated"

npm run build

npm run start
