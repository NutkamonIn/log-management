# Log Management Architecture

This document describes the system architecture and data flow of the Log Management system.

## Architecture Diagram

```mermaid
graph TD
    %% Users & Sources
    subgraph Log Sources
        syslog[Firewall/Router<br/>UDP Syslog 5141/5142]
        api_log[CrowdStrike/AD/AWS<br/>HTTP POST JSON]
    end

    subgraph Frontend Application
        ui[React + Vite UI<br/>Dashboard & Alerts]
        nginx[Nginx Reverse Proxy<br/>Port 80/443]
    end

    subgraph Backend Services
        express[Node.js Express API<br/>Observability Middleware]
        parser[Parser & Enrichment<br/>Standard Schema + GeoIP]
        cron[Cron Jobs<br/>Alerts & Retention]
    end

    subgraph Storage
        os[OpenSearch<br/>Port 9200]
        osd[OpenSearch Dashboards<br/>Port 5601]
    end

    %% Flow - Ingestion
    syslog -->|UDP Socket| express
    api_log -->|POST /api/v1/ingest| express
    
    express --> parser
    parser -->|Index: log-{tenant}| os

    %% Flow - Query & UI
    ui -->|HTTP/HTTPS| nginx
    nginx -->|Reverse Proxy| express
    express -->|Search Query| os
    osd -.->|Direct Admin Access| os
    
    %% Cron Jobs
    cron -->|Check Thresholds| os
```

## Data Flow

1. **Ingestion Layer**
   - The system receives log data through two primary channels:
     - **Syslog (UDP):** Network devices transmit data to ports 5141/5142. The Backend service opens UDP sockets and associates incoming traffic with specific tenants based on the designated port.
     - **HTTP POST:** Software systems (e.g., AWS, Microsoft Active Directory, CrowdStrike) transmit JSON payloads to the `/api/v1/ingest` endpoint.
2. **Normalization & Enrichment Layer**
   - All incoming logs are processed by the Parser Service. This service normalizes diverse log formats into a Central Schema, ensuring the presence of mandatory fields such as `@timestamp, tenant, event_type, source, user, src_ip`.
   - **Enrichment:** The system automatically resolves the `src_ip` against a GeoIP database (`geoip-lite`) to append contextual country and city information to the log payload.
   - **Observability:** An Express middleware tracks the execution latency of every API request (e.g., measuring Big-O time complexity in real-world scenarios) and logs slow transactions.
3. **Storage Layer (True Multi-tenant Architecture)**
   - The Backend identifies the tenant associated with each log and stores the data in OpenSearch. To ensure strict data isolation and security, the system utilizes dynamic indexing based on the tenant identifier (e.g., `log-demoa`, `log-demob`).
4. **Query & Visualization Layer**
   - Users access the system via a React-based Frontend interface.
   - The system implements Role-Based Access Control (RBAC). If a user is authenticated as a `viewer` for `demoA`, the Backend restricts search queries strictly to the `log-demoa` index, thereby preventing unauthorized access to cross-tenant data.
5. **Background Jobs**
   - **Alerting Cron:** Executes every minute to evaluate database records against predefined security thresholds (e.g., login_failed > 5 attempts). Violations are recorded as alerts in the database.
   - **Retention Cron:** Executes daily at midnight to purge logs older than 7 days, optimizing storage utilization and complying with data retention policies.