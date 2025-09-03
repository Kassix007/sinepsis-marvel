#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api"
NOTIFICATION_ID="your_notification_id_here" # Replace with an actual notification ID

curl -X POST "$BASE_URL/notifications/$NOTIFICATION_ID/read" \
-H "Authorization: Bearer $TOKEN"
