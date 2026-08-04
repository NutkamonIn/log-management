# Local Appliance Setup Guide

This document provides instructions for installing and running the Log Management system as a local appliance or on a single virtual machine. It is designed for Proof of Concept (PoC) testing and local development.

## Prerequisites
- **Operating System:** Ubuntu 22.04 LTS or higher (Recommended for Appliance deployment)
- **CPU:** Minimum 4 vCPU
- **Memory:** Minimum 8 GB RAM
- **Storage:** Minimum 40 GB Disk Space
- **Network Ports:** Ensure the following ports are open on the firewall: 80 (HTTP), 443 (HTTPS), 5141/5142 (UDP Syslog)
- **Software:** Docker Engine and Docker Compose (Node.js is optional if only running containers)

## Installation and Execution

The deployment process has been automated via batch scripts to streamline the Developer Experience.

1. **Navigate to the project directory:**
   Open PowerShell or Command Prompt and execute:
   ```powershell
   cd path/to/log-management
   ```

2. **Start the system:**
   ```powershell
   .\start.bat
   ```
   *This command builds the necessary Docker images and initializes all services. Wait until the output indicates that the system is running.*

3. **Service Initialization:**
   OpenSearch requires approximately 30 seconds to fully initialize. The Backend service is configured to wait for OpenSearch readiness before commencing operations.

4. **Accessing the Services:**
   - **Frontend UI (Dashboard & Logs Explorer):** `http://localhost`
   - **Backend API:** `http://localhost:8000`
   - **OpenSearch (Raw Access):** `http://localhost:9200`
   - **OpenSearch Dashboards:** `http://localhost:5601`

   *Note: API execution traces (Observability metrics) can be observed directly in the backend terminal output.*

   *Authentication Credentials:*
   - Administrator: `admin` / `adminpassword`
   - Tenant A Viewer: `viewer_demoa` / `viewer123`
   - Tenant B Viewer: `viewer_demob` / `viewer123`

---

## Data Seeding

To demonstrate the capabilities of the Dashboard, sample data must be ingested into the system.

1. **HTTP API Ingestion (JSON):**
   ```powershell
   cd ingest
   npm install
   npm run http
   ```
   *This script simulates log generation from CrowdStrike, AWS, Microsoft AD, and Custom APIs.*

2. **Syslog Ingestion (UDP 5141/5142):**
   ```powershell
   cd ingest
   npm run syslog
   ```
   *This script simulates network traffic logs transmitted via the Syslog protocol.*

---

## System Teardown

- **Stop Services:** 
  ```powershell
  .\stop.bat
  ```
  *(Halts the containers while preserving OpenSearch data volumes.)*

- **Clean Database:** 
  ```powershell
  .\clean.bat
  ```
  *(Permanently removes all OpenSearch data volumes. Use this command to reset the system to a clean state.)*
