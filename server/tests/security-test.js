import { executePythonSandbox } from '../src/services/dockerRunner.js';

console.log('====================================================');
console.log('🧪 Starting Cloud Code Execution Security & Sandbox Test');
console.log('====================================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  // Test 1: Standard Hello World
  try {
    console.log('[Test 1] Standard execution & stdout test...');
    const res = await executePythonSandbox({
      code: 'print("SANDBOX_ONLINE_HELLO_WORLD")',
      timeoutMs: 4000
    });
    if (res.status === 'success' && res.stdout.includes('SANDBOX_ONLINE_HELLO_WORLD')) {
      console.log(`✅ Passed in ${res.executionTimeMs}ms`);
      passed++;
    } else {
      console.error('❌ Failed:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Error in Test 1:', err);
    failed++;
  }

  // Test 2: Standard Input (stdin)
  try {
    console.log('\n[Test 2] Testing stdin input stream...');
    const res = await executePythonSandbox({
      code: 'val = input()\nprint(f"Processed: {val.upper()}")',
      stdin: 'antigravity',
      timeoutMs: 4000
    });
    if (res.status === 'success' && res.stdout.includes('Processed: ANTIGRAVITY')) {
      console.log(`✅ Passed in ${res.executionTimeMs}ms`);
      passed++;
    } else {
      console.error('❌ Failed:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Error in Test 2:', err);
    failed++;
  }

  // Test 3: Infinite Loop & Timeout Kill Switch
  try {
    console.log('\n[Test 3] Testing Infinite Loop / Denial-of-Service timeout...');
    const res = await executePythonSandbox({
      code: 'print("Loop starting...")\nwhile True:\n    pass',
      timeoutMs: 2000
    });
    if (res.status === 'timeout' && res.stderr.includes('timed out')) {
      console.log(`✅ Passed: Execution safely killed after ${res.executionTimeMs}ms`);
      passed++;
    } else {
      console.error('❌ Failed:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Error in Test 3:', err);
    failed++;
  }

  // Test 4: Network Isolation (Zero outbound requests allowed)
  try {
    console.log('\n[Test 4] Testing Network Isolation (SSRF & exfiltration prevention)...');
    const res = await executePythonSandbox({
      code: `
import socket
socket.setdefaulttimeout(1.0)
import urllib.request
try:
    urllib.request.urlopen("http://1.1.1.1", timeout=1.0)
    print("NETWORK_ACCESSIBLE")
except Exception as e:
    print("NETWORK_BLOCKED_SUCCESS")
`,
      timeoutMs: 4000
    });
    if (res.stdout.includes('NETWORK_BLOCKED_SUCCESS') && !res.stdout.includes('NETWORK_ACCESSIBLE')) {
      console.log('✅ Passed: Container has NO network access (--network none verified)');
      passed++;
    } else {
      console.error('❌ Failed:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Error in Test 4:', err);
    failed++;
  }

  // Test 5: Read-Only Filesystem protection
  try {
    console.log('\n[Test 5] Testing Read-Only Filesystem tampering prevention...');
    const res = await executePythonSandbox({
      code: `
try:
    with open('/etc/malicious.txt', 'w') as f:
        f.write('tampered')
    print("FS_TAMPER_SUCCEEDED")
except Exception as e:
    print("FS_PROTECTED_SUCCESS")
`,
      timeoutMs: 4000
    });
    if (res.stdout.includes('FS_PROTECTED_SUCCESS') && !res.stdout.includes('FS_TAMPER_SUCCEEDED')) {
      console.log('✅ Passed: Root filesystem is strictly read-only');
      passed++;
    } else {
      console.error('❌ Failed:', res);
      failed++;
    }
  } catch (err) {
    console.error('❌ Error in Test 5:', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');
}

runTests();
