#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="7620b092-3034-4703-bcd7-c0a2edf5aaad" # Replace with an actual mission ID

curl -X POST "$BASE_URL/missions/$MISSION_ID/logs" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "note": "This is a test log from a script.",
    "log_date": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'"
}'
