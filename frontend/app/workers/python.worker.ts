type PyodideInterface = {
  runPythonAsync(code: string): Promise<{ toJs(): unknown; destroy(): void }>;
};

declare function importScripts(...urls: string[]): void;
declare const loadPyodide: (options: { indexURL: string }) => Promise<PyodideInterface>;

let pyodidePromise: Promise<PyodideInterface> | null = null;

function getPyodide(): Promise<PyodideInterface> {
  if (!pyodidePromise) {
    importScripts("/pyodide/pyodide.js");
    pyodidePromise = loadPyodide({ indexURL: "/pyodide/" });
  }
  return pyodidePromise;
}

self.onmessage = async (event: MessageEvent<{ id: number; code: string; stdin: string }>) => {
  const { id, code, stdin } = event.data;
  try {
    const pyodide = await getPyodide();
    const result = await pyodide.runPythonAsync(`
import builtins, io, sys
_stdout, _stderr = io.StringIO(), io.StringIO()
_values = iter(${JSON.stringify(stdin.split("\n"))})
def _input(prompt=""):
    print(prompt, end="")
    return next(_values)
_old_stdout, _old_stderr, _old_input = sys.stdout, sys.stderr, builtins.input
sys.stdout, sys.stderr, builtins.input = _stdout, _stderr, _input
try:
    exec(${JSON.stringify(code)}, {"__name__": "__main__"})
except Exception as error:
    print(f"{type(error).__name__}: {error}", file=sys.stderr)
finally:
    sys.stdout, sys.stderr, builtins.input = _old_stdout, _old_stderr, _old_input
[_stdout.getvalue(), _stderr.getvalue()]
`);
    const [stdout, stderr] = result.toJs() as [string, string];
    result.destroy();
    self.postMessage({ id, stdout, stderr });
  } catch (error) { self.postMessage({ id, stdout: "", stderr: error instanceof Error ? error.message : "Ошибка Python." }); }
};
