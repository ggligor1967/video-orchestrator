#!/bin/bash

# Test script for new features
# Run this after starting the backend server

API_URL="http://127.0.0.1:4545"

echo "🧪 Testing New Features Endpoints"
echo "=================================="
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Check..."
curl -s "$API_URL/health" | jq .
echo ""

# Test 2: Virality Score
echo "2️⃣ Testing Virality Score..."
curl -s -X POST "$API_URL/ai/virality-score" \
  -H "Content-Type: application/json" \
  -d '{
    "script": "You won'\''t believe what happened in this haunted house last night. A family moved in, unaware of its dark history. Strange noises echoed through the halls.",
    "genre": "horror",
    "duration": 60,
    "hasVideo": true,
    "hasAudio": true,
    "hasSubtitles": true
  }' | jq .
echo ""

# Test 3: Batch Processing (Create)
echo "3️⃣ Testing Batch Processing - Create..."
BATCH_RESPONSE=$(curl -s -X POST "$API_URL/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "videos": [
      {
        "script": "First horror story about a haunted house",
        "genre": "horror",
        "preset": "tiktok"
      },
      {
        "script": "Second mystery story about a missing person",
        "genre": "mystery",
        "preset": "youtube"
      }
    ],
    "config": {
      "maxConcurrent": 2,
      "stopOnError": false
    }
  }')

echo "$BATCH_RESPONSE" | jq .
BATCH_ID=$(echo "$BATCH_RESPONSE" | jq -r '.data.batchId')
echo "Batch ID: $BATCH_ID"
echo ""

# Test 4: Batch Processing (Status)
echo "4️⃣ Testing Batch Processing - Status..."
if [ "$BATCH_ID" != "null" ]; then
  sleep 2
  curl -s "$API_URL/batch/$BATCH_ID" | jq .
else
  echo "Skipping - no batch ID available"
fi
echo ""

# Test 5: Batch Processing (List All)
echo "5️⃣ Testing Batch Processing - List All..."
curl -s "$API_URL/batch" | jq .
echo ""

# Test 6: Social Media Scheduler (Schedule)
echo "6️⃣ Testing Social Media Scheduler - Schedule..."
FUTURE_DATE=$(date -u -d "+1 day" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null)

SCHEDULE_RESPONSE=$(curl -s -X POST "$API_URL/scheduler" \
  -H "Content-Type: application/json" \
  -d "{
    \"videoPath\": \"/data/exports/test-video.mp4\",
    \"platforms\": [\"tiktok\", \"youtube\"],
    \"scheduledTime\": \"$FUTURE_DATE\",
    \"caption\": \"Check out this amazing story!\",
    \"hashtags\": [\"#horror\", \"#scary\", \"#viral\"]
  }")

echo "$SCHEDULE_RESPONSE" | jq .
POST_ID=$(echo "$SCHEDULE_RESPONSE" | jq -r '.data.postId // empty')
echo "Post ID: $POST_ID"
echo ""

# Test 7: Social Media Scheduler (Upcoming)
echo "7️⃣ Testing Social Media Scheduler - Upcoming..."
curl -s "$API_URL/scheduler/upcoming?limit=5" | jq .
echo ""

# Test 8: Social Media Scheduler (List All)
echo "8️⃣ Testing Social Media Scheduler - List All..."
curl -s "$API_URL/scheduler" | jq .
echo ""

# Test 9: Root endpoint (check new endpoints listed)
echo "9️⃣ Testing Root Endpoint..."
curl -s "$API_URL/" | jq .endpoints
echo ""

echo "✅ All tests completed!"
echo ""
echo "📝 Summary:"
echo "  - Virality Score: AI-powered prediction ✓"
echo "  - Batch Processing: Multi-video processing ✓"
echo "  - Social Scheduler: Post scheduling ✓"
echo "  - Auto-Reframe: Requires video file for full test"
echo ""
echo "🚀 For full integration test, run: pnpm test:integration"
