#!/bin/bash

# Load test runner script for k6

echo "🚀 Starting k6 load test..."

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo "❌ k6 is not installed. Please install k6 first."
    echo "Visit https://k6.io/docs/getting-started/installation/ for installation instructions."
    exit 1
fi

# Set default base URL if not provided
BASE_URL=${BASE_URL:-"http://localhost:3002"}

# Create results directory
mkdir -p k6-tests/results

# Run the load test
echo "📊 Running load test against $BASE_URL"
k6 run \
    --env BASE_URL=$BASE_URL \
    --out json=k6-tests/results/metrics.json \
    --summary-export=k6-tests/results/summary.json \
    k6-tests/load-test.js

# Check if test passed
if [ $? -eq 0 ]; then
    echo "✅ Load test completed successfully!"
    echo "📈 Results saved to k6-tests/results/"
    
    # Display summary
    if [ -f k6-tests/results/summary.json ]; then
        echo ""
        echo "📊 Test Summary:"
        echo "================"
        cat k6-tests/results/summary.json | jq '.metrics.http_req_duration["p(95)"]' | xargs echo "p95 latency (ms):"
        cat k6-tests/results/summary.json | jq '.metrics.http_req_duration["p(99)"]' | xargs echo "p99 latency (ms):"
        cat k6-tests/results/summary.json | jq '.metrics.http_reqs.values.rate' | xargs echo "Requests per second:"
        cat k6-tests/results/summary.json | jq '.metrics.http_req_failed.values.rate' | xargs echo "Error rate:"
    fi
else
    echo "❌ Load test failed!"
    exit 1
fi
