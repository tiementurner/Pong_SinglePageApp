#!/bin/bash

# Check if SESSION_MANAGER is set
if [ -z "$SESSION_MANAGER" ]; then
    echo "SESSION_MANAGER is not set"
    npm run build
    serve -s build
    exit 1
fi

# Extract the value from SESSION_MANAGER
extracted_value=$(echo $SESSION_MANAGER | sed -n 's/.*\/\([^.]*\)\.codam\.nl.*/\1/p')

if [ -z "$extracted_value" ]; then
    echo "Could not extract value from SESSION_MANAGER"
else
    # Define the new frontend URL
    new_server_url="http://$extracted_value:3001"
    export REACT_APP_SERVER_URL=$new_server_url

    new_reactapp_url="http://$extracted_value:3000"
    export REACT_APP_URL=$new_reactapp_url
fi

echo "Environment variables updated"

npm run build

npm run start
