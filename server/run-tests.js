const { spawn } = require('child_process');
const path = require('path');

const server = spawn('node', [path.join(__dirname, 'index.js')], {
  stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, PORT: '5001' }
});

let started = false;

server.stdout.on('data', (d) => {
  const str = d.toString();
  process.stdout.write(`[SERVER] ${str}`);
  if (!started && str.includes('Running on http://')) {
    started = true;
    console.log('\n🚀 [TEST RUNNER] Server is ready! Launching GatePass Automated Test Suite...\n');
    const tester = spawn('node', [path.join(__dirname, 'test-suite.js')], {
      stdio: 'inherit',
      env: { ...process.env, PORT: '5001' }
    });

    tester.on('close', (code) => {
      server.kill();
      process.exit(code);
    });
  }
});

server.stderr.on('data', (d) => process.stderr.write(`[SERVER ERR] ${d}`));

// Failsafe timeout after 25s
setTimeout(() => {
  if (!started) {
    console.error('Timed out waiting for server to start.');
    server.kill();
    process.exit(1);
  }
}, 25000);
