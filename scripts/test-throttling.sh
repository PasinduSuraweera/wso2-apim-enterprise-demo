#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

echo "Testing APPLICATION rate limiting (50 req/min)..."
echo "Sending 60 requests to exceed app limit..."
echo "----------------------------------------"

success_count=0
throttled_count=0

# Test rapid requests to hit the 50/min app limit
for i in {1..60}; do
    echo -n "Request $i: "
    
    response=$(curl -s -w "%{http_code}" \
                   -H "Authorization: Bearer $ACCESS_TOKEN" \
                   "$GATEWAY_URL$API_CONTEXT/items" \
                   -k)
    
    http_code="${response: -3}"
    
    if [ "$http_code" == "200" ]; then
        echo "✅ HTTP 200 OK"
        ((success_count++))
    elif [ "$http_code" == "429" ]; then
        echo "🚫 HTTP 429 Too Many Requests - THROTTLED!"
        ((throttled_count++))
    else
        echo "⚠️  HTTP $http_code"
    fi
    
    # Small delay to prevent overwhelming the server
    sleep 0.05
done

echo "----------------------------------------"
echo "Results:"
echo "✅ Successful requests: $success_count"
echo "🚫 Throttled requests: $throttled_count"
echo "Expected: ~50 success, ~10 throttled"