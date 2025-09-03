#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="your_mission_id_here" # Replace with an actual mission ID
ATTACHMENT_ID="your_attachment_id_here" # Replace with an actual attachment ID

curl -X DELETE "$BASE_URL/missions/$MISSION_ID/attachments/$ATTACHMENT_ID" \
-H "Authorization: Bearer $TOKEN"
