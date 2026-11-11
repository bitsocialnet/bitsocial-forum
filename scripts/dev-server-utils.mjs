#!/usr/bin/env node

import { spawn } from 'node:child_process';
import net from 'node:net';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const repoRoot = path.resolve(__dirname, '..');
export const isWindows = process.platform === 'win32';

function checkPort(port, host) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', () => resolve(false));
    server.once('listening', () => {
      server.close(() => resolve(true));
    });
    server.listen(port, host);
  });
}

// Also probe the host the server will bind: on macOS a wildcard listen succeeds
// while another process holds the port on 127.0.0.1, and a 127.0.0.1 listen
// succeeds while another holds it on the wildcard address.
export async function resolvePort(requestedPort, host) {
  let port = requestedPort;

  while (!(await checkPort(port)) || (host !== undefined && !(await checkPort(port, host)))) {
    port += 1;
  }

  return port;
}

export async function waitForPort(host, port, timeoutMs = 30_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const ready = await new Promise((resolve) => {
      const socket = net.connect({ host, port });

      socket.once('connect', () => {
        socket.destroy();
        resolve(true);
      });
      socket.once('error', () => resolve(false));
    });

    if (ready) {
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timed out waiting for dev server on http://${host}:${port}`);
}

export function startVite(host, port) {
  const child = spawn('corepack', ['yarn', 'exec', 'vite', '--host', host, '--port', String(port), '--strictPort'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      PORTLESS: '0',
    },
    stdio: 'inherit',
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  const onSigint = () => forwardSignal('SIGINT');
  const onSigterm = () => forwardSignal('SIGTERM');

  process.on('SIGINT', onSigint);
  process.on('SIGTERM', onSigterm);

  child.on('exit', (code, signal) => {
    process.off('SIGINT', onSigint);
    process.off('SIGTERM', onSigterm);

    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });

  return child;
}
