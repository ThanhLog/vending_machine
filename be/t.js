const ethers = require('ethers');
const https = require('https');

const PK = '0xfa95e27b2db16755dc508fc6131fc81091708f38706f24b3d33ffc85a05855c6';
const ADDR = '0x4B5f843bcaa38D1b6C83A4a6cd6eC53e7a3474B4';
const VEND = '0x94988621cDd1aCEAa0284f65cb2EBE0B40AD7c85';

function api(m, p, b) {
  return new Promise((ok, no) => {
    const d = b ? JSON.stringify(b) : null;
    const o = { hostname: 'apivendingmachine.thiephaoy.shop', path: p, method: m, headers: { 'Content-Type': 'application/json' } };
    const r = https.request(o, res => { let x = ''; res.on('data', c => x += c); res.on('end', () => ok(JSON.parse(x))); });
    r.on('error', no); if (d) r.write(d); r.end();
  });
}

async function main() {
  console.log('=== TEST MOTOR ===\n');
  const p = new ethers.JsonRpcProvider('https://ethereum-sepolia-rpc.publicnode.com');
  const w = new ethers.Wallet(PK, p);
  console.log('1. Send 0.001 ETH...');
  const tx = await w.sendTransaction({ to: VEND, value: ethers.parseEther('0.001') });
  console.log('   TX:', tx.hash);
  await tx.wait();
  console.log('   Done\n');

  console.log('2. Purchase...');
  const r = await api('POST', '/api/product/purchase', { machineId: 'machine-hanoi-05', slot: '1', productName: 'Coca', txHash: tx.hash, walletAddress: ADDR });
  console.log('   Order:', r.data?.id, 'Cmd:', r.data?.commandId, 'Status:', r.success);

  console.log('\n3. Poll dispense...');
  for (let i = 0; i < 10; i++) {
    await new Promise(rr => setTimeout(rr, 2000));
    const c = await api('GET', '/api/command/machine/machine-hanoi-05/command/' + r.data.commandId);
    console.log('   [' + (i+1) + ']', c.data?.status);
    if (c.data?.status === 'completed' || c.data?.status === 'failed') break;
  }
}
main().catch(e => console.error('ERR:', e.message));
