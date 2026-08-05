#!/bin/bash

# Configuration
OS_URL="http://opensearch:9200"
OSD_URL="http://opensearch-dashboards:5601"
BACKEND_URL="http://backend:8000"

echo "=========================================="
echo " Starting Log Management Initialization "
echo "=========================================="

# 1. Wait for OpenSearch
echo "Waiting for OpenSearch to be ready..."
until curl -s "$OS_URL" > /dev/null; do
  sleep 5
done
echo "OpenSearch is UP!"

# 2. Wait for OpenSearch Dashboards
echo "Waiting for OpenSearch Dashboards to be ready..."
until curl -s "$OSD_URL/api/status" > /dev/null; do
  sleep 5
done
echo "OpenSearch Dashboards is UP!"

# 3. Wait for Backend API
echo "Waiting for Backend API to be ready..."
# The backend might take an extra 30s as per server.ts, but we just check if it answers
until curl -s "$BACKEND_URL" > /dev/null; do
  sleep 5
done
# Wait an additional 5 seconds to ensure express routes are fully mapped
sleep 5
echo "Backend API is UP!"

# 4. Create OpenSearch Index Template
echo "Creating OpenSearch Index Template for log-*"
curl -s -X PUT "$OS_URL/_index_template/log-template" -H 'Content-Type: application/json' -d'
{
  "index_patterns": ["log-*"],
  "template": {
    "mappings": {
      "properties": {
        "@timestamp": { "type": "date" },
        "tenant": { "type": "keyword" },
        "source": { "type": "keyword" },
        "event_type": { "type": "keyword" },
        "src_ip": { "type": "ip" },
        "dst_ip": { "type": "ip" }
      }
    }
  }
}'
echo -e "\nIndex Template Created."

# 5. Create OpenSearch Dashboards Index Pattern
echo "Creating OpenSearch Dashboards Index Pattern..."
curl -s -X POST "$OSD_URL/api/saved_objects/index-pattern/log-*" \
  -H "osd-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{
    "attributes": {
      "title": "log-*",
      "timeFieldName": "@timestamp"
    }
  }'
echo -e "\nIndex Pattern Created."

echo "Setting Default Index Pattern..."
curl -s -X POST "$OSD_URL/api/opensearch-dashboards/settings" \
  -H "osd-xsrf: true" \
  -H "Content-Type: application/json" \
  -d '{"changes":{"defaultIndex":"log-*"}}'
echo -e "\nDefault Index Pattern Set."

# 6. Seed Data
echo "Seeding Dummy Data..."
cd ingest

# Ensure we wait until backend is truly ready to accept requests (syslog service is up)
echo "Running HTTP Log Simulator..."
npx tsx src/simulate_logs.ts local

echo "Running Syslog Simulator..."
npx tsx src/simulate_syslog.ts local
cd ..

echo "Running Brute-Force Attack Simulator..."
node tests/test_bruteforce.js local

echo "=========================================="
echo " Initialization Complete! "
echo "=========================================="
