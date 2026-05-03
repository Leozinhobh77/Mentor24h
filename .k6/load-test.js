import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');
const requestCount = new Counter('requests');
const activeUsers = new Gauge('active_users');

const BASE_URL = __ENV.BASE_URL || 'https://mentor24h.vercel.app';
const AUTH_TOKEN = __ENV.AUTH_TOKEN || 'mock-token';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // ramp up to 50 users
    { duration: '1m30s', target: 100 }, // ramp up to 100 users
    { duration: '2m', target: 100 },    // stay at 100
    { duration: '30s', target: 0 },     // ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],
    'errors': ['rate<0.1'],
  },
};

export default function () {
  // Simulate authenticated user
  const authHeader = {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json',
  };

  // Test 1: GET Categories
  {
    const res = http.get(`${BASE_URL}/api/categories`, { headers: authHeader });
    check(res, {
      'categories: 200 status': (r) => r.status === 200,
      'categories: has data': (r) => r.json().length > 0,
    }) || errorRate.add(1);

    responseTime.add(res.timings.duration, { endpoint: '/api/categories' });
    requestCount.add(1);
  }

  sleep(0.5);

  // Test 2: POST Toggle Category
  {
    const payload = {
      categoryId: '00000000-0000-0000-0000-000000000001',
    };

    const res = http.post(`${BASE_URL}/api/user/categories/toggle`, JSON.stringify(payload), {
      headers: authHeader,
    });

    check(res, {
      'toggle: 200 status': (r) => r.status === 200 || r.status === 201,
    }) || errorRate.add(1);

    responseTime.add(res.timings.duration, { endpoint: '/api/user/categories/toggle' });
    requestCount.add(1);
  }

  sleep(0.5);

  // Test 3: GET Audios
  {
    const res = http.get(`${BASE_URL}/api/audios?limit=20`, { headers: authHeader });

    check(res, {
      'audios: 200 status': (r) => r.status === 200,
      'audios: array response': (r) => Array.isArray(r.json()),
    }) || errorRate.add(1);

    responseTime.add(res.timings.duration, { endpoint: '/api/audios' });
    requestCount.add(1);
  }

  sleep(0.5);

  // Test 4: GET Routines Status
  {
    const res = http.get(`${BASE_URL}/api/routines/status`, { headers: authHeader });

    check(res, {
      'routines: 200 status': (r) => r.status === 200,
      'routines: has data': (r) => r.json().length > 0,
    }) || errorRate.add(1);

    responseTime.add(res.timings.duration, { endpoint: '/api/routines/status' });
    requestCount.add(1);
  }

  sleep(0.5);

  // Test 5: GET Messages
  {
    const res = http.get(`${BASE_URL}/api/messages?limit=50`, { headers: authHeader });

    check(res, {
      'messages: 200 status': (r) => r.status === 200,
      'messages: array response': (r) => Array.isArray(r.json()),
    }) || errorRate.add(1);

    responseTime.add(res.timings.duration, { endpoint: '/api/messages' });
    requestCount.add(1);
  }

  sleep(1);

  activeUsers.add(1);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';

  let summary = '\n=== Load Test Summary ===\n';

  if (data.metrics) {
    summary += `\nEndpoints Tested:\n`;
    summary += `  ✓ GET /api/categories\n`;
    summary += `  ✓ POST /api/user/categories/toggle\n`;
    summary += `  ✓ GET /api/audios\n`;
    summary += `  ✓ GET /api/routines/status\n`;
    summary += `  ✓ GET /api/messages\n`;

    summary += `\nMetrics:\n`;

    const http_reqs = data.metrics.http_reqs;
    if (http_reqs) {
      summary += `  HTTP Requests: ${http_reqs.value}\n`;
    }

    const errors = data.metrics.errors;
    if (errors) {
      summary += `  Errors: ${errors.value}\n`;
    }

    const response_time = data.metrics.response_time;
    if (response_time) {
      summary += `  Response Time (avg): ${response_time.stats.mean?.toFixed(2)}ms\n`;
      summary += `  Response Time (p95): ${response_time.stats.p(95)?.toFixed(2)}ms\n`;
      summary += `  Response Time (p99): ${response_time.stats.p(99)?.toFixed(2)}ms\n`;
    }
  }

  summary += `\n✅ Load test completed\n`;

  return summary;
}
