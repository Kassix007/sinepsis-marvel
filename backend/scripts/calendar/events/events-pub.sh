BASE_URL="http://localhost:8080/api/calendar"

TOKEN="${JWT_TOKEN}"

curl -X GET "$BASE_URL/events-all" \
-H "Authorization: Bearer $TOKEN"
