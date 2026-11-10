import assert from 'node:assert/strict';
import net from 'node:net';
import test from 'node:test';
import { resolvePort } from '../dev-server-utils.mjs';

const listen = (port, host) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });

const holdPort = async (t, host) => {
  let holder = await listen(0, host);
  // Leave room above the held port so the probe never walks past 65535.
  while (holder.address().port > 65000) {
    await new Promise((resolve) => holder.close(resolve));
    holder = await listen(0, host);
  }
  t.after(() => holder.close());
  return holder.address().port;
};

test('resolvePort skips a port already bound on the host Vite will use', async (t) => {
  const busyPort = await holdPort(t, '127.0.0.1');

  assert.notEqual(await resolvePort(busyPort, '127.0.0.1'), busyPort);
});

test('resolvePort skips a port held on the wildcard address by a default listen', async (t) => {
  const busyPort = await holdPort(t, undefined);

  assert.notEqual(await resolvePort(busyPort, '127.0.0.1'), busyPort);
});
