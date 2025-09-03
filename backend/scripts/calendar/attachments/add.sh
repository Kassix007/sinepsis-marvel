#!/bin/bash

# Set the JWT_TOKEN environment variable before running this script:
# export JWT_TOKEN="your_auth_token_here"
TOKEN="${JWT_TOKEN}"
BASE_URL="http://localhost:8080/api/calendar"
MISSION_ID="8f0e9173-22fc-4ac5-b51a-d15ff41f021a" # Replace with an actual mission ID
FILE_PATH="/Users/jenivenmooneesawmy/Downloads/login.png" # Replace with the path to your file

curl -X POST "$BASE_URL/missions/$MISSION_ID/attachments" \
-H "Authorization: Bearer $TOKEN" \
-F "attachment=@$FILE_PATH"