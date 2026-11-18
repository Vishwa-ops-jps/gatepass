// GatePass Automated End-to-End Verification & Health Test Suite
const http = require('http');

const PORT = process.env.PORT || 5001;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: '127.0.0.1',
      port: url.port || PORT,
      path: url.pathname + url.search,
      headers: {
        'Accept': 'application/json',
        ...headers
      }
    };

    if (body) {
      const payload = typeof body === 'string' ? body : JSON.stringify(body);
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('====================================================');
  console.log('🛡️  GATEPASS AUTOMATED TESTING AGENT - TEST SUITE');
  console.log(`📡 Target Server: ${BASE_URL}`);
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.log(`  ❌ FAIL: ${name}`);
      console.log(`     Error: ${err.message || err.code || String(err)}`);
      failed++;
    }
  }

  // 1. Health & DB Check
  await test('GET /api/health - Backend & DB Status', async () => {
    const res = await request('GET', '/api/health');
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (res.data.status !== 'ok') throw new Error(`Not ok: ${JSON.stringify(res.data)}`);
  });

  // 2. Society Overview endpoint
  await test('GET /api/admin/overview - Security Gate Society Overview', async () => {
    const res = await request('GET', '/api/admin/overview');
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (typeof res.data.totalFlats !== 'number') throw new Error('totalFlats count missing');
  });

  // 3. Residents directory
  await test('GET /api/admin/residents - Flats & Residents Directory', async () => {
    const res = await request('GET', '/api/admin/residents');
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!res.data.success || !Array.isArray(res.data.flats) || res.data.flats.length === 0) {
      throw new Error('Residents array empty');
    }
  });

  // 4. Active visitors
  await test('GET /api/visitors/active - Currently Inside Campus List', async () => {
    const res = await request('GET', '/api/visitors/active');
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!Array.isArray(res.data)) throw new Error('Active visitors should be an array');
  });

  // 5. Historical logbook
  await test('GET /api/visitors/history - Permanent Audit Ledger', async () => {
    const res = await request('GET', '/api/visitors/history');
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!Array.isArray(res.data)) throw new Error('History should be an array');
  });

  // 6. Direct Visitor Entry Creation
  let createdVisitorId = null;
  await test('POST /api/visitors/entry - Direct Guard Photo Entry Log', async () => {
    const payload = {
      name: 'Test Visitor by Automated Agent',
      flat: 'B-402',
      purpose: 'Courier / Post',
      phone: '9876543210',
      vehicle: 'KA-05-TEST-99',
      image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
    };
    const res = await request('POST', '/api/visitors/entry', payload);
    if (res.statusCode !== 200 && res.statusCode !== 201) throw new Error(`Status ${res.statusCode}`);
    if (!res.data.success || !res.data.visitor) throw new Error('Entry was not successful');
    createdVisitorId = res.data.visitor.id;
  });

  // 7. Visitor Checkout
  await test('PUT /api/visitors/:id/checkout - Mark Visitor as Departed', async () => {
    if (!createdVisitorId) throw new Error('No created visitor ID to test checkout');
    const res = await request('PUT', `/api/visitors/${createdVisitorId}/checkout`);
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    if (!res.data.success) throw new Error('Checkout response missing success: true');
  });

  // 8. Excel CSV Export
  await test('GET /api/visitors/export - Excel CSV Download', async () => {
    const res = await request('GET', '/api/visitors/export');
    if (res.statusCode !== 200) throw new Error(`Status ${res.statusCode}`);
    const contentType = res.headers['content-type'] || '';
    if (!contentType.includes('csv') && !contentType.includes('text')) {
      throw new Error(`Unexpected Content-Type: ${contentType}`);
    }
    if (typeof res.data !== 'string' || !res.data.includes('Flat') || !res.data.includes('Purpose')) {
      throw new Error('CSV output does not contain expected columns');
    }
  });

  // 9. Standalone APK Download / Redirect Route
  await test('GET /GatePass.apk - APK Distribution Handler', async () => {
    const res = await request('GET', '/GatePass.apk');
    if (res.statusCode !== 200 && res.statusCode !== 302) {
      throw new Error(`Status ${res.statusCode}`);
    }
  });

  console.log('\n====================================================');
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  if (failed === 0) {
    console.log('🎉 ALL SECURITY DESK TESTS VERIFIED SUCCESSFULLY!');
  } else {
    console.log('⚠️ Some tests failed. Please inspect.');
  }
  console.log('====================================================\n');

  process.exit(failed === 0 ? 0 : 1);
}

runTests().catch(e => {
  console.error('Fatal Test Suite Error:', e);
  process.exit(1);
});
