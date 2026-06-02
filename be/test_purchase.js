const ethers = require('ethers');
const https = require('https');

const PRIVATE_KEY = '0xfa95e27b2db16755dc508fc6131fc81091708f38706f24b3d33ffc85a05855c6';
const WALLET_ADDR = '0x4B5f843bcaa38D1b6C83A4a6cd6eC53e7a3474B4';
const VENDING_ADDR = '0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85';
const SLOT = '1';
const PRODUCT = 'Coca Cola';

async function apiCall(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'apivendingmachine.thiephaoy.shop',
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    const req = https.request(options, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(JSON.parse(d)));
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('=== TEST PURCHASE ===\n');

  // 0. Join queue first
  console.log('0. Joining queue...');
  const join = await apiCall('POST', '/api/vending/machine-hanoi-05/connect', {
    walletAddress: WALLET_ADDR
  });
  console.log('   Position:', join.data.position, 'Status:', join.data.status, '\n');

  // 1. Send tx
  console.log('1. Sending 0.001 ETH...');
  const provider = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const tx = await wallet.sendTransaction({ to: VENDING_ADDR, value: ethers.parseEther('0.001') });
  console.log('   TX:', tx.hash);
  await tx.wait();
  console.log('   Confirmed!\n');

  // 2. Purchase API
  console.log('2. Calling purchase API...');
  const result = await apiCall('POST', '/api/product/purchase', {
    machineId: 'machine-hanoi-05',
    slot: SLOT,
    productName: PRODUCT,
    txHash: tx.hash,
    walletAddress: WALLET_ADDR
  });
  if (!result.success) {
    console.log('   FAILED:', result.message);
    return;
  }
  console.log('   Order:', result.data.id);
  console.log('   Command:', result.data.commandId);
  console.log('   OrderNumber:', result.data.orderNumber);
  console.log('   Status:', result.success ? 'OK' : 'FAILED');

  // 3. Poll command
  console.log('\n3. Polling dispense status...');
  for (let i = 0; i < 10; i++) {
    await new Promise(r => setTimeout(r, 2000));
    const cmd = await apiCall('GET', `/api/command/machine/machine-hanoi-05/command/${result.data.commandId}`);
    console.log(`   [${i+1}] Status: ${cmd.data?.status || 'unknown'}`);
    if (cmd.data?.status === 'completed' || cmd.data?.status === 'failed') {
      console.log('\n=== FINAL:', cmd.data.status, '===');
      break;
    }
  }

  // 4. Finish shopping
  console.log('\n4. Finishing shopping...');
  const finish = await apiCall('POST', '/api/vending/machine-hanoi-05/finish-shopping', {
    walletAddress: WALLET_ADDR
  });
  console.log('   Result:', finish.success ? 'OK' : 'FAILED');
}

main().catch(e => console.error('ERROR:', e.message));
