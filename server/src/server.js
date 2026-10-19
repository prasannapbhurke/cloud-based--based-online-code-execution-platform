import express from 'express';
import cors from 'cors';
import { exec } from 'child_process';
import { promisify } from 'util';
import { config } from './config.js';
import { router as executeRouter } from './routes/execute.js';

const execAsync = promisify(exec);
const app = express();

// Middlewares
app.use(cors({
  origin: true, // Allow frontend dev origins
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

// Health Check
app.get('/api/health', async (req, res) => {
  let dockerOk = false;
  let dockerVersion = 'unknown';

  try {
    const { stdout } = await execAsync('docker -v');
    dockerOk = true;
    dockerVersion = stdout.trim();
  } catch (err) {
    dockerOk = false;
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    docker: {
      available: dockerOk,
      version: dockerVersion,
      sandboxImage: config.dockerImage
    },
    limits: {
      memory: config.memoryLimit,
      cpu: config.cpuLimit,
      pids: config.pidsLimit,
      defaultTimeoutMs: config.defaultTimeoutMs
    }
  });
});

// Code Execution routes
app.use('/api', executeRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    service: 'Cloud Sandboxed Code Execution Engine',
    version: '1.0.0',
    docs: {
      health: 'GET /api/health',
      runtimes: 'GET /api/runtimes',
      execute: 'POST /api/execute'
    }
  });
});

const server = app.listen(config.port, () => {
  console.log(`[Cloud Sandbox] Server running on http://localhost:${config.port}`);
  console.log(`[Cloud Sandbox] Docker isolation image: ${config.dockerImage}`);
  console.log(`[Cloud Sandbox] Resource caps: RAM=${config.memoryLimit}, CPU=${config.cpuLimit}, PIDS=${config.pidsLimit}, Timeout=${config.defaultTimeoutMs}ms`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down server gracefully...');
  server.close(() => process.exit(0));
});
