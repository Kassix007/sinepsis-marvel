TOKEN="${JWT_TOKEN}"

curl -X GET http://localhost:8080/api/gamestats \
  -H "Authorization: Bearer $TOKEN"
