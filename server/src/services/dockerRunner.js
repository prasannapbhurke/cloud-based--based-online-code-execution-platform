import { spawn, exec } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { config } from '../config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEMP_ROOT = path.resolve(__dirname, '../../.temp');

// Ensure base temporary directory exists
await fs.mkdir(TEMP_ROOT, { recursive: true });

/**
 * Runs code securely inside an isolated, sandboxed Docker container.
 * 
 * @param {Object} options
 * @param {string} options.code - The user's Python source code.
 * @param {string} [options.stdin] - Standard input provided by user.
 * @param {number} [options.timeoutMs] - Execution timeout in ms.
 * @returns {Promise<Object>} Execution result with stdout, stderr, execution time, and status.
 */
export async function executePythonSandbox({ code, stdin = '', timeoutMs = config.defaultTimeoutMs }) {
  const executionId = `sb_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const containerName = `sandbox_${executionId}`;
  const executionDir = path.join(TEMP_ROOT, executionId);

  // Measure execution duration
  const startTime = process.hrtime.bigint();

  let timedOut = false;
  let stdout = '';
  let stderr = '';
  let isOutputTruncated = false;

  try {
    // 1. Create temp directory and write the user code to main.py
    await fs.mkdir(executionDir, { recursive: true });
    const codeFilePath = path.join(executionDir, 'main.py');
    await fs.writeFile(codeFilePath, code, 'utf8');

    // 2. Prepare Docker command flags
    // -i allows stdin stream to be piped into the container
    // --rm automatically cleans up container upon exit
    // --network none prevents any network access (SSRF, exfiltration, botnets)
    // --memory restricts RAM to prevent out-of-memory DoS
    // --cpus restricts CPU usage
    // --pids-limit prevents fork bombs
    // --read-only ensures container filesystem cannot be mutated
    // --tmpfs /tmp allows bounded ephemeral writes needed by runtimes
    // -v mounts the directory read-only (:ro)
    const dockerArgs = [
      'run',
      '-i',
      '--rm',
      '--name', containerName,
      '--network', 'none',
      '--memory', config.memoryLimit,
      '--cpus', config.cpuLimit,
      '--pids-limit', String(config.pidsLimit),
      '--read-only',
      '--tmpfs', '/tmp:rw,noexec,nosuid,size=16m',
      '-v', `${executionDir}:/app:ro`,
      config.dockerImage,
      'main.py'
    ];

    const child = spawn('docker', dockerArgs);

    // 3. Setup timeout handler
    const timeoutHandle = setTimeout(() => {
      timedOut = true;
      // Force kill the container by name to immediately stop CPU/RAM usage
      exec(`docker kill ${containerName}`, () => {});
      try {
        child.kill('SIGKILL');
      } catch (e) {
        // Ignored
      }
    }, timeoutMs);

    // 4. Pipe standard input if provided
    if (stdin && typeof stdin === 'string') {
      child.stdin.write(stdin);
    }
    child.stdin.end();

    // 5. Capture stdout & stderr with length guards
    child.stdout.on('data', (chunk) => {
      if (stdout.length < config.maxOutputChars) {
        stdout += chunk.toString();
        if (stdout.length >= config.maxOutputChars) {
          isOutputTruncated = true;
          stdout = stdout.slice(0, config.maxOutputChars) + '\n[Output truncated: maximum size limit reached]';
        }
      }
    });

    child.stderr.on('data', (chunk) => {
      if (stderr.length < config.maxOutputChars) {
        stderr += chunk.toString();
        if (stderr.length >= config.maxOutputChars) {
          isOutputTruncated = true;
          stderr = stderr.slice(0, config.maxOutputChars) + '\n[Error output truncated: maximum size limit reached]';
        }
      }
    });

    // 6. Wait for process completion
    const exitCode = await new Promise((resolve) => {
      child.on('close', (code) => {
        clearTimeout(timeoutHandle);
        resolve(code);
      });

      child.on('error', (err) => {
        clearTimeout(timeoutHandle);
        stderr += `\nFailed to spawn container: ${err.message}`;
        resolve(1);
      });
    });

    const endTime = process.hrtime.bigint();
    const durationMs = Number((endTime - startTime) / 1000000n);

    // 7. Determine status
    let status = 'success';
    if (timedOut) {
      status = 'timeout';
      stderr = `Execution timed out after ${timeoutMs}ms.\nProcess terminated.`;
    } else if (exitCode === 137) {
      // 137 typically means SIGKILL or OOM
      status = 'memory_exceeded_or_killed';
      stderr += '\nProcess killed (Command exceeded memory limit or was terminated).';
    } else if (exitCode !== 0) {
      status = 'error';
    }

    return {
      status,
      exitCode,
      stdout,
      stderr,
      executionTimeMs: durationMs,
      truncated: isOutputTruncated,
      sandbox: {
        engine: 'docker',
        image: config.dockerImage,
        memoryLimit: config.memoryLimit,
        cpuLimit: config.cpuLimit,
        pidsLimit: config.pidsLimit,
        network: 'isolated'
      }
    };
  } finally {
    // 8. Clean up execution temp directory
    try {
      await fs.rm(executionDir, { recursive: true, force: true });
    } catch (cleanupErr) {
      console.error(`Error cleaning temp dir ${executionDir}:`, cleanupErr.message);
    }
  }
}
