#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="7620b092-3034-4703-bcd7-c0a2edf5aaad" # Replace with an actual mission ID

curl -X PUT "$BASE_URL/missions/$MISSION_ID" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "title": "Updated Test Mission from script",
    "description": "This is an updated test mission from a script.",
    "mission_type": "recon",
    "latitude": 12.345678,
    "longitude": 56.789012,
    "start_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "end_time": "'$(date -u -d "+3 days" +"%Y-%m-%dT%H:%M:%SZ")'",
    "threat_level": "medium",
    "success": false
}'
