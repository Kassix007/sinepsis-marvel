#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
EVENT_ID="6cf46e54-b9e3-4b5b-9928-fb7d84972936" # Replace with an actual event ID

curl -X PUT "$BASE_URL/events/$EVENT_ID" \
-H "Authorization: Bearer $TOKEN" \
-H "Content-Type: application/json" \
-d '{
    "title": "Updated Test Event from script",
    "description": "This is an updated test event from a script."
}'

