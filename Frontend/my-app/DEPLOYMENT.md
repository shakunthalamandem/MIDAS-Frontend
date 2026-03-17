# MIDAS Frontend - Production Deployment Documentation

## POC IT Production-Ready Deployment Guide

**Project:** MIDAS Frontend (React SPA)
**Target Domain:** trail2.goldenhillsindia.com
**Infrastructure:** Docker + Nginx + Nginx Proxy Manager + Let's Encrypt SSL
**Date:** March 2026
**Previous Setup:** IIS Server with FastCGI Module (decommissioned)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Project File Structure](#3-project-file-structure)
4. [File Configurations](#4-file-configurations)
5. [Deployment Steps](#5-deployment-steps)
6. [SSL Certificate Setup](#6-ssl-certificate-setup)
7. [DNS Configuration](#7-dns-configuration)
8. [Decommission IIS](#8-decommission-iis)
9. [Verification & Testing](#9-verification--testing)
10. [Maintenance & Operations](#10-maintenance--operations)
11. [Troubleshooting](#11-troubleshooting)
12. [Rollback Procedure](#12-rollback-procedure)

---

## 1. Architecture Overview

```
Internet
   |
   v
[DNS: *.goldenhillsindia.com -> Static IP]
   |
   v
[Nginx Proxy Manager (Docker)]
   |--- Port 80  (HTTP -> redirects to HTTPS)
   |--- Port 443 (HTTPS with Let's Encrypt SSL)
   |--- Port 81  (Admin Panel - internal only)
   |
   v
[MIDAS Frontend Container (Docker)]
   |--- Port 3080 (mapped) -> Port 80 (internal Nginx)
   |--- Serves React SPA build
   |
   v
[MIDAS Backend API]
   |--- https://midasbacktest.goldenhillsindia.com
```

### Container Network Flow

```
User Browser
  --> https://trail2.goldenhillsindia.com
    --> Nginx Proxy Manager (port 443, SSL termination)
      --> midas-frontend container (port 3080)
        --> Nginx serves React SPA
          --> Browser makes API calls to midasbacktest.goldenhillsindia.com
```

---

## 2. Prerequisites

### System Requirements

| Component           | Requirement                    | Current Setup        |
|---------------------|--------------------------------|----------------------|
| Operating System    | Windows Server / Windows 10+   | Windows (32 GB RAM)  |
| Docker              | Docker Desktop for Windows     | Installed            |
| RAM Allocation      | Minimum 8 GB for Docker        | 8 GB allocated       |
| Static IP           | Required for DNS               | Already configured   |
| Domain              | Wildcard DNS configured        | *.goldenhillsindia.com (GoDaddy) |

### Software Requirements

- Docker Desktop for Windows (latest)
- PowerShell (Administrator access)
- Git (for version control)

### Network Requirements

| Port | Protocol | Purpose                        | Direction |
|------|----------|--------------------------------|-----------|
| 80   | TCP      | HTTP (Let's Encrypt validation) | Inbound   |
| 443  | TCP      | HTTPS (Production traffic)      | Inbound   |
| 81   | TCP      | NPM Admin Panel (local only)    | Local     |
| 3080 | TCP      | Frontend container (internal)   | Internal  |

---

## 3. Project File Structure

```
C:\Users\StockPulse\Desktop\MIDAS\
|
|-- MIDAS-Frontend\
|   |-- Frontend\
|       |-- my-app\
|           |-- Dockerfile              # Multi-stage Docker build
|           |-- .dockerignore           # Docker build exclusions
|           |-- nginx.conf              # Nginx server config (inside container)
|           |-- .env                    # Environment variables (baked at build)
|           |-- package.json            # Node.js dependencies
|           |-- src\                    # React source code
|           |-- public\                 # Static public assets
|           |-- DEPLOYMENT.md           # This file
|
|-- proxy\
    |-- docker-compose.yml              # Nginx Proxy Manager compose
    |-- data\                           # NPM persistent data (auto-created)
    |-- letsencrypt\                    # SSL certificates (auto-created)
```

---

## 4. File Configurations

### 4.1 Dockerfile

**Location:** `MIDAS-Frontend/Frontend/my-app/Dockerfile`

```dockerfile
# Stage 1: Build the React app
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Increase Node memory limit for large builds (8 GB)
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Build the production bundle
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy the build output to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Key Notes:**
- Multi-stage build: Stage 1 builds React, Stage 2 serves with Nginx
- `--max-old-space-size=8192` is required because the MIDAS React app is large (55+ dependencies, heavy charting libraries) and runs out of memory with default 1.5 GB heap
- `--legacy-peer-deps` is required due to dependency conflicts in the project
- Final image is lightweight (Nginx Alpine only, no Node.js)

---

### 4.2 .dockerignore

**Location:** `MIDAS-Frontend/Frontend/my-app/.dockerignore`

```
node_modules
build
.env.local
.env.development.local
.env.test.local
.env.production.local
npm-debug.log*
.git
.gitignore
```

**Key Notes:**
- `node_modules` is excluded so `npm ci` runs fresh inside the container
- `build` is excluded as it gets generated inside the container
- `.env` (production) is NOT excluded -- it is included in the build context
- Local environment overrides are excluded

---

### 4.3 nginx.conf (Container Internal)

**Location:** `MIDAS-Frontend/Frontend/my-app/nginx.conf`

```nginx
server {
    listen 80;
    server_name midastest.goldenhillsindia.com;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression for better performance
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Key Notes:**
- This is the Nginx config INSIDE the frontend container (not the proxy)
- Gzip is enabled for all text-based content types
- Static assets (JS, CSS, images, fonts) are cached for 1 year with immutable flag
- SPA fallback ensures all React Router paths serve `index.html`
- `server_name` can be updated to match the target subdomain if needed

---

### 4.4 .env (Environment Variables)

**Location:** `MIDAS-Frontend/Frontend/my-app/.env`

```env
# ---------- Production ----------
REACT_APP_API_URL=https://midasbacktest.goldenhillsindia.com
REACT_APP_MATTERMOST_ORIGIN=https://midaschat.goldenhillsindia.com
REACT_APP_MATTERMOST_TEAM=midas
REACT_APP_DEFAULT_CHANNEL=town-square
REACT_APP_COOKIE_DOMAIN=.goldenhillsindia.com
```

**IMPORTANT:** React environment variables prefixed with `REACT_APP_` are baked into the build at compile time. They are NOT runtime variables. Any change to these values requires a full rebuild of the Docker image.

| Variable | Purpose |
|----------|---------|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_MATTERMOST_ORIGIN` | Mattermost chat server URL |
| `REACT_APP_MATTERMOST_TEAM` | Mattermost team slug |
| `REACT_APP_DEFAULT_CHANNEL` | Default Mattermost channel |
| `REACT_APP_COOKIE_DOMAIN` | Cookie domain (dot-prefixed for all subdomains) |

---

### 4.5 docker-compose.yml (Nginx Proxy Manager)

**Location:** `MIDAS/proxy/docker-compose.yml`

```yaml
version: "3"
services:
  nginx-proxy-manager:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy-manager
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
```

**Key Notes:**
- Port 80: HTTP traffic + Let's Encrypt challenge validation
- Port 443: HTTPS traffic (SSL terminated here)
- Port 81: Admin panel (restrict to localhost in production firewall)
- Volumes persist config and SSL certificates across restarts
- `restart: unless-stopped` ensures auto-recovery after system reboots
- The `version: "3"` attribute is deprecated but harmless

---

## 5. Deployment Steps

### Step 1: Build the Frontend Docker Image

```powershell
cd C:\Users\StockPulse\Desktop\MIDAS\MIDAS-Frontend\Frontend\my-app

docker build -t midas-frontend .
```

**Expected output:** Build completes in ~4-5 minutes. The `npm run build` step will use up to 8 GB of memory.

**If build fails with heap out of memory:** Ensure the Dockerfile has:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=8192"
```

---

### Step 2: Run the Frontend Container

```powershell
docker run -d --name midas-frontend -p 3080:80 --restart unless-stopped midas-frontend
```

| Flag | Purpose |
|------|---------|
| `-d` | Run in detached (background) mode |
| `--name midas-frontend` | Container name for easy reference |
| `-p 3080:80` | Map host port 3080 to container port 80 |
| `--restart unless-stopped` | Auto-restart on crash or system reboot |

**Verify the container is running:**

```powershell
docker ps
```

**Quick test (local):**

Open `http://localhost:3080` in your browser. You should see the MIDAS frontend.

---

### Step 3: Start Nginx Proxy Manager

```powershell
cd C:\Users\StockPulse\Desktop\MIDAS\proxy

docker compose up -d
```

**Verify:**

```powershell
docker ps
```

You should see both containers running:
- `midas-frontend` on port 3080
- `nginx-proxy-manager` on ports 80, 443, 81

---

### Step 4: Configure Nginx Proxy Manager

#### 4a. Access Admin Panel

1. Open browser: `http://localhost:81`
2. Login with default credentials:
   - **Email:** `admin@example.com`
   - **Password:** `changeme`
3. You will be prompted to set a new email and password immediately

#### 4b. Add Proxy Host

1. Click **"Proxy Hosts"** in the left sidebar
2. Click **"Add Proxy Host"** (green button, top right)
3. Fill in the **Details** tab:

| Field | Value |
|-------|-------|
| Domain Names | `trail2.goldenhillsindia.com` (type and press Enter) |
| Scheme | `http` |
| Forward Hostname / IP | `host.docker.internal` |
| Forward Port | `3080` |
| Block Common Exploits | Enabled (toggle on) |
| Cache Assets | Optional (toggle on for performance) |
| Websockets Support | Optional (toggle on if needed) |

4. Click **Save** (without SSL first to verify proxy works)

> **Note:** If `host.docker.internal` does not work, find your machine's local IP:
> ```powershell
> ipconfig
> ```
> Use the IPv4 address from your active network adapter (e.g., `192.168.x.x` or `10.0.0.x`)

#### 4c. Verify HTTP Access

Open `http://trail2.goldenhillsindia.com` in your browser. The MIDAS frontend should load.

If it does NOT load, check:
- DNS resolution: `nslookup trail2.goldenhillsindia.com`
- Firewall: Ensure port 80 is open inbound
- Container status: `docker ps`

---

## 6. SSL Certificate Setup

### Prerequisites for SSL

Before requesting an SSL certificate, ensure:

1. **DNS resolves correctly:**
   ```powershell
   nslookup trail2.goldenhillsindia.com
   ```
   Must return your server's static public IP.

2. **Port 80 is reachable from the internet:**
   Let's Encrypt uses HTTP-01 challenge (connects to your server on port 80).

3. **Windows Firewall allows inbound 80 and 443:**
   ```powershell
   # Run as Administrator
   New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
   New-NetFirewallRule -DisplayName "Allow HTTPS" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow
   ```

4. **IIS is stopped** (it holds port 80):
   ```powershell
   # Run as Administrator
   iisreset /stop
   Set-Service -Name W3SVC -StartupType Disabled
   ```

5. **Router port forwarding** (if behind NAT):
   - External port 80 -> Internal IP -> port 80
   - External port 443 -> Internal IP -> port 443

### Request SSL Certificate

1. In Nginx Proxy Manager, go to **Proxy Hosts**
2. Click the **three dots** on `trail2.goldenhillsindia.com` -> **Edit**
3. Go to the **SSL** tab
4. Select **"Request a new SSL Certificate"**
5. Enable:
   - **Force SSL** (redirects HTTP to HTTPS)
   - **I Agree to the Let's Encrypt Terms of Service**
6. Enter your email for Let's Encrypt notifications
7. Click **Save**

### Rate Limiting Warning

Let's Encrypt has rate limits:
- **5 failed authorization attempts** per domain per hour
- If you exceed this, you must wait for the cooldown period
- Always verify HTTP access works BEFORE requesting SSL
- Check logs if SSL fails: `docker logs nginx-proxy-manager --tail 100`

---

## 7. DNS Configuration

### Current Setup (GoDaddy)

- **Domain:** goldenhillsindia.com
- **DNS Type:** Wildcard A Record
- **Record:** `*.goldenhillsindia.com` -> `[Your Static IP]`

This allows any subdomain (trail2, midastest, etc.) to resolve to the same server. Nginx Proxy Manager handles routing to the correct container based on the domain name.

### Verify DNS

```powershell
# Check DNS resolution
nslookup trail2.goldenhillsindia.com

# Check public IP of this server
curl ifconfig.me
```

Both must return the **same IP address**.

### Adding New Subdomains

To deploy additional apps on new subdomains:
1. No DNS changes needed (wildcard covers all subdomains)
2. Deploy the new app as a Docker container on a unique port
3. Add a new Proxy Host in Nginx Proxy Manager for the subdomain
4. Request SSL certificate for the new subdomain

---

## 8. Decommission IIS

After verifying Docker deployment works:

```powershell
# Run PowerShell as Administrator

# Stop IIS
iisreset /stop

# Disable IIS from auto-starting
Set-Service -Name W3SVC -StartupType Disabled

# Verify IIS is stopped
Get-Service W3SVC
```

**Expected output:**
```
Status   Name               DisplayName
------   ----               -----------
Stopped  W3SVC              World Wide Web Publishing Service
```

> **WARNING:** Do not uninstall IIS immediately. Keep it disabled for at least 2 weeks as a rollback option.

---

## 9. Verification & Testing

### Checklist

| # | Check | Command / Action | Expected Result |
|---|-------|------------------|-----------------|
| 1 | Containers running | `docker ps` | Both containers show "Up" status |
| 2 | Frontend local access | `http://localhost:3080` | MIDAS app loads |
| 3 | NPM admin panel | `http://localhost:81` | Admin panel loads |
| 4 | DNS resolution | `nslookup trail2.goldenhillsindia.com` | Returns your static IP |
| 5 | HTTP access | `http://trail2.goldenhillsindia.com` | App loads (redirects to HTTPS if SSL enabled) |
| 6 | HTTPS access | `https://trail2.goldenhillsindia.com` | App loads with valid SSL cert |
| 7 | API connectivity | Open browser DevTools -> Network tab | API calls to midasbacktest succeed (200) |
| 8 | SPA routing | Navigate to any route and refresh | Page loads (no 404) |
| 9 | Static assets | Check DevTools -> Network | CSS/JS/images load with cache headers |
| 10 | Mattermost | Test chat feature in app | Connects to midaschat server |

---

## 10. Maintenance & Operations

### Common Commands

```powershell
# --- Container Management ---

# Check running containers
docker ps

# Check all containers (including stopped)
docker ps -a

# View frontend logs
docker logs midas-frontend --tail 100

# View proxy manager logs
docker logs nginx-proxy-manager --tail 100

# Restart frontend
docker restart midas-frontend

# Restart proxy manager
docker restart nginx-proxy-manager

# Stop frontend
docker stop midas-frontend

# Stop proxy manager
cd C:\Users\StockPulse\Desktop\MIDAS\proxy
docker compose down
```

### Rebuilding After Code Changes

When frontend code is updated:

```powershell
cd C:\Users\StockPulse\Desktop\MIDAS\MIDAS-Frontend\Frontend\my-app

# Stop and remove old container
docker stop midas-frontend
docker rm midas-frontend

# Rebuild image (no cache if dependencies changed)
docker build -t midas-frontend .
# OR force full rebuild:
docker build --no-cache -t midas-frontend .

# Start new container
docker run -d --name midas-frontend -p 3080:80 --restart unless-stopped midas-frontend
```

### Updating Environment Variables

Since React bakes env vars at build time:

1. Edit `.env` file with new values
2. Rebuild the Docker image (full rebuild required)
3. Replace the container

```powershell
# Edit .env, then:
docker stop midas-frontend && docker rm midas-frontend
docker build --no-cache -t midas-frontend .
docker run -d --name midas-frontend -p 3080:80 --restart unless-stopped midas-frontend
```

### SSL Certificate Renewal

Let's Encrypt certificates auto-renew via Nginx Proxy Manager. No manual action needed. Certificates are valid for 90 days and renew automatically 30 days before expiry.

### Backup

Critical data to back up:

| Path | Contents |
|------|----------|
| `C:\Users\StockPulse\Desktop\MIDAS\proxy\data\` | NPM configuration, proxy hosts, users |
| `C:\Users\StockPulse\Desktop\MIDAS\proxy\letsencrypt\` | SSL certificates |
| `C:\Users\StockPulse\Desktop\MIDAS\MIDAS-Frontend\Frontend\my-app\.env` | Environment variables |

---

## 11. Troubleshooting

### Build Fails: JavaScript Heap Out of Memory

```
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Fix:** Ensure the Dockerfile has:
```dockerfile
ENV NODE_OPTIONS="--max-old-space-size=8192"
```

System requires at least 8 GB available RAM during build.

---

### SSL Certificate Request Fails: "Some challenges have failed"

**Cause:** Let's Encrypt cannot reach your server on port 80.

**Diagnosis:**
```powershell
# Check what's using port 80
netstat -ano | findstr ":80 "

# Check if IIS is running
Get-Service W3SVC

# Check firewall
Get-NetFirewallRule -Direction Inbound | Where-Object { $_.Enabled -eq 'True' } | Get-NetFirewallPortFilter | Where-Object { $_.LocalPort -eq 80 }

# Check public IP matches DNS
curl ifconfig.me
nslookup trail2.goldenhillsindia.com
```

**Fixes:**
- Stop IIS: `iisreset /stop` (as Administrator)
- Open firewall: `New-NetFirewallRule -DisplayName "Allow HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow`
- Configure router port forwarding (if behind NAT)

---

### SSL Rate Limited: "too many failed authorizations"

```
too many failed authorizations (5) for "trail2.goldenhillsindia.com" in the last 1h0m0s
```

**Fix:** Wait for the cooldown period (1 hour from last attempt). Fix the underlying port/firewall issue BEFORE retrying.

---

### 502 Bad Gateway

**Cause:** Nginx Proxy Manager cannot reach the frontend container.

**Diagnosis:**
```powershell
# Check frontend container is running
docker ps | findstr midas-frontend

# Test local access
curl http://localhost:3080
```

**Fix:**
- If container is not running: `docker start midas-frontend`
- If using `host.docker.internal` and it fails, use the machine's actual IP in the proxy host config

---

### Domain Name "Already in Use" Error

**Cause:** A proxy host with that domain already exists.

**Fix:** Delete or edit the existing proxy host entry in NPM admin panel before creating a new one.

---

### Site Not Loading (Blank Page or Connection Timeout)

**Step-by-step diagnosis:**

1. Check containers: `docker ps`
2. Check local access: `http://localhost:3080`
3. Check DNS: `nslookup trail2.goldenhillsindia.com`
4. Check firewall: ports 80/443 open inbound
5. Check NPM logs: `docker logs nginx-proxy-manager --tail 50`
6. Check frontend logs: `docker logs midas-frontend --tail 50`

---

### API Calls Failing (CORS Error)

If the frontend loads but API calls fail with CORS errors:

**Cause:** Backend CORS configuration does not include the new domain.

**Fix:** Add `trail2.goldenhillsindia.com` to the backend's CORS allowed origins.

---

## 12. Rollback Procedure

If the Docker deployment fails and you need to go back to IIS:

```powershell
# Run as Administrator

# Step 1: Stop Docker containers
docker stop midas-frontend
docker stop nginx-proxy-manager

# Step 2: Re-enable and start IIS
Set-Service -Name W3SVC -StartupType Automatic
iisreset /start

# Step 3: Verify IIS is running
Get-Service W3SVC
```

The previous IIS configuration should still be intact if IIS was only stopped (not uninstalled).

---

## Appendix: Quick Reference Commands

```powershell
# ====== FULL DEPLOYMENT FROM SCRATCH ======

# 1. Build frontend
cd C:\Users\StockPulse\Desktop\MIDAS\MIDAS-Frontend\Frontend\my-app
docker build -t midas-frontend .

# 2. Run frontend container
docker run -d --name midas-frontend -p 3080:80 --restart unless-stopped midas-frontend

# 3. Start proxy manager
cd C:\Users\StockPulse\Desktop\MIDAS\proxy
docker compose up -d

# 4. Configure proxy via http://localhost:81
#    - Add proxy host: trail2.goldenhillsindia.com -> host.docker.internal:3080
#    - Add SSL certificate (after verifying HTTP works)

# 5. Stop IIS (Run as Administrator)
iisreset /stop
Set-Service -Name W3SVC -StartupType Disabled

# 6. Verify
# http://trail2.goldenhillsindia.com  (should load)
# https://trail2.goldenhillsindia.com (should load with SSL)
```

---

**Document Version:** 1.0
**Last Updated:** March 13, 2026
**Author:** MIDAS DevOps Team
**System:** Windows Production Server (32 GB RAM, Static IP)
