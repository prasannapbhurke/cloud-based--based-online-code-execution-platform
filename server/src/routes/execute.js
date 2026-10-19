import express from 'express';
import { executePythonSandbox } from '../services/dockerRunner.js';
import { config } from '../config.js';

export const router = express.Router();

// Supported runtimes metadata
const SUPPORTED_RUNTIMES = [
  {
    id: 'python',
    name: 'Python 3.12 (Sandboxed)',
    version: '3.12-alpine',
    extension: '.py',
    sampleCode: `# Welcome to AetherCode Sandboxed Execution Platform
# Fast, isolated Python 3.12 execution

class InsufficientBalanceError(Exception):
    pass

class BankAccount:
    def __init__(self, owner: str, balance: float):
        self.owner = owner
        self.balance = balance

    def withdraw(self, amount: float):
        if amount > self.balance:
            raise InsufficientBalanceError(f"Cannot withdraw \${amount}, balance is \${self.balance}")
        self.balance -= amount
        return self.balance

account = BankAccount("Ada", 100.0)
try:
    print("Attempting valid withdrawal:")
    account.withdraw(40.0)
    print(f"Remaining balance: \${account.balance}")
    
    print("\\nAttempting invalid withdrawal (exceeds balance):")
    account.withdraw(80.0)
except InsufficientBalanceError as err:
    print(f"Caught Custom Exception: {err}")
finally:
    print("Audit check complete.")
`
  }
];

// GET /api/runtimes
router.get('/runtimes', (req, res) => {
  res.json({
    runtimes: SUPPORTED_RUNTIMES,
    limits: {
      defaultTimeoutMs: config.defaultTimeoutMs,
      maxTimeoutMs: 15000,
      memoryLimit: config.memoryLimit,
      cpuLimit: config.cpuLimit,
      maxOutputChars: config.maxOutputChars
    }
  });
});

// POST /api/execute
router.post('/execute', async (req, res) => {
  try {
    const { code, language = 'python', stdin = '', timeoutMs } = req.body;

    // Validation
    if (typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'The "code" field is required and must not be empty.'
      });
    }

    if (code.length > 100000) {
      return res.status(400).json({
        error: 'Payload Too Large',
        message: 'Code payload exceeds maximum allowed size of 100KB.'
      });
    }

    const normalizedLang = language.toLowerCase();
    if (normalizedLang !== 'python' && normalizedLang !== 'python3') {
      return res.status(400).json({
        error: 'Unsupported Runtime',
        message: `Language '${language}' is not supported yet. Currently supported: python`
      });
    }

    // Clamp timeout between 500ms and 15000ms
    let effectiveTimeout = config.defaultTimeoutMs;
    if (typeof timeoutMs === 'number' && !isNaN(timeoutMs)) {
      effectiveTimeout = Math.min(Math.max(timeoutMs, 500), 15000);
    }

    // Execute in container sandbox
    const result = await executePythonSandbox({
      code,
      stdin,
      timeoutMs: effectiveTimeout
    });

    return res.json(result);
  } catch (err) {
    console.error('Execution router error:', err);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: err.message || 'An unexpected error occurred during execution.'
    });
  }
});
