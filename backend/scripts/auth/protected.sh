#!/bin/bash

curl -s -X GET http://localhost:8080/api/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJleHAiOjE3NTY0OTc2MDIsInVzZXJfaWQiOiJiZGYzNDc1Mi0yMTAwLTRjMzYtYWE2ZC1kYjk1M2Y5MWVhMTgifQ.BmTrG7eg_xoRPV8FIje7ANZKn2VNbwqwIkPzJQqzzz"
