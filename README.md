# AetherCode - Cloud-Based Sandboxed Code Execution Platform

A secure, isolated cloud code execution engine and web IDE built with **React**, **Node.js/Express**, and **Docker Sandboxing**.

---

## 🏗️ Architecture Overview

The system is structured into two main subsystems:

```
┌───────────────────────────────────────────────┐
│              Client (React + Vite)            │
│  - Monaco Code Editor (VS Code core)          │
│  - Multi-tab Console (Output, Stdin, History) │
│  - Security Isolation Monitoring Dashboard    │
└───────────────────────┬───────────────────────┘
                        │ HTTP POST /api/execute
                        ▼
┌───────────────────────────────────────────────┐
│        Orchestrator Backend (Express)         │
│  - Resource allocation & rate bounds          │
│  - Input validation & Code sanitizer          │
│  - Process supervisor & Watchdog timer        │
└───────────────────────┬───────────────────────┘
                        │ docker run ...
                        ▼
┌───────────────────────────────────────────────┐
│        Docker Security Sandbox (Alpine)       │
│  🔒 --network none      (Zero internet/SSRF)  │
│  🔒 --memory 128m       (OOM DoS protection)  │
│  🔒 --cpus 0.5          (CPU limit fairness)  │
│  🔒 --pids-limit 64     (Fork-bomb immune)    │
│  🔒 --read-only         (Immutable root FS)   │
│  🔒 Non-root user       (Unprivileged UID)    │
│  🔒 Watchdog SIGKILL    (Infinite loop kill)  │
└───────────────────────────────────────────────┘
```

---

## 🛡️ Security Features

| Constraint | Implementation | Threat Prevented |
|---|---|---|
| **Network Isolation** | `--network none` | Server-side request forgery (SSRF), port scanning, botnets, data exfiltration |
| **Memory Limit** | `--memory 128m` | Memory hogging, Out-Of-Memory host crash |
| **CPU Quota** | `--cpus 0.5` | Host starvation, cryptocurrency mining |
| **Process Limit** | `--pids-limit 64` | `fork()` bombs, excessive subprocess spawning |
| **Read-Only FS** | `--read-only` + ephemeral tmpfs | Tampering with binaries, persistence of malware |
| **Execution Watchdog** | Millisecond timer + `docker kill` | Infinite loops (`while True: pass`) |
| **Unprivileged User** | `USER sandbox` (non-root) | Container breakouts, privilege escalation |

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Docker** (Docker Desktop running)

### 2. Build the Sandbox Image
```bash
npm run build:sandbox
```

### 3. Run Both Frontend and Backend Concurrently
```bash
npm run dev
```

- **Frontend Web IDE**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Running Sandbox Security Verification

The project includes an automated security test suite that validates that memory limits, network blocking, read-only FS, and timeout kills function properly:

```bash
cd server
npm test
```

Sample output:
```
[Test 1] Standard execution & stdout test...
✅ Passed in 540ms

[Test 2] Testing stdin input stream...
✅ Passed in 566ms

[Test 3] Testing Infinite Loop / Denial-of-Service timeout...
✅ Passed: Execution safely killed after 2031ms

[Test 4] Testing Network Isolation (SSRF & exfiltration prevention)...
✅ Passed: Container has NO network access (--network none verified)

[Test 5] Testing Read-Only Filesystem tampering prevention...
✅ Passed: Root filesystem is strictly read-only
```

---

## 📡 REST API Reference

### Health Check
- **`GET /api/health`**
- Returns server status, Docker availability, and current sandbox resource caps.

### Supported Runtimes
- **`GET /api/runtimes`**
- Lists available language engines and default limits.

### Code Execution
- **`POST /api/execute`**
- **Request Body:**
  ```json
  {
    "language": "python",
    "code": "print('Hello Cloud Sandbox!')",
    "stdin": "optional input string",
    "timeoutMs": 5000
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "exitCode": 0,
    "stdout": "Hello Cloud Sandbox!\n",
    "stderr": "",
    "executionTimeMs": 420,
    "truncated": false,
    "sandbox": {
      "engine": "docker",
      "image": "cloud-sandbox-python:latest",
      "memoryLimit": "128m",
      "cpuLimit": "0.5",
      "pidsLimit": 64,
      "network": "isolated"
    }
  }
  ```
