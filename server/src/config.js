import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  defaultTimeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS || '7000', 10),
  memoryLimit: process.env.MEMORY_LIMIT || '128m',
  cpuLimit: process.env.CPU_LIMIT || '0.5',
  pidsLimit: parseInt(process.env.PIDS_LIMIT || '64', 10),
  maxOutputChars: 50000, // 50 KB max stdout/stderr to protect UI and buffer
  dockerImage: 'cloud-sandbox-python:latest'
};
