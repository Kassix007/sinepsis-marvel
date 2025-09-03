#!/bin/bash

curl -X POST http://localhost:8080/api/auth/register \
  -F "name=John Doe" \
  -F "email=john@18.com" \
  -F "password=supersecret" \
  -F "profile_picture=@/home/zakariyya/Pictures/Wallpapers/One.png"
