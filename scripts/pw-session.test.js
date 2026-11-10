import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'pw-session.sh');

// A stand-in for playwright-cli so the lock can be exercised without launching
// real browser engines. `list` reports the session recorded in liveSession as
// `status: open`, mirroring the real `playwright-cli list --all` output. Like the
// real CLI, `open` lists a browser only once it is up; a `hold-open-<session>`
// file keeps that session launching. While the file named by FAKE_LIST_GATE
// exists, `list` stalls, so a caller can be paused between reading the lock and
// acting on its verdict.
const FAKE_CLI = `#!/bin/bash
state="$(dirname "$0")/live-session"
open_rc="$(dirname "$0")/open-exit-code"
if [ "\${1:-}" = "list" ]; then
  if [ -n "\${FAKE_LIST_GATE:-}" ] && [ -e "$FAKE_LIST_GATE" ]; then
    : >"$FAKE_LIST_GATE.waiting"
    while [ -e "$FAKE_LIST_GATE" ]; do sleep 0.05; done
  fi
  live="$(cat "$state")"
  [ "$live" = "__UNAVAILABLE__" ] && exit 3
  echo "### Browsers"
  if [ -n "$live" ]; then
    echo "- $live:"
    echo "  - status: open"
  fi
  echo "- already-closed:"
  echo "  - status: closed"
  exit 0
fi
session="\${1#-s=}"
case "\${2:-}" in
  open)
    : >"$(dirname "$0")/opening-$session"
    while [ -e "$(dirname "$0")/hold-open-$session" ]; do sleep 0.05; done
    rc="$(cat "$open_rc")"
    [ "$rc" = 0 ] && printf '%s' "$session" >"$state"
    exit "$rc"
    ;;
  close)
    [ "$(cat "$state")" = "$session" ] && printf '' >"$state"
    exit 0
    ;;
esac
exit 0
`;

let tempDir;

// Status and diagnostics are split across stdout and stderr, so assertions read
// both streams.
// PATH and HOME are named explicitly rather than relying on spreading
// process.env, which vitest patches per environment.
const scriptEnv = () => ({
  PATH: process.env.PATH,
  HOME: process.env.HOME,
  PLAYWRIGHT_RESOURCE_LOCK_DIR: path.join(tempDir, 'slot.lock'),
  PLAYWRIGHT_CLI_BIN: path.join(tempDir, 'fake-playwright-cli'),
  PW_SESSION_POLL_SECONDS: '1',
});

// cwd stands for the checkout the script is called from.
const runFrom = (cwd, ...args) => {
  const result = spawnSync(scriptPath, args, { cwd, encoding: 'utf8', env: scriptEnv() });
  return { code: result.status, output: `${result.stdout}${result.stderr}` };
};
const run = (...args) => runFrom(undefined, ...args);

// Runs the script in the background, for interleavings a synchronous call
// cannot produce.
const startWith = (env, ...args) => {
  const child = spawn(scriptPath, args, { env: { ...scriptEnv(), ...env } });
  let output = '';
  child.stdout.on('data', (chunk) => (output += chunk));
  child.stderr.on('data', (chunk) => (output += chunk));
  return new Promise((resolve, reject) => {
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, output }));
  });
};
const start = (...args) => startWith({}, ...args);

const waitFor = async (condition) => {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('Timed out waiting for the fixture');
};

const lockDir = () => path.join(tempDir, 'slot.lock');
const lockExists = () => fs.existsSync(path.join(tempDir, 'slot.lock'));
const lockOwner = () => fs.readFileSync(path.join(lockDir(), 'owner'), 'utf8').split('\n')[0];
// Writes a lock as the script does: line 2 of `owner` is the PID of the `open`
// that took it.
const writeLock = (session, openerPid) => {
  fs.mkdirSync(lockDir());
  fs.writeFileSync(path.join(lockDir(), 'owner'), `${session}\n${openerPid}\n`);
  fs.writeFileSync(path.join(lockDir(), 'started-at'), '2026-01-01T00:00:00Z\n');
  fs.writeFileSync(path.join(lockDir(), 'workspace'), `${process.cwd()}\n`);
};
const ageLock = () => {
  const past = new Date(Date.now() - 10 * 60 * 1000);
  fs.utimesSync(lockDir(), past, past);
};
const exitedPid = () => spawnSync(process.execPath, ['-e', '']).pid;
const setLiveSession = (session) => fs.writeFileSync(path.join(tempDir, 'live-session'), session);
const liveSession = () => fs.readFileSync(path.join(tempDir, 'live-session'), 'utf8');
const setOpenExitCode = (code) => fs.writeFileSync(path.join(tempDir, 'open-exit-code'), String(code));

