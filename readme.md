# ELMO — Student Clubs & Events Management

ELMO is a web application that enhances digital connectivity among students by helping clubs manage membership, events, finances, tasks, and compliance across multiple universities. It centralizes governance for a parent body (Super Admin) while empowering club officers and members with the tools they need to operate day‑to‑day.

Status: Hackathon project (active) • Scope aims for an MVP that is demo‑ready.


## Key roles
- Super Admin (Student Body Admin): Sets policies and approvals, sees everything, and audits activity.
- Club Manager/Officer: Runs a club within policy limits (members, events, finances, tasks, files, announcements).
- Club Member: Joins clubs, RSVPs and checks in to events, views files/announcements, and maintains dues status (dummy).


## Core features (MVP)
- RBAC and policies
  - Flexible role‑based access control and policy enforcement at API and Firestore security rules levels.
  - Super Admin approvals for proposals (events, budgets, purchases, reimbursements) and configurable rules (spending caps, categories, compliance).
- Club management (multi‑university)
  - Create/update/archive clubs with members and officers from any university; featured clubs per university/global.
  - Club details, documents, and file storage per club.
- Members & attendance
  - Member CRUD, role assignment, join/approval, manual dues status (no payments), attendance tracking and export.
- Events & proposals
  - Event CRUD, RSVP, manual check‑in; single‑stage proposal and approval flow; exports for reporting.
- Finance
  - Budgets, expenses with receipt uploads, reimbursements; approval flow; budget vs. spend tracking; exportable summaries.
- Tasks, roles, and communications
  - Officer roles, task assignment with deadlines/status, volunteer sign‑ups, in‑app announcements; club file sharing.
- Governance, policy repository, and reporting
  - Central policy/document repository, compliance checklist, audit trail of key actions, CSV exports, and an admin dashboard.

See roadmap issues for details:
- RBAC & Policies: https://github.com/syahmiharith/ELMO/issues/4
- Club Management: https://github.com/syahmiharith/ELMO/issues/5
- Member Management & Dues: https://github.com/syahmiharith/ELMO/issues/6
- Event Management & Proposals: https://github.com/syahmiharith/ELMO/issues/7
- Finance Management: https://github.com/syahmiharith/ELMO/issues/8
- Tasks/Roles/Comms: https://github.com/syahmiharith/ELMO/issues/9
- Governance/Policies/Reporting: https://github.com/syahmiharith/ELMO/issues/10


## Tech stack
- Frontend: React 18 (Create React App)
- Backend: Firebase Cloud Functions (Node.js) and Firestore
- Data Access: Firebase Data Connect (dataconnect/ + default connector)
- Auth: Firebase Authentication
- Hosting/Infra: Firebase (Hosting, Emulators) and Google Cloud App Hosting (apphosting.yaml)
- Optional AI: Genkit with Google AI providers
- Security: Firestore security rules (firestore.rules) and indexes (firestore.indexes.json)


## Repository layout
```
├─ src/                  # React application source
├─ public/               # Static assets
├─ functions/            # Firebase Cloud Functions (Node.js)
├─ nexus-codebase/       # (Optional) Python modules/functions
├─ dataconnect/          # Firebase Data Connect schema & generated connectors
├─ firestore.rules       # Firestore security rules
├─ firestore.indexes.json# Firestore indexes
├─ firebase.json         # Firebase project config
├─ apphosting.yaml       # Google Cloud App Hosting configuration
└─ readme.md
```


## Getting started (local)
Prerequisites
- Node.js 18+ and npm (or pnpm/yarn)
- Firebase CLI: npm i -g firebase-tools
- (Optional) Python 3.10+ if you plan to work in nexus-codebase/

Setup
1) Clone and install
```
git clone https://github.com/syahmiharith/ELMO.git
cd ELMO
npm install
```
2) Configure environment variables
- Copy `.env.example` to `.env` in the repo root and add your Firebase project settings.
- Replace all placeholder values with your actual Firebase configuration:
```bash
cp .env.example .env
# Edit .env with your Firebase project values
```
3) Connect Firebase
```
firebase login
firebase use --add <your-project-id>
```
4) Run locally
- Start the React app (if scripts are defined):
```
npm start
```
- Start Firebase emulators for Functions/Firestore (in another terminal):
```
firebase emulators:start
```


## Deployment
- Firebase Hosting/Functions: follow firebase deploy workflows using firebase.json.
- Google Cloud App Hosting: apphosting.yaml is provided; see Google Cloud App Hosting docs for apply/deploy steps.


## Security & compliance
- Access is governed by RBAC and Firestore security rules.
- All critical actions are auditable; exports enable reporting and oversight.


## Contributing
- PRs welcome. Please open an issue to discuss substantial changes or new modules.
- Keep changes scoped and include basic tests where applicable.


## License
No license specified yet. All rights reserved by the author unless a license is added.