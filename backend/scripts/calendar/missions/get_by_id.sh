#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="7620b092-3034-4703-bcd7-c0a2edf5aaad" # Replace with an actual mission ID
MISSION_ID=$(echo "$MISSION_ID" | tr -d '[:space:]')

curl -X GET "$BASE_URL/missions/$MISSION_ID" \
-H "Authorization: Bearer $TOKEN"
