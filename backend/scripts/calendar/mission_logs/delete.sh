#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="7620b092-3034-4703-bcd7-c0a2edf5aaad" # Replace with an actual mission ID
LOG_ID="7fa075f9-592e-4f68-8a3e-423c2175150c"       # Replace with an actual log ID

curl -X DELETE "$BASE_URL/missions/$MISSION_ID/logs/$LOG_ID" \
-H "Authorization: Bearer $TOKEN"
