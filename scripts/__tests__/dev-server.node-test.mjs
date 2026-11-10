import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { setTimeout } from 'node:timers/promises';
import { resolvePort } from '../dev-server-utils.mjs';

const listen = (port, host) =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });

const processExists = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error.code !== 'ESRCH';
  }
};

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

for (const signal of ['SIGTERM', 'SIGHUP']) {
  test(`forwardChildExit stops the server when the launcher receives ${signal}`, async (t) => {
    const root = mkdtempSync(path.join(tmpdir(), 'dev-server-test-'));
    t.after(() => rmSync(root, { recursive: true, force: true }));
    const pidFile = path.join(root, 'server.pid');
    const launcherPath = path.join(root, 'launcher.mjs');
    const utils = new URL('../local-server-utils.mjs', import.meta.url).href;
    writeFileSync(
      launcherPath,
      `
import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { forwardChildExit } from ${JSON.stringify(utils)};
const server = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
writeFileSync(${JSON.stringify(pidFile)}, String(server.pid));
forwardChildExit(server);
`,
    );
    const launcher = spawn(process.execPath, [launcherPath], { stdio: 'ignore' });
    const exited = new Promise((resolve) => launcher.on('close', (code, closeSignal) => resolve({ code, signal: closeSignal })));
    t.after(() => launcher.kill('SIGKILL'));

    for (let attempt = 0; attempt < 300 && !existsSync(pidFile); attempt += 1) await setTimeout(10);
    const serverPid = Number(readFileSync(pidFile, 'utf8'));
    t.after(() => {
      if (processExists(serverPid)) process.kill(serverPid, 'SIGKILL');
    });

    launcher.kill(signal);
    assert.deepEqual(await exited, { code: null, signal });
    for (let attempt = 0; attempt < 200 && processExists(serverPid); attempt += 1) await setTimeout(10);
    assert.equal(processExists(serverPid), false, 'the server outlived its launcher');
  });
}
