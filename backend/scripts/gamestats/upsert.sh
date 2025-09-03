#!/bin/bash

TOKEN="${JWT_TOKEN}"

curl -X POST http://localhost:8080/api/gamestats \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "best_time": "1:24",
    "best_points": "1000000"
  }'
