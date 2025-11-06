// Performance Test Script for Video Orchestrator
const http = require('http');

console.log('🔬 Starting Performance Tests...\n');

// Test 1: Health Check with Compression
function testCompression() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 4545,
      path: '/health',
      method: 'GET',
      headers: {
        'Accept-Encoding': 'gzip, deflate'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log('✅ Test 1: Compression Check');
      console.log(`   Status: ${res.statusCode}`);
      console.log(`   Content-Encoding: ${res.headers['content-encoding'] || 'none'}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log(`   Content-Length: ${res.headers['content-length'] || 'chunked'}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`   Response Size: ${data.length} bytes`);
        const compressed = res.headers['content-encoding'] === 'gzip';
        console.log(`   Compressed: ${compressed ? 'YES ✓' : 'NO ✗'}\n`);
        resolve({ compressed, size: data.length });
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ Error: ${error.message}\n`);
      reject(error);
    });

    req.end();
  });
}

// Test 2: Performance Metrics Endpoint
function testPerformanceMetrics() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 4545,
      path: '/performance/metrics',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      console.log('✅ Test 2: Performance Metrics');
      console.log(`   Status: ${res.statusCode}`);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const metrics = JSON.parse(data);
          if (metrics.success && metrics.data) {
            console.log(`   Memory Usage: ${(metrics.data.memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Memory Total: ${(metrics.data.memory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
            console.log(`   Uptime: ${(metrics.data.uptime / 60).toFixed(2)} minutes`);
            console.log(`   Request Count: ${metrics.data.requests.total || 'N/A'}`);
            console.log(`   Avg Response Time: ${metrics.data.requests.averageResponseTime || 'N/A'} ms`);
            console.log(`   Active Connections: ${metrics.data.requests.activeConnections || 'N/A'}`);
          }
          console.log('   ✓ Metrics retrieved successfully\n');
          resolve(metrics);
        } catch (error) {
          console.error(`   ❌ Parse Error: ${error.message}\n`);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      console.error(`   ❌ Error: ${error.message}\n`);
      reject(error);
    });

    req.end();
  });
}

// Test 3: Cache Test
async function testCache() {
  console.log('✅ Test 3: Cache Service');
  try {
    // Import cacheService dynamically
    const { cacheService } = await import('./apps/orchestrator/src/services/cacheService.js');
    
    // Set a test value
    await cacheService.set('performance-test', { 
      data: 'test data',
      timestamp: new Date().toISOString()
    });
    console.log('   ✓ Cache SET successful');
    
    // Get the value
    const cached = await cacheService.get('performance-test');
    if (cached && cached.data === 'test data') {
      console.log('   ✓ Cache GET successful');
      console.log(`   Data: ${JSON.stringify(cached)}`);
    } else {
      console.log('   ✗ Cache GET failed - data mismatch');
    }
    
    console.log('\n');
    return { success: true };
  } catch (error) {
    console.error(`   ❌ Cache Error: ${error.message}\n`);
    return { success: false, error: error.message };
  }
}

// Run all tests
async function runTests() {
  try {
    await testCompression();
    await testPerformanceMetrics();
    await testCache();
    
    console.log('🎉 All performance tests completed!\n');
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

runTests();
