# Ingest Simulator Service

This directory contains Node.js scripts designed specifically for Data Seeding and Testing. These scripts simulate the generation of log data from various external systems.

## Scripts Overview

### HTTP Simulator (`simulate_logs.ts`)
Simulates application and cloud infrastructure logs (e.g., AWS IAM actions, CrowdStrike malware detections, Microsoft AD login events).
- Authenticates with the Backend API to retrieve a JWT.
- Transmits standardized JSON payloads via HTTP POST.

### Syslog Simulator (`simulate_syslog.ts`)
Simulates network appliance logs (e.g., Cisco/Palo Alto Firewall traffic logs).
- Encodes log data into the standard Syslog format.
- Transmits the data directly via UDP sockets to ports 5141 and 5142, simulating multi-tenant physical infrastructure separation.

## Usage

```bash
npm install

# Run the HTTP JSON Simulator
npm run http

# Run the UDP Syslog Simulator
npm run syslog
```
