/**
 * WebAssembly In-Browser Python Runner using Pyodide
 * Enables 100% serverless, free, and unlimited Python execution for GitHub Pages.
 */

let pyodideInstance = null;
let pyodideLoadingPromise = null;

export async function getPyodide() {
  if (pyodideInstance) return pyodideInstance;

  if (!pyodideLoadingPromise) {
    pyodideLoadingPromise = (async () => {
      // Wait for script to be loaded if not already
      if (!window.loadPyodide) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Pyodide WebAssembly engine.'));
          document.head.appendChild(script);
        });
      }

      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/'
      });

      // Pre-initialize sys and io for stdout/stderr capturing
      await pyodide.runPythonAsync(`
import sys
import io
`);

      pyodideInstance = pyodide;
      return pyodide;
    })();
  }

  return pyodideLoadingPromise;
}

/**
 * Execute Python code in the browser via Pyodide WebAssembly
 * 
 * @param {Object} options
 * @param {string} options.code - Python code
 * @param {string} [options.stdin] - Standard input lines
 * @returns {Promise<Object>} Execution result object
 */
export async function runPythonInBrowser({ code, stdin = '' }) {
  const startTime = performance.now();
  const pyodide = await getPyodide();

  // Prepare standard input lines as a Python list
  const stdinLines = stdin ? stdin.split('\n') : [];
  pyodide.globals.set('__stdin_lines__', stdinLines);

  const runnerScript = `
import sys
import io
import builtins

# Setup in-memory stdout and stderr capture buffers
__capture_stdout__ = io.StringIO()
__capture_stderr__ = io.StringIO()
sys.stdout = __capture_stdout__
sys.stderr = __capture_stderr__

# Setup mock for input() reading from stdin
__stdin_queue__ = list(__stdin_lines__)

def __mock_input__(prompt=''):
    if prompt:
        print(prompt, end='')
    if __stdin_queue__:
        return __stdin_queue__.pop(0)
    return ''

builtins.input = __mock_input__
`;

  await pyodide.runPythonAsync(runnerScript);

  let status = 'success';
  let exitCode = 0;
  let executionError = null;

  try {
    await pyodide.runPythonAsync(code);
  } catch (err) {
    status = 'error';
    exitCode = 1;
    executionError = err;
  }

  // Extract stdout and stderr
  const stdoutResult = await pyodide.runPythonAsync(`__capture_stdout__.getvalue()`);
  const stderrBuffer = await pyodide.runPythonAsync(`__capture_stderr__.getvalue()`);
  
  // Reset stdout and stderr
  await pyodide.runPythonAsync(`
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__
`);

  const endTime = performance.now();
  const durationMs = Math.round(endTime - startTime);

  let finalStderr = stderrBuffer;
  if (executionError) {
    // Format the error nicely (remove internal Pyodide JS trace frames if present)
    const errText = executionError.message || String(executionError);
    finalStderr = finalStderr ? `${finalStderr}\n${errText}` : errText;
  }

  return {
    status,
    exitCode,
    stdout: stdoutResult,
    stderr: finalStderr,
    executionTimeMs: durationMs,
    truncated: false,
    sandbox: {
      engine: 'WebAssembly (In-Browser Serverless)',
      runtime: 'Pyodide WebAssembly Python 3.12',
      environment: 'Client-Side Sandbox (Zero Host Required)',
      network: 'browser-isolated'
    }
  };
}
