# Centralized Log Management System

This project is a Proof of Concept (PoC) for a Centralized Log Management system that supports Multi-tenant architecture and high Scalability. It is designed to collect, normalize, store, and visualize log data from various sources, including network devices (Firewalls, Routers) and enterprise applications (Microsoft AD, AWS, CrowdStrike).

## System Architecture
The architecture is designed to handle high-throughput log ingestion and features Role-Based Access Control (RBAC) to ensure strict data isolation between tenants.
For detailed architectural documentation, please refer to: [docs/architecture.md](docs/architecture.md)

## Project Structure
The repository is divided into three main components:
- [**Backend**](backend/README.md): A Node.js/Express API responsible for log ingestion, data normalization, RBAC, and OpenSearch database integration.
- [**Frontend**](frontend/README.md): A React (Vite) application providing the Graphical User Interface (GUI), including the dashboard, alerting system, and Logs Explorer.
- [**Ingest (Simulator)**](ingest/README.md): Node.js scripts for simulating and transmitting various log formats (Syslog and HTTP JSON) for testing purposes.

## Key Features & Advanced Capabilities
- **True Multi-tenant Architecture:** Log data is securely isolated into different indices (e.g., `log-demoa`, `log-demob`) based on tenant identity. This isolation is strictly enforced through Role-Based Access Control (RBAC).
- **GeoIP Enrichment:** The ingestion pipeline automatically resolves Public IP Addresses to geographic locations (country and city) using the `geoip-lite` database.
- **Observability and Tracing:** Middleware is implemented to measure and track API execution latency, enabling real-time performance monitoring and algorithm time complexity analysis.
- **Dynamic Field Extraction:** The system scans the JSON structure of incoming logs, identifies variable types (String, Number, IP), and dynamically presents them as selectable columns and filters (Schema-less Log Explorer).
- **Time Range Filtering:** Users can accurately filter data and visualize Histograms based on specific time ranges (e.g., Last 15 minutes, 1 hour, 24 hours) for retroactive traffic analysis.
- **Continuous Integration (CI/CD):** GitHub Actions are configured to run automated Unit Tests and Frontend build checks upon every code modification.
- **Security Hardening:** The infrastructure is protected by an Nginx Reverse Proxy, supports HTTPS (TLS) encryption, utilizes JWT authentication, and implements robust authorization mechanisms.

## Deployment Guides
- **Local Appliance Setup:** Instructions for installing and running the system locally via Docker Compose can be found at [docs/setup_appliance.md](docs/setup_appliance.md)
- **SaaS/Cloud Deployment:** Instructions for deploying the system to a public cloud provider with HTTPS (TLS) configuration can be found at [docs/setup_saas.md](docs/setup_saas.md)
