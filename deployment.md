# Production Deployment Manual

This guide provides step-by-step instructions for deploying and running this application in a production environment. It covers all major hosting methods: VPS, Ubuntu, Windows Server, PM2, Docker, Nginx proxy, and Local Networks.

---

## Table of Contents
1. [Environment Setup](#1-environment-setup)
2. [Hosting on Ubuntu VPS / Server](#2-hosting-on-ubuntu-vps--server)
3. [Hosting with PM2 (Process Manager)](#3-hosting-with-pm2-process-manager)
4. [Nginx Reverse Proxy & SSL Setup](#4-nginx-reverse-proxy--ssl-setup)
5. [Hosting with Docker & Compose](#5-hosting-with-docker--compose)
6. [Hosting on Windows Server](#6-hosting-on-windows-server)
7. [Local Area Network (LAN) Hosting (192.168.x.x)](#7-local-area-network-lan-hosting-192168xx)

---

## 1. Environment Setup

Copy the example environment configurations and populate them with production details:

### Backend Configuration
```bash
cd backend
cp .env.example .env
```
Ensure you configure:
- `PORT`: Production API port (e.g., `5000`)
- `MONGO_URI` / `MONGO_URL` / `DATABASE_URL`: Production database URL
- `JWT_SECRET`: A long, random string
- `CORS_ORIGIN`: Your frontend domain (e.g., `https://my-app.com` or `*` for testing)
- `FRONTEND_URL`: URL to redirect users back to after payment callbacks
- `API_URL`: Fully qualified address of the API (or leave blank to resolve dynamically)

### Frontend Configuration
```bash
cd ../frontend
cp .env.example .env
```
Ensure you configure:
- `VITE_API_URL`: The API endpoint URL (e.g., `https://api.my-app.com`)

---

## 2. Hosting on Ubuntu VPS / Server

### Prerequisites
Update packages, install Node.js (v20+), Git, and MongoDB (if self-hosting):

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx
```

### Seeding & Running Backend
```bash
cd backend
npm install --omit=dev
# Seed the initial services if required (e.g. node seed.js)
npm start
```

### Building Frontend
```bash
cd ../frontend
npm install
npm run build
```
This generates the optimized production build in the `dist` directory. Nginx will serve this static folder.

---

## 3. Hosting with PM2 (Process Manager)

PM2 keeps your Node.js application running in the background and restarts it on crashes or system reboot.

### Install PM2 Globally
```bash
sudo npm install -g pm2
```

### Launch Backend
Create a `ecosystem.config.json` inside the `backend` folder:
```json
{
  "apps": [
    {
      "name": "saasproject-backend",
      "script": "server.js",
      "instances": "max",
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

Start the application:
```bash
cd backend
pm2 start ecosystem.config.json
```

### PM2 Autostart (On System Reboot)
```bash
pm2 startup
pm2 save
```

---

## 4. Nginx Reverse Proxy & SSL Setup

Configure Nginx to serve the React frontend static pages and reverse proxy `/api` requests to the Express backend.

### Configure Nginx Server Block
Create `/etc/nginx/sites-available/saasproject`:
```nginx
server {
    listen 80;
    server_name my-app.com www.my-app.com;

    # React Frontend static assets
    location / {
        root /var/www/saasproject/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Express Backend proxy
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and reload:
```bash
sudo ln -s /etc/nginx/sites-available/saasproject /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Secure with SSL (Let's Encrypt Certbot)
```bash
sudo apt install snapd
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot --nginx -d my-app.com -d www.my-app.com
```

---

## 5. Hosting with Docker & Compose

This runs the entire app (frontend, backend, database) in isolated containers with zero software prerequisites on the host machine other than Docker.

### Building & Launching
Ensure you have Docker and Docker Compose installed. From the project root, run:
```bash
docker compose up -d --build
```
- **Database** runs inside container on port `27017`
- **Backend API** runs on port `5000`
- **Frontend App** is built and served via Nginx on port `8080` (accessible at `http://localhost:8080`)

---

## 6. Hosting on Windows Server

Windows Server can run the application natively using Node.js and IIS or Nginx.

### Steps
1. Install **Node.js for Windows** (LTS version).
2. Install **Git** and **MongoDB** (or use Atlas).
3. Open PowerShell as Admin and set up the directories.
4. Clone the project, run `npm install` in both `backend` and `frontend`.
5. Build the frontend (`npm run build`).
6. Run the backend with PM2 for Windows:
   ```powershell
   npm install -g pm2
   cd backend
   pm2 start server.js --name backend
   pm2 save
   ```
7. To run Nginx on Windows:
   - Download Nginx for Windows.
   - Configure Nginx in `nginx.conf` identical to the server block in Section 4.
   - Run `nginx.exe`.

---

## 7. Local Area Network (LAN) Hosting (192.168.x.x)

To deploy the app on a local office/gym network so other devices can access it via a local IP (e.g., `http://192.168.1.10:8080`):

### Find local IP Address
- **Ubuntu/Linux**: Run `ip a` or `ifconfig`
- **Windows**: Run `ipconfig`

Suppose your local IP is `192.168.1.50`.

### Configure Environment Variables
1. **Frontend `.env`**:
   ```env
   VITE_API_URL=http://192.168.1.50:5000
   ```
2. **Backend `.env`**:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/saasproject
   CORS_ORIGIN=http://192.168.1.50:5173,http://192.168.1.50:8080
   FRONTEND_URL=http://192.168.1.50:5173
   API_URL=http://192.168.1.50:5000
   ```

### Running Local Builds
- Run backend: `npm start` (backend binds to `0.0.0.0` or all interfaces by default).
- Build the frontend: `npm run build` (so the built index.html embeds the correct IP endpoint).
- Serve the frontend locally:
  - If using standard Vite development server:
    ```bash
    npm run dev -- --host
    ```
    This instructs Vite to listen on the local network (port `5173`), making it accessible at `http://192.168.1.50:5173`.