beforeEach(() => {
  tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pw-session-test-'));
  const fakeCli = path.join(tempDir, 'fake-playwright-cli');
  fs.writeFileSync(fakeCli, FAKE_CLI, { mode: 0o755 });
  setLiveSession('');
  setOpenExitCode(0);
});

afterEach(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe('pw-session.sh', () => {
  it('reports an available slot and rejects malformed session names', () => {
    expect(run('status').output).toContain('browser slot is available');

    const rejected = run('open', 'bad name!');
    expect(rejected.code).toBe(1);
    expect(rejected.output).toContain('session must be 1-40');
  });

  it('acquires the slot, records the owner, and blocks a second live acquire with exit 75', () => {
    expect(run('open', 'verify-chrome', 'about:blank').output).toContain("acquired browser slot for 'verify-chrome'");
    expect(run('status').output).toContain('Browser: running');

    const blocked = run('open', 'verify-firefox', 'about:blank');
    expect(blocked.code).toBe(75);
    expect(blocked.output).toContain('do not bypass the lock');
  });

  it('refuses to release or steal a slot owned by another session', () => {
    run('open', 'verify-chrome', 'about:blank');

    const released = run('release', 'verify-firefox');
    expect(released.code).toBe(1);
    expect(released.output).toContain("cannot release the slot held by 'verify-chrome'");

    // Closing a different session must still stop that browser without
    // dropping someone else's lock.
    expect(run('close', 'verify-firefox').output).toContain("left the slot held by 'verify-chrome' untouched");
    expect(lockExists()).toBe(true);
  });

  it('refuses to close or release a same-named slot held from another workspace', () => {
    run('open', 'check-task', 'about:blank');
    const otherWorkspace = path.join(tempDir, 'other-worktree');
    fs.mkdirSync(otherWorkspace);

    // playwright-cli's session registry is shared, so this name reaches the
    // holder's browser.
    const closed = runFrom(otherWorkspace, 'close', 'check-task');
    expect(closed.code).toBe(1);
    expect(closed.output).toContain('held from another workspace');
    expect(liveSession()).toBe('check-task');
    expect(runFrom(otherWorkspace, 'release', 'check-task').code).toBe(1);
    expect(lockExists()).toBe(true);

    expect(run('close', 'check-task').output).toContain("released browser slot for 'check-task'");
  });

  it('releases the slot when the owner closes it', () => {
    run('open', 'verify-chrome', 'about:blank');

    expect(run('close', 'verify-chrome').output).toContain("released browser slot for 'verify-chrome'");
    expect(lockExists()).toBe(false);
  });

  it('reclaims a stale slot whose browser is gone instead of blocking forever', () => {
    run('open', 'verify-chrome', 'about:blank');
    setLiveSession(''); // the browser died without releasing the lock

    const status = run('status');
    expect(status.output).toContain('stale lock');
    expect(status.output).toContain('reclaims this slot automatically');

    const reclaimed = run('open', 'verify-firefox', 'about:blank');
    expect(reclaimed.code).toBe(0);
    expect(reclaimed.output).toContain("reclaimed stale slot from 'verify-chrome'");
  });

  it('holds the slot while its browser is still launching', async () => {
    fs.writeFileSync(path.join(tempDir, 'hold-open-verify-chrome'), '');
    const launching = start('open', 'verify-chrome', 'about:blank');
    await waitFor(() => fs.existsSync(path.join(tempDir, 'opening-verify-chrome')));

    // playwright-cli does not list the browser yet, which must not read as stale.
    expect(run('status').output).toContain('Browser: starting');
    const blocked = run('open', 'verify-firefox', 'about:blank');
    expect(blocked.code).toBe(75);
    expect(blocked.output).not.toContain('reclaimed');
    expect(run('release', 'verify-firefox').output).not.toContain('stale');

    fs.rmSync(path.join(tempDir, 'hold-open-verify-chrome'));
    expect((await launching).code).toBe(0);
    expect(lockOwner()).toBe('verify-chrome');
    expect(liveSession()).toBe('verify-chrome');
  });

  it('holds a slot whose metadata is not written yet until the launch window passes', () => {
    fs.mkdirSync(lockDir());

    expect(run('open', 'verify-firefox', 'about:blank').code).toBe(75);

    ageLock(); // the process that created it never wrote its owner
    const reclaimed = run('open', 'verify-firefox', 'about:blank');
    expect(reclaimed.code).toBe(0);
    expect(reclaimed.output).toContain('reclaimed stale slot');
  });

  it('reclaims a slot whose opener is gone or whose launch window has passed', () => {
    // The opener crashed before its browser came up.
    writeLock('verify-chrome', exitedPid());
    expect(run('open', 'verify-firefox', 'about:blank').output).toContain("reclaimed stale slot from 'verify-chrome'");
    run('close', 'verify-firefox');

    // A live process at the recorded PID cannot keep an old lock held.
    writeLock('verify-chrome', process.pid);
    ageLock();
    expect(run('open', 'verify-firefox', 'about:blank').output).toContain("reclaimed stale slot from 'verify-chrome'");
  });

  it('never lets a reclaimer acting on an old verdict remove a fresh lock', async () => {
    writeLock('verify-chrome', exitedPid()); // stale: its browser and opener are gone
    const gate = path.join(tempDir, 'list-gate');
    fs.writeFileSync(gate, '');
    // This open reads the stale owner, then stalls inside `playwright-cli list`.
    const late = startWith({ FAKE_LIST_GATE: gate }, 'open', 'verify-firefox', 'about:blank');
    await waitFor(() => fs.existsSync(`${gate}.waiting`));

    // Meanwhile another open reclaims the stale lock and takes the slot.
    expect(run('open', 'verify-webkit', 'about:blank').code).toBe(0);

    fs.rmSync(gate); // the stalled open now judges 'verify-chrome' dead
    expect((await late).code).toBe(75);
    expect(lockOwner()).toBe('verify-webkit');
    expect(liveSession()).toBe('verify-webkit');
  });

  it('leaves a stale lock alone while another reclaim holds its turn', () => {
    writeLock('verify-chrome', exitedPid());
    fs.mkdirSync(`${lockDir()}.reclaim`);

    const stuck = run('open', 'verify-firefox', 'about:blank');
    expect(stuck.code).toBe(75);
    expect(stuck.output).toContain('another reclaim is running or was interrupted');
    expect(lockOwner()).toBe('verify-chrome');
  });

  it('still stops the browser when the lock was already lost', () => {
    run('open', 'verify-chrome', 'about:blank');
    fs.rmSync(path.join(tempDir, 'slot.lock'), { recursive: true });

    expect(run('close', 'verify-chrome').output).toContain("already free; closed 'verify-chrome' anyway");
    expect(liveSession()).toBe('');
  });

  it('releases the slot when the browser fails to start', () => {
    setOpenExitCode(1);

    const failed = run('open', 'verify-chrome', 'about:blank');
    expect(failed.code).toBe(1);
    expect(failed.output).toContain('released browser slot');
    expect(lockExists()).toBe(false);
  });

  it('leaves the lock alone when browser liveness cannot be verified', () => {
    run('open', 'verify-chrome', 'about:blank');
    setLiveSession('__UNAVAILABLE__'); // playwright-cli list fails

    expect(run('status').output).toContain('unverifiable');

    // Failing closed matters: a broken CLI must not silently disable the budget.
    const blocked = run('open', 'verify-firefox', 'about:blank');
    expect(blocked.code).toBe(75);
    expect(lockExists()).toBe(true);
  });

  it('polls for a busy slot with --wait and gives up with exit 75', () => {
    run('open', 'verify-chrome', 'about:blank');

    const timedOut = run('open', '--wait=2', 'verify-firefox', 'about:blank');
    expect(timedOut.code).toBe(75);
    expect(timedOut.output).toContain('gave up after 2s');
    expect(timedOut.output).toContain('retrying in 1s');

    const malformed = run('open', '--wait=soon', 'verify-firefox');
    expect(malformed.code).toBe(1);
    expect(malformed.output).toContain('whole number of seconds');
  });

  it('honours --wait after the session name instead of passing it to playwright-cli', () => {
    run('open', 'verify-chrome', 'about:blank');

    const afterSession = run('open', 'verify-firefox', '--wait=2', 'about:blank');
    expect(afterSession.code).toBe(75);
    expect(afterSession.output).toContain('gave up after 2s');
  });

  it('fails loudly instead of spinning when a stale lock cannot be removed', () => {
    run('open', 'verify-chrome', 'about:blank');
    setLiveSession(''); // stale, but the lock directory is not removable
    fs.chmodSync(tempDir, 0o500);

    try {
      const stuck = run('open', 'verify-firefox', 'about:blank');
      expect(stuck.code).toBe(75);
      expect(stuck.output).toContain('could not reclaim the stale slot');
    } finally {
      fs.chmodSync(tempDir, 0o700);
    }
  });

  it('opens with no extra playwright-cli arguments', () => {
    // Bash 3.2 errors on an empty array expansion under `set -u`, so the
    // no-arguments path needs its own guard.
    const opened = run('open', 'verify-chrome');
    expect(opened.code).toBe(0);
    expect(opened.output).toContain("acquired browser slot for 'verify-chrome'");
  });

  it('prints usage for an unknown subcommand', () => {
    const unknown = run('bogus');
    expect(unknown.code).toBe(1);
    expect(unknown.output).toContain('Usage:');
  });
});
