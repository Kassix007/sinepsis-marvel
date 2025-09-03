#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"

curl -X POST "$BASE_URL/events" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "title": "Test Event from script",
    "description": "This is a test event from a script.",
    "start_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "end_time": "'$(date -u -d "+2 hours" +"%Y-%m-%dT%H:%M:%SZ")'"
}'
