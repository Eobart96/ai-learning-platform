type WorkerRequest = { id: number; code: string; stdin: string };
type WorkerResponse = { id: number; stdout: string; stderr: string };

let worker: Worker | null = null;
let sequence = 0;
const waiting = new Map<number, { resolve: (value: Omit<WorkerResponse, "id">) => void; reject: (reason: Error) => void }>();

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL("../workers/python.worker.ts", import.meta.url));
  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    const request = waiting.get(event.data.id);
    if (!request) return;
    waiting.delete(event.data.id);
    request.resolve({ stdout: event.data.stdout, stderr: event.data.stderr });
  };
  worker.onerror = () => { waiting.forEach(({ reject }) => reject(new Error("Не удалось запустить Python в браузере."))); waiting.clear(); worker = null; };
  return worker;
}

export function runPythonInBrowser(code: string, stdin: string): Promise<Omit<WorkerResponse, "id">> {
  const id = ++sequence;
  return new Promise((resolve, reject) => {
    waiting.set(id, { resolve, reject });
    getWorker().postMessage({ id, code, stdin } satisfies WorkerRequest);
  });
}
