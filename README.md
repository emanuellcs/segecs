# SEGECS - School Management System for Supervised Curricular Internship

## 📖 About SEGECS

**SEGECS** is a high-performance academic governance solution, specifically designed to centralize, automate, and monitor the complete lifecycle of the Supervised Curricular Internship. The platform acts as an intelligent bridge between educational institutions, partner companies, and students, eliminating manual bureaucracies and ensuring full compliance with **Brazilian Law No. 11,788/2008**.

Unlike generic systems, SEGECS offers a **multi-training** architecture, allowing coordinators to simultaneously manage various technical and professional courses (such as Nursing, Administration, Networking, Building Construction, among others). Each course has its own workload and competency settings, allowing the institution to scale its internship operations without losing individualized control over each contract.

With a modern, data-driven interface, the system transforms pedagogical monitoring, previously scattered across papers and spreadsheets, into real-time strategic indicators, providing legal security through automated document generation and technical integrity through rigorous data protection policies.

## 🏛️ System Architecture

SEGECS uses a modern architecture based on **SPA (Single Page Application)** with a **Serverless** infrastructure, ensuring scalability, security, and high performance.

### 🏗️ Tech Stack

- **Frontend:** [React 18](https://react.dev/) with [Vite](https://vitejs.dev/) and [TypeScript](https://www.typescriptlang.org/).
- **Styling:** [TailwindCSS](https://tailwindcss.com/) and [Framer Motion](https://www.framer.com/motion/) for fluid animations.
- **Backend-as-a-Service:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, RLS, and Realtime).
- **State Management:** [React Query (TanStack)](https://tanstack.com/query/latest) for caching and data synchronization.
- **Forms:** [React Hook Form](https://react-hook-form.com/) integrated with [Zod](https://zod.dev/) for rigorous validation.
- **Documentation:** [@react-pdf/renderer](https://react-pdf.org/) for dynamic PDF generation on the client side.
- **Localization:** [i18next](https://www.i18next.com/) for multi-language support (Portuguese and English).

### 🛡️ Security Layer

- **Supabase Auth:** Secure authentication with configurable session persistence ("Remember me").
- **Row Level Security (RLS):** Access policies directly in the database ensuring students see only their data, while coordinators access the management view.
- **Snapshot Logic:** Workloads are copied to contracts at the time of creation, protecting historical records against future changes in the curriculum.

## 🚀 Key Features

### 📋 Administrative Management (Multi-Course)

- **Customizable Courses:** Registration of any training with specific mandatory workload definition.
- **Partner Management:** Control of companies with monitoring of agreement validity.
- **Talent Bank:** Detailed registration of students, advisors, and field supervisors.

### ⚙️ Allocation and Vacancy Flow

- **Vacancy Management:** Publication and control of opportunities by course and company.
- **Intelligent Allocation:** Automatic link between student, vacancy, advisor, and supervisor.
- **Auto-fill:** The system detects the course workload and suggests contract terms instantly.

### 📈 Monitoring and Control (Compliance)

- **Frequency Log:** Daily entry of activities with time validation.
- **Technical Visits:** Full module for recording in-person or remote monitoring.
- **Pedagogical Evaluations:** Grading and feedback system by period.
- **Intelligence Dashboard:** Distribution charts, expiring contract alerts, and evaluation pending items.

### 🎓 Automatic Documentation (PDF)

- **TCE (Commitment Term):** Instant generation according to current legislation.
- **Activity Plan:** Detailing technical competencies in development.
- **TRE (Realization Term):** Final completion document with workload summary.
- **SICE Export:** Preparation of structured CSV data for the SEDUC-CE system.

## 🚦 Getting Started

### 📋 Prerequisites

- **Node.js** (v18+)
- **npm** or **pnpm**
- **Supabase** Instance

### ⚙️ Installation and Configuration

1. **Clone and Install:**

   ```bash
   git clone https://github.com/prof-raimundo/segecs.git
   cd segecs
   npm install
   ```

2. **Configure Environment Variables:**
   Create a `.env` file in the root:

   ```env
   VITE_PUBLIC_SUPABASE_URL=your_supabase_url
   VITE_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   ```

3. **Configure Database:**
   - Run the script in `database/supabase_schema.sql` in the Supabase SQL editor.
   - (Optional) Run `database/seed.sql` to populate the system with test data (70 users, 15 visits, frequencies, etc.).

4. **Run:**
   ```bash
   npm run dev
   ```

## 📂 Folder Structure

```text
src/
├── app/            # Global configurations, routes, and providers
├── components/     # Reusable UI components (Pagination, Loading, etc.)
├── features/       # Business modules (students, internships, visits, etc.)
│   └── [feature]/  # Specific components, pages, and services
├── hooks/          # Custom hooks (usePagination, useAuth, useSupabaseCrud)
├── i18n/           # Localization configuration and translation files
├── lib/            # Library configurations (supabase client, utils)
└── types/          # TypeScript type definitions and database types
```

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="center">
  Developed with ❤️ to transform technical education.
</p>
