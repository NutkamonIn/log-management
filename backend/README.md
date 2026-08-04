# Backend Service

The Backend Service is the core logic tier of the Log Management System. It is built with Node.js, Express, and TypeScript.

## Core Responsibilities
1. **Log Ingestion:** Exposes an HTTP POST endpoint (`/api/v1/ingest`) for application logs and maintains active UDP sockets for receiving Syslog traffic.
2. **Parser & Normalization:** Standardizes disparate log structures into a unified schema before storage.
3. **Database Operations:** Communicates with OpenSearch for data indexing and retrieval. It implements dynamic indexing (`log-{tenant}`) to ensure strict multi-tenant isolation.
4. **Authentication & Authorization:** Issues JWT tokens and enforces Role-Based Access Control (RBAC).
5. **Background Processes:** Executes periodic cron jobs for threshold alerting and data retention compliance.

## Development Setup

```bash
npm install
npm run dev
```

## Testing
The backend utilizes `vitest` and `supertest` for unit and integration testing.
```bash
npm run test
```
