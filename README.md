# Centralized Log Management System

This project is a Proof of Concept (PoC) for a highly scalable, multi-tenant Centralized Log Management System designed to aggregate, parse, store, and visualize log data from diverse sources including network appliances (Firewalls, Routers) and enterprise applications (Microsoft AD, AWS, CrowdStrike).

## System Architecture
The architecture is designed to handle high-throughput log ingestion and provides Role-Based Access Control (RBAC) to ensure data isolation among tenants. 
Please refer to the detailed architecture documentation: [docs/architecture.md](docs/architecture.md).

## Project Structure
The repository is divided into three primary components:
- [**Backend**](backend/README.md): Node.js/Express API responsible for log ingestion, normalization, RBAC, and OpenSearch database communication.
- [**Frontend**](frontend/README.md): React (Vite) application providing the graphical user interface for log visualization, dashboards, alerting, and Logs Explorer (Search UI).
- [**Ingest (Simulator)**](ingest/README.md): Node.js scripts designed to simulate the generation and transmission of various log formats (Syslog and HTTP JSON) for testing purposes.

## Key and Advanced Features Implemented
- **True Multi-tenant Architecture:** Logs are securely isolated into separate indices (e.g., `log-demoa`, `log-demob`) based on tenant identity. This isolation is strictly enforced via Role-Based Access Control (RBAC).
- **GeoIP Enrichment:** The ingestion pipeline automatically resolves incoming public IP addresses to their corresponding geographical locations (country and city) utilizing the `geoip-lite` database.
- **Observability and Tracing:** Custom middleware has been integrated to track API execution latency, facilitating real-time performance monitoring and algorithmic complexity analysis.
- **Continuous Integration (CI/CD):** Automated GitHub Actions workflows are configured to execute unit testing and frontend build verification upon every code commit.
- **Security Hardening:** The infrastructure is hardened with an Nginx reverse proxy, HTTPS (TLS) readiness, JWT-based authentication, and robust authorization mechanisms.

## Deployment Guides
- **Local Appliance Setup:** Instructions for deploying the system locally using Docker Compose can be found in [docs/setup_appliance.md](docs/setup_appliance.md).
- **SaaS/Cloud Deployment:** Instructions for deploying the system to a public cloud environment with HTTPS (TLS) are located in [docs/setup_saas.md](docs/setup_saas.md).
