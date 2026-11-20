// Runs an app container's start command once its Postgres accepts connections,
// then exits if the app stops answering so the restart policy brings it back.
//
// After a host reboot Docker starts every container at once and ignores
// compose's depends_on, so an app could boot while Postgres was still
// recovering, fail its startup once, and serve 500s until restarted by hand.
//
// Usage: node watchdog.mjs <command> [args...]
// Env:   DATABASE_URL         the app's own (only host, port, user, db are read)
//        WATCHDOG_URL         default http://127.0.0.1:$PORT/
//        WATCHDOG_GRACE_S     seconds before the first check, default 60
//        WATCHDOG_INTERVAL_S  seconds between checks, default 30
//        WATCHDOG_FAILURES    failed checks in a row before exiting, default 3

import { spawn } from "node:child_process";
import net from "node:net";
import { setTimeout as sleep } from "node:timers/promises";

const log = (msg) => console.log(`[watchdog] ${msg}`);

const [cmd, ...args] = process.argv.slice(2);
if (!cmd) {
  console.error("[watchdog] usage: node watchdog.mjs <command> [args...]");
  process.exit(2);
}

const db = new URL(process.env.DATABASE_URL);
const dbHost = db.hostname;
const dbPort = Number(db.port || 5432);
const dbUser = decodeURIComponent(db.username || "postgres");
const dbName = decodeURIComponent(db.pathname.slice(1) || dbUser);

const healthUrl = process.env.WATCHDOG_URL ?? `http://127.0.0.1:${process.env.PORT ?? 3000}/`;
const graceMs = Number(process.env.WATCHDOG_GRACE_S ?? 60) * 1000;
const intervalMs = Number(process.env.WATCHDOG_INTERVAL_S ?? 30) * 1000;
const maxFailures = Number(process.env.WATCHDOG_FAILURES ?? 3);

// Sends a startup packet, as pg_isready does. Postgres answers "starting up",
// "shutting down" or "in recovery" with SQLSTATE 57P03; any other answer (an
// auth request, or another error) means it accepts connections. No password
// is sent: authenticating is left to the app.
function probePostgres() {
  return new Promise((resolve) => {
    const sock = net.connect(dbPort, dbHost);
    let buf = Buffer.alloc(0);
    const done = (ready, why) => {
      sock.destroy();
      resolve({ ready, why });
    };
    sock.setTimeout(5000, () => done(false, "timeout"));
    sock.on("error", (err) => done(false, err.code ?? err.message));
    sock.on("close", () => done(false, "connection closed"));
    sock.on("connect", () => {
      const params = Buffer.from(`user\0${dbUser}\0database\0${dbName}\0\0`);
      const head = Buffer.alloc(8);
      head.writeInt32BE(8 + params.length, 0);
      head.writeInt32BE(196608, 4); // protocol 3.0
      sock.write(Buffer.concat([head, params]));
    });
    sock.on("data", (chunk) => {
      buf = Buffer.concat([buf, chunk]);
      if (buf.length < 5) return;
      if (buf[0] !== 0x45) return done(true); // not an ErrorResponse ('E')
      const end = 1 + buf.readInt32BE(1);
      if (buf.length < end) return;
      const fields = {};
      for (let i = 5; i < end && buf[i] !== 0; ) {
        const stop = buf.indexOf(0, i + 1);
        if (stop < 0 || stop >= end) break;
        fields[String.fromCharCode(buf[i])] = buf.toString("utf8", i + 1, stop);
        i = stop + 1;
      }
      done(fields.C !== "57P03", fields.M);
    });
  });
}

async function waitForPostgres() {
  let last;
  for (;;) {
    const { ready, why } = await probePostgres();
    if (ready) return log(`postgres at ${dbHost}:${dbPort} accepts connections`);
    if (why !== last) log(`waiting for postgres at ${dbHost}:${dbPort}: ${why}`);
    last = why;
    await sleep(2000);
  }
}

// Returns null when the app answers below 500, else what went wrong.
async function checkApp() {
  try {
    const res = await fetch(healthUrl, { redirect: "manual", signal: AbortSignal.timeout(10_000) });
    await res.body?.cancel();
    return res.status < 500 ? null : `HTTP ${res.status}`;
  } catch (err) {
    return err.cause?.code ?? err.name ?? String(err);
  }
}

let child;
let stopping = false;
let unhealthy = false;

// As PID 1, node ignores SIGTERM unless it handles it.
for (const sig of ["SIGTERM", "SIGINT"]) {
  process.on(sig, () => {
    stopping = true;
    if (child) child.kill(sig);
    else process.exit(0);
  });
}

await waitForPostgres();

child = spawn(cmd, args, { stdio: "inherit" });
child.on("error", (err) => {
  log(`could not start ${cmd}: ${err.message}`);
  process.exit(1);
});
child.on("exit", (code, signal) => {
  if (!stopping) log(`app exited (${signal ?? `code ${code}`})`);
  process.exit(unhealthy ? 1 : (code ?? 1));
});

await sleep(graceMs);
let failures = 0;
while (!stopping) {
  const problem = await checkApp();
  if (!problem) {
    if (failures) log(`${healthUrl} answers again`);
    failures = 0;
  } else if (++failures < maxFailures) {
    log(`${healthUrl} check ${failures}/${maxFailures} failed: ${problem}`);
  } else {
    log(`${healthUrl} failed ${failures} checks in a row (${problem}); exiting so Docker restarts the container`);
    stopping = true;
    unhealthy = true;
    child.kill("SIGTERM");
    setTimeout(() => child.kill("SIGKILL"), 10_000).unref();
    break;
  }
  await sleep(intervalMs);
}
