# SaaS/Cloud Deployment Guide

This document explains how to deploy the **Log Management** system to a public Cloud Server (e.g., AWS EC2, DigitalOcean, Azure) to operate it as a SaaS (Software as a Service) platform.

## System Requirements
- **OS:** Ubuntu 22.04 LTS (or higher)
- **CPU:** Minimum 4 vCPU
- **RAM:** Minimum 8 GB
- **Disk:** Minimum 40 GB
- **Network Ports:** Ports 80 (HTTP), 443 (HTTPS), and 5141/5142 (UDP Syslog) must be allowed on the Firewall or Security Group.
- **Software:** Docker Engine and Docker Compose

---

## Deployment Steps

1. **Clone the Source Code to the Server**
   ```bash
   git clone https://github.com/your-username/log-management.git
   cd log-management
   ```

2. **Configure Environment Variables**
   Modify the `docker-compose.yml` file (or create a `.env` file) and update `JWT_SECRET` to a strong passphrase:
   ```yaml
   environment:
     - OPENSEARCH_URL=https://admin:admin@opensearch:9200
     - JWT_SECRET=P@ssw0rdSuperSecr3t2026!#RandomXYZ
   ```

3. **Start the System via Docker Compose**
   ```bash
   docker-compose up -d --build
   ```

4. **Verify Deployment**
   Check the status of all containers to ensure they are `Up`.
   ```bash
   docker-compose ps
   ```

---

## Automated Cloud Provisioning (IaC - Bonus)

If you prefer to automate the entire infrastructure setup on AWS, this project provides a complete **Terraform** configuration. Instead of manually creating an EC2 instance, you can use the Infrastructure as Code (IaC) approach.

1. Navigate to the Terraform directory:
   ```bash
   cd terraform
   ```
2. Deploy the infrastructure:
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```
   *(Type `yes` when prompted. Terraform will automatically provision an EC2 instance, configure Security Groups, install Docker, and prepare the environment in under 5 minutes.)*

---

## Secure Connection (HTTPS/TLS)

The system supports two types of security certificates:

1. **Self-signed SSL Certificate (For IP-based testing):** 
   Generated automatically during the initial Docker build. When accessing via IP, the browser will display a "Your connection is not private" warning. Accept the risk to proceed.

2. **Let's Encrypt SSL (For production domains, e.g., demo-labs.site):**
   For a complete production setup, it is highly recommended to register a domain, point the DNS A Record to the Server IP, and utilize Nginx with Certbot to obtain a free certificate.
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d logs.demo-labs.site
   ```
   This will secure your system with a fully verified green padlock.

---

## Ingesting Logs to the Cloud Server

On the Client side that needs to forward logs to the Cloud Server, replace the `127.0.0.1` IP address with the Public IP of this server:

**1. Ingestion via HTTP API (JSON):**
Use Endpoint: `https://log.demo-labs.site/api/v1/ingest`
*(Testing from local machine: `npx tsx ingest/src/simulate_logs.ts`)*

**2. Ingestion via Syslog (UDP):**
Tenant A Clients: Forward Syslog to Port `5141`
Tenant B Clients: Forward Syslog to Port `5142`
*(Testing from local machine: `npx tsx ingest/src/simulate_syslog.ts`)*
*(Ensure that these UDP ports are opened on the Cloud Provider's Firewall / Security Group)*

**3. Simulating Security Alerts (Brute-Force):**
To test the detection rules, you can run the brute-force script from your local machine:
*(Testing from local machine: `node tests/test_bruteforce.js`)*
