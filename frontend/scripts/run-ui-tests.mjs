import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const host = "127.0.0.1";
const port = 3100;
const baseUrl = `http://${host}:${port}`;
const nextCli = path.join("node_modules", "next", "dist", "bin", "next");
const playwrightCli = path.join("node_modules", "@playwright", "test", "cli.js");

async function responds(url) {
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(1_000) });
    return response.status < 500;
  } catch {
    return false;
  }
}

async function waitForServer(server) {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next.js завершился с кодом ${server.exitCode}.`);
    if (await responds(baseUrl)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Next.js не запустился за 120 секунд.");
}

function stopServer(server) {
  if (!server.pid) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"], { stdio: "ignore", timeout: 5_000 });
    return;
  }
  try {
    process.kill(-server.pid, "SIGTERM");
  } catch {
    // Сервер уже завершился.
  }
}

if (await responds(baseUrl)) {
  throw new Error(`Порт ${port} уже занят. Остановите процесс на ${baseUrl} и повторите запуск.`);
}

const server = spawn(process.execPath, [nextCli, "dev", "--hostname", host, "--port", String(port)], {
  detached: process.platform !== "win32",
  stdio: "ignore",
});
server.unref();

try {
  await waitForServer(server);
  const tests = spawn(process.execPath, [playwrightCli, "test", ...process.argv.slice(2)], { stdio: "inherit" });
  const exitCode = await new Promise((resolve, reject) => {
    tests.once("error", reject);
    tests.once("exit", (code) => resolve(code ?? 1));
  });
  process.exitCode = exitCode;
} finally {
  stopServer(server);
}
