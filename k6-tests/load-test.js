import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    // Ramp up to 1000 RPS over 2 minutes
    { duration: '2m', target: 1000 },
    // Stay at 1000 RPS for 5 minutes
    { duration: '5m', target: 1000 },
    // Ramp down over 2 minutes
    { duration: '2m', target: 0 },
  ],
  thresholds: {
    // 95% of requests must complete below 500ms
    http_req_duration: ['p(95)<500'],
    // Error rate must be below 1%
    errors: ['rate<0.01'],
    // Success rate must be above 99%
    http_req_failed: ['rate<0.01'],
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3002';

// Test scenarios
const scenarios = [
  // Product catalog search
  {
    name: 'Product Search',
    weight: 0.4,
    endpoint: '/api/products/search',
    method: 'GET',
    params: { q: 'audio', page: 1, limit: 20 },
  },
  // Product details
  {
    name: 'Product Details',
    weight: 0.3,
    endpoint: '/api/products/1',
    method: 'GET',
  },
  // Category listing
  {
    name: 'Category Listing',
    weight: 0.2,
    endpoint: '/api/categories',
    method: 'GET',
  },
  // User authentication
  {
    name: 'User Login',
    weight: 0.1,
    endpoint: '/api/auth/login',
    method: 'POST',
    body: JSON.stringify({
      email: 'test@example.com',
      password: 'password123',
    }),
    headers: { 'Content-Type': 'application/json' },
  },
];

// Helper function to select scenario based on weights
function selectScenario() {
  const random = Math.random();
  let accumulator = 0;
  
  for (const scenario of scenarios) {
    accumulator += scenario.weight;
    if (random < accumulator) {
      return scenario;
    }
  }
  
  return scenarios[0];
}

export default function () {
  const scenario = selectScenario();
  
  let url = `${BASE_URL}${scenario.endpoint}`;
  const params = {
    headers: scenario.headers || {},
    tags: { name: scenario.name },
  };

  let response;
  
  if (scenario.method === 'GET' && scenario.params) {
    const queryString = new URLSearchParams(scenario.params).toString();
    url = `${url}?${queryString}`;
    response = http.get(url, params);
  } else if (scenario.method === 'POST') {
    response = http.post(url, scenario.body, params);
  } else {
    response = http.get(url, params);
  }

  // Check response
  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'response has body': (r) => r.body.length > 0,
  });

  errorRate.add(!success);

  // Think time between requests
  sleep(0.1);
}

// Handle summary export
export function handleSummary(data) {
  return {
    'summary.json': JSON.stringify(data),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const output = [];
  
  output.push('Load Test Results:');
  output.push('==================');
  
  // Request metrics
  if (data.metrics.http_req_duration) {
    const duration = data.metrics.http_req_duration;
    output.push(`${indent}Response Times:`);
    output.push(`${indent}  - p95: ${duration.values['p(95)'].toFixed(2)}ms`);
    output.push(`${indent}  - p99: ${duration.values['p(99)'].toFixed(2)}ms`);
    output.push(`${indent}  - avg: ${duration.values.avg.toFixed(2)}ms`);
  }
  
  // Error rate
  if (data.metrics.errors) {
    const errorRate = data.metrics.errors.values.rate * 100;
    output.push(`${indent}Error Rate: ${errorRate.toFixed(2)}%`);
  }
  
  // Throughput
  if (data.metrics.http_reqs) {
    const rps = data.metrics.http_reqs.values.rate;
    output.push(`${indent}Throughput: ${rps.toFixed(2)} req/s`);
  }
  
  return output.join('\n');
}
