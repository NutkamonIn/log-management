# Local Appliance Setup Guide

This document explains how to install and run the Log Management system as a local appliance or on a single virtual machine. It is ideal for Proof of Concept (PoC) testing and development.

## Prerequisites

- **Operating System:** Ubuntu 22.04 LTS or higher (recommended for appliance setup)
- **CPU:** Minimum 4 vCPU
- **Memory:** Minimum 8 GB RAM
- **Storage:** Minimum 40 GB
- **Network Ports:** Ports 80 (HTTP), 443 (HTTPS), and 5141/5142 (UDP Syslog) must be open on the firewall.
- **Software:** Docker Engine and Docker Compose (Node.js is not required if running entirely via containers).

## Installation and Execution

The deployment process has been automated via batch scripts to enhance the developer experience.

1. **Navigate to the Project Directory:**
   Open PowerShell or Command Prompt and enter:
   ```powershell
   cd path/to/log-management
   ```

2. **Start the System:**
   ```powershell
   .\start.bat
   ```
   *This command will build the Docker images and start all services. Please wait until the system displays the "System is running!" notification.*

3. **Service Initialization:**
   OpenSearch requires approximately 30 seconds to fully initialize. The backend service is configured to wait until OpenSearch is healthy before starting other processes.

4. **Accessing the System:**
   - **Frontend UI (Dashboard & Logs Explorer):** `http://localhost` or `https://localhost` (Accept the self-signed certificate warning)
   - **Backend API:** `http://localhost:8000`
   - **OpenSearch (Raw Access):** `http://localhost:9200`
   - **OpenSearch Dashboards:** `http://localhost:5601`

   *Note: API call latency (observability metrics) can be monitored in the backend terminal window.*

   *Authentication Credentials:*
   - Administrator: `admin` / `adminpassword`
   - Tenant A Viewer: `viewer_demoa` / `viewer123`
   - Tenant B Viewer: `viewer_demob` / `viewer123`

---

## Data Seeding

To test the dashboard functionality, sample data must be seeded into the system.

1. **Simulating Data via HTTP API (JSON):**
   ```powershell
   npx tsx ingest/src/simulate_logs.ts local
   ```
   *This script simulates log generation from CrowdStrike, AWS, Microsoft AD, and custom APIs.*

2. **Simulating Data via Syslog (UDP 5141/5142):**
   ```powershell
   npx tsx ingest/src/simulate_syslog.ts local
   ```
   *This script simulates network traffic transmitted via the Syslog protocol.*

3. **Simulating Brute-Force Attack (Security Alert Trigger):**
   ```powershell
   node tests/test_bruteforce.js local
   ```
   *This script performs a rapid brute-force attack simulation to trigger the Security Alerts page.*

---

## System Teardown

- **Stop all services:**
  ```powershell
  .\stop.bat
  ```
  *(Stops the containers while retaining data in OpenSearch)*

- **Wipe database:**
  ```powershell
  .\clean.bat
  ```
  *(Permanently deletes all OpenSearch volumes. Use this to reset the system to its initial state)*
