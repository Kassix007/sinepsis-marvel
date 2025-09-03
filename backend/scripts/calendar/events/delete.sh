#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
EVENT_ID="your_event_id_here" # Replace with an actual event ID

curl -X DELETE "$BASE_URL/events/$EVENT_ID" \
-H "Authorization: Bearer $TOKEN"
