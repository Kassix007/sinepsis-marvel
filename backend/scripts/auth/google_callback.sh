#!/bin/bash

# Replace YOUR_CODE with a valid authorization code from Google
curl -X GET http://localhost:8080/api/auth/google/callback?code=YOUR_CODE
