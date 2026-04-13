# SEGECS - School Management System for Supervised Curricular Internship

## 📖 About SEGECS

**SEGECS** is a high-performance academic governance solution, specifically designed to centralize, automate, and monitor the complete lifecycle of the Supervised Curricular Internship. The platform acts as an intelligent bridge between educational institutions, partner companies, and students, eliminating manual bureaucracies and ensuring full compliance with **Brazilian Law No. 11,788/2008**.

## 🏛️ System Architecture (On-Premises / Local LAN)

This version of SEGECS is optimized for **100% on-premises deployment**, designed to function flawlessly in localized LAN environments with zero external internet connectivity.

### 🏗️ Tech Stack

- **Frontend:** [React 18](https://react.dev/) with [Vite](https://vitejs.dev/) and [TypeScript](https://www.typescriptlang.org/).
- **Styling:** [TailwindCSS](https://tailwindcss.com/) and [Framer Motion](https://www.framer.com/motion/).
- **Database & Backend:** Self-hosted [Supabase](https://supabase.com/docs/guides/self-hosting) (PostgreSQL, Auth, PostgREST, and Realtime) running in Docker.
- **Containerization:** [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).
- **Web Server:** [Nginx](https://nginx.org/) (Alpine-based) serving the frontend SPA.

## 🚀 Key Features

- **Administrative Management:** Multi-course support with customizable technical training definitions.
- **Allocation & Vacancy Flow:** Intelligent link between students, companies, advisors, and supervisors.
- **Compliance Monitoring:** Frequency logs, technical visits, and pedagogical evaluations.
- **Automatic Documentation:** Instant generation of TCE (Commitment Term), Activity Plans, and TRE (Realization Term) as PDFs.
- **Data Resilience:** Automated local database backups and persistent Docker volumes.

## 🚦 Getting Started (Development)

### 📋 Prerequisites

- **Node.js** (v18+)
- **pnpm** (preferred)
- **Docker & Docker Compose**

### ⚙️ Development Setup

1. **Clone and Install:**

   ```bash
   git clone https://github.com/prof-raimundo/segecs.git
   cd segecs
   pnpm install
   ```

2. **Configure Environment:**
   Create a `.env` file based on `.env.example`:

   ```env
   VITE_PUBLIC_SUPABASE_URL=http://localhost:8000
   VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_local_anon_key
   ```

3. **Run Dev Server:**
   ```bash
   pnpm dev
   ```

---

## 📦 On-Premises Deployment (Production)

To deploy SEGECS on a local server for LAN access, follow these steps:

### 1. Initialize Supabase Self-Hosted Stack

Run the automated setup script to fetch and configure the official Supabase Docker repository:

```bash
chmod +x scripts/setup_supabase.sh
./scripts/setup_supabase.sh
```

**Configuration steps inside `supabase-project/`:**

- Run `sh ./utils/generate-keys.sh` to secure your JWT and API keys.
- Edit `supabase-project/.env` and update `SITE_URL`, `SUPABASE_PUBLIC_URL`, and `API_EXTERNAL_URL` with your **Server's LAN IP** (e.g., `http://192.168.1.100:8000`).
- Change default passwords for `POSTGRES_PASSWORD` and `DASHBOARD_PASSWORD`.
- Start the backend: `docker compose up -d`.

### 2. Deploy Frontend Container

Configure your local `.env` with the same LAN IP and the `ANON_KEY` generated in the previous step, then build and start the frontend:

```bash
# Update .env with your LAN IP
docker compose up -d --build
```

The application will be accessible to all devices on the LAN at `http://<SERVER_LAN_IP>`.

### 3. Database Resilience (Backups)

A backup script is provided in `scripts/backup_db.sh`. It is recommended to schedule this via `cron` on the host machine:

```bash
# Example: Daily backup at 2 AM
0 2 * * * /path/to/segecs/scripts/backup_db.sh
```

## 📂 Folder Structure

```text
segecs/
├── database/           # SQL schema and seed files
├── nginx/              # Nginx production configuration
├── scripts/            # Setup and backup automation scripts
├── src/
│   ├── app/            # Global configurations and routes
│   ├── components/     # Reusable UI components
│   ├── features/       # Business modules (students, internships, etc.)
│   ├── hooks/          # Custom React hooks
│   └── lib/            # Supabase client and utilities
├── Dockerfile          # Multi-stage production build
└── docker-compose.yml  # Frontend orchestration
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Developed with ❤️ to transform technical education in localized environments.
</p>
