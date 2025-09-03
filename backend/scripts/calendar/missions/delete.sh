#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="fee8c938-d24b-4677-bbc3-72752f23e6e0" # Replace with an actual mission ID

curl -X DELETE "$BASE_URL/missions/$MISSION_ID" \
-H "Authorization: Bearer $TOKEN"
