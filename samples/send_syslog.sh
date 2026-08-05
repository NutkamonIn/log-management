#!/bin/bash

TARGET_HOST="log.demo-labs.site"
TARGET_PORT="5141" # 5141 for demoA, 5142 for demoB

echo "Sending syslogs from sample_syslog.txt to $TARGET_HOST:$TARGET_PORT (UDP)"

while IFS= read -r line; do
  if [ -n "$line" ]; then
    echo -n "$line" | nc -u -w0 $TARGET_HOST $TARGET_PORT
    echo "Sent: $line"
    sleep 0.5
  fi
done < "sample_syslog.txt"

echo "Done!"
