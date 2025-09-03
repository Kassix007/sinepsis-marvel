#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"

curl -X POST "$BASE_URL/missions" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "title": "Test Mission from script",
    "description": "This is a test mission from a script.",
    "mission_type": "recon",
    "latitude": 12.345678,
    "longitude": 56.789012,
    "start_time": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "end_time": "'$(date -u -d "+3 days" +"%Y-%m-%dT%H:%M:%SZ")'",
    "threat_level": "medium",
    "success": false
}'

