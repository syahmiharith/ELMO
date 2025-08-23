# 🎓 ELMO — Student Clubs & Events Management Platform

> **A comprehensive web application that enhances digital connectivity among students by helping clubs manage membership, events, finances, and compliance across multiple universities.**

[![Status](https://img.shields.io/badge/Status-Active%20Development-green)](https://github.com/syahmiharith/ELMO)
[![Tech Stack](https://img.shields.io/badge/Tech-Next.js%20%7C%20Firebase%20%7C%20TypeScript-blue)](#tech-stack)
[![Demo](https://img.shields.io/badge/Demo-Available-brightgreen)](#quick-demo)

## 🌟 Overview

ELMO centralizes governance for university student bodies while empowering club officers and members with modern tools for day-to-day operations. Built for hackathon competition with a focus on creating a production-ready MVP.

### 🎯 **Key Problems Solved:**

- **Fragmented Communication** → Centralized platform for all club activities
- **Manual Processes** → Automated workflows with approval systems
- **Poor Oversight** → Comprehensive audit trails and reporting
- **Inconsistent Management** → Standardized tools across all clubs

---

## 👥 User Roles & Capabilities

| Role                | Capabilities                                                                   |
| ------------------- | ------------------------------------------------------------------------------ |
| **🔧 Super Admin**  | Policy management, university-wide oversight, audit trails, approval workflows |
| **👨‍💼 Club Officer** | Member management, event creation, financial tracking, compliance reporting    |
| **🎓 Club Member**  | Event RSVPs, club participation, document access, dues management              |

---

## ✨ Core Features (MVP)

### 🔐 **RBAC & Policies**

- Flexible role-based access control with API and Firestore security rules
- Super Admin approval workflows for events, finances, and policy changes
- Configurable compliance rules (spending caps, event categories, etc.)

### 🏛️ **Club Management (Multi-University)**

- Create, update, and archive clubs across multiple universities
- Club profiles with documents, member lists, and file storage
- Featured clubs system (university-specific and global)

### 👥 **Member Management**

- Complete member CRUD with role assignments
- Join/approval workflows and manual dues status tracking
- Export capabilities for reporting and compliance

### 📅 **Events & Proposals**

- Event CRUD with RSVP and manual check-in systems
- Single-stage proposal and approval workflows
- Comprehensive reporting and export functionality

### 💰 **Financial Management**

- Budget tracking with expense management
- Receipt upload system for reimbursements
- Approval workflows and budget vs. spend analytics

### 🔧 **Communications & Tasks** _(Work in Progress)_

- Officer role management and task assignment
- Volunteer sign-up systems and in-app announcements
- Club file sharing and document management

### 📊 **Governance & Reporting** _(Work in Progress)_

- Central policy and document repository
- Compliance checklists with audit trails
- CSV exports and comprehensive admin dashboard

---

## 🔗 Project Roadmap

Detailed feature tracking and development progress:

- **[RBAC & Policies](https://github.com/syahmiharith/ELMO/issues/4)** - Permission systems and approval workflows
- **[Club Management](https://github.com/syahmiharith/ELMO/issues/5)** - Multi-university club operations
- **[Member Management & Dues](https://github.com/syahmiharith/ELMO/issues/6)** - Membership lifecycle and payments
- **[Event Management & Proposals](https://github.com/syahmiharith/ELMO/issues/7)** - Event planning and approval systems
- **[Finance Management](https://github.com/syahmiharith/ELMO/issues/8)** - Budget tracking and reimbursements
- **[Tasks/Roles/Communications](https://github.com/syahmiharith/ELMO/issues/9)** - Internal club operations
- **[Governance/Policies/Reporting](https://github.com/syahmiharith/ELMO/issues/10)** - Compliance and analytics

---

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Full type safety across the application
- **Tailwind CSS** - Modern utility-first styling
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Performant form handling

### **Backend**

- **Firebase Functions** - Serverless cloud functions (32+ endpoints)
- **Firestore** - NoSQL document database (10 collections)
- **Firebase Auth** - User authentication and authorization
- **Firebase Storage** - File upload and management

### **AI & Integrations**

- **Google AI (Gemini)** - Personalized recommendations
- **QR Code Generation** - Event check-ins and tickets
- **Real-time Updates** - Live data synchronization

### **Development & Deployment**

- **Monorepo Structure** - Shared types and utilities
- **Firebase Hosting** - Static site hosting
- **Google Cloud App Hosting** - Full-stack deployment
- **Comprehensive Testing Suite** - Backend health monitoring

---

## 📁 Repository Structure

```
ELMO/
├── 📱 src/                     # Next.js application source
│   ├── app/                    # App Router pages and layouts
│   ├── components/             # Reusable UI components
│   ├── lib/                    # Utilities and API clients
│   └── types/                  # TypeScript type definitions
├── ⚡ functions/               # Firebase Cloud Functions
│   ├── src/                    # Function source code
│   └── lib/                    # Compiled JavaScript (auto-generated)
├── 🔗 shared/                  # Shared TypeScript types
├── 🌐 public/                  # Static assets and files
├── 🔥 firestore.rules          # Database security rules
├── 📊 firestore.indexes.json   # Database indexes
├── ⚙️ firebase.json            # Firebase project configuration
├── 🚀 apphosting.yaml          # Google Cloud App Hosting config
└── 📚 docs/                    # Documentation and guides
```

---

## 🚀 Quick Demo

**For Judges & Evaluators - No Setup Required:**

```bash
# Clone the repository
git clone https://github.com/syahmiharith/ELMO.git
cd ELMO

# Install dependencies
npm install

# Start in demo mode (works without Firebase)
npm run dev
```

**Visit:** http://localhost:9002

> 🎯 **Demo Mode Features:** Browse clubs, view events, responsive design, theme switching, and UI/UX showcase - all without any Firebase configuration required!

---

## ⚙️ Full Setup (Optional)

**For complete functionality including backend features:**

### Prerequisites

- Node.js 18+ and npm
- Firebase CLI: `npm install -g firebase-tools`

### Setup Steps

1️⃣ **Install Dependencies**

```bash
npm install
cd functions && npm install && cd ..
cd shared && npm install && cd ..
```

2️⃣ **Configure Firebase**

```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Firebase project settings
# Get these from: Firebase Console → Project Settings → Web App
```

3️⃣ **Set up Functions (Optional)**

```bash
cd functions
cp service-account-key.example.json service-account-key.json
# Fill in your Firebase Admin SDK credentials
```

4️⃣ **Initialize Firebase**

```bash
firebase login
firebase use --add your-project-id
```

5️⃣ **Run Development Server**

```bash
npm run dev
```

📋 **Detailed Setup Instructions:** See [`SETUP-GUIDE.md`](./SETUP-GUIDE.md) for comprehensive setup documentation.

---

## 🔍 Testing & Health Monitoring

**Backend Health Check:**

```bash
npm run test:backend
```

This comprehensive test suite checks:

- ✅ **Firestore Database** (10 collections, security rules)
- ✅ **Authentication System** (user management, tokens)
- ✅ **Firebase Functions** (32+ cloud functions)
- ✅ **Storage System** (file uploads, access control)

**Expected Results:** ~70%+ system health (some functions require authentication)

---

## 📈 Current Status

| System                | Status                  | Details                            |
| --------------------- | ----------------------- | ---------------------------------- |
| **🔥 Firestore**      | ✅ **100% Operational** | 10 collections with security rules |
| **🛡️ Authentication** | ✅ **Fully Configured** | Firebase Auth integration          |
| **⚡ Functions**      | ✅ **55% Deployed**     | 32/58 functions active             |
| **📁 Storage**        | ✅ **Configured**       | File upload system ready           |
| **🎨 Frontend**       | ✅ **Production Ready** | Responsive, accessible UI          |

**Overall System Health: 72.2%** _(Excellent for MVP stage)_

---

## 🚀 Deployment

### **Firebase Hosting & Functions**

```bash
# Deploy everything
firebase deploy

# Deploy specific components
firebase deploy --only functions
firebase deploy --only hosting
```

### **Google Cloud App Hosting**

```bash
# Using provided apphosting.yaml configuration
gcloud app deploy apphosting.yaml
```

**Live Demo:** _(Add your deployed URL here)_

---

## 🔒 Security & Privacy

### **Security Features**

- 🛡️ **RBAC Implementation** - Role-based access control at all levels
- 🔐 **Firestore Security Rules** - Database-level permission enforcement
- 🔑 **JWT Authentication** - Secure user session management
- 📝 **Comprehensive Audit Trails** - All critical actions logged
- 📊 **Data Export Capabilities** - Compliance and reporting support

### **Public Repository Security**

**⚠️ IMPORTANT NOTICE:** This repository is **safe for public sharing**

✅ **What's Included:**

- Complete source code and documentation
- Configuration templates (`.env.example`)
- Setup guides and testing tools
- All application logic and components

🚫 **What's NOT Included:**

- API keys or Firebase credentials
- Service account keys or private keys
- Environment configuration files
- Any sensitive production data

### **For Evaluators & Contributors:**

**🎯 Quick Start (No Firebase Required):**

```bash
git clone <repository-url>
cd ELMO
npm install && npm run dev
```

**🔧 Full Setup (Optional):**

- Follow [`SETUP-GUIDE.md`](./SETUP-GUIDE.md) for complete instructions
- Use your own Firebase project with provided templates
- All sensitive files are properly excluded via `.gitignore`

**📋 Security Checklist:**

- ✅ No API keys committed
- ✅ Service account keys excluded
- ✅ Environment files ignored
- ✅ Comprehensive `.gitignore` configuration
- ✅ Template files provided for setup

---

## 🤝 Contributing

We welcome contributions to improve ELMO! Here's how to get started:

### **Getting Started**

1. Fork the repository
2. Clone your fork: `git clone <your-fork-url>`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes and test thoroughly
5. Submit a pull request with a clear description

### **Contribution Guidelines**

- 📝 **Documentation:** Update relevant docs for new features
- 🧪 **Testing:** Include basic tests for new functionality
- 🎯 **Scope:** Keep changes focused and well-scoped
- 💬 **Discussion:** Open an issue for substantial changes before implementing

### **Code Standards**

- TypeScript for type safety
- ESLint configuration for code quality
- Consistent formatting with Prettier
- Clear commit messages and PR descriptions

---

## 📊 Project Stats

| Metric                       | Count                             |
| ---------------------------- | --------------------------------- |
| **🔥 Firebase Functions**    | 32+ cloud functions               |
| **📊 Firestore Collections** | 10 database collections           |
| **🛡️ Security Rules**        | Comprehensive RBAC implementation |
| **🎨 UI Components**         | 50+ reusable components           |
| **📱 Pages/Routes**          | 20+ application pages             |
| **🔍 Test Coverage**         | Comprehensive backend testing     |

---

## 🏆 Recognition & Awards

_Add any hackathon awards, recognition, or notable achievements here_

---

## 📄 License

**All rights reserved.** No license specified yet - all rights reserved by the author unless a license is added.

---

## 📞 Support & Contact

- **📚 Documentation:** [`SETUP-GUIDE.md`](./SETUP-GUIDE.md)
- **🐛 Issues:** [GitHub Issues](https://github.com/syahmiharith/ELMO/issues)
- **💬 Discussions:** [GitHub Discussions](https://github.com/syahmiharith/ELMO/discussions)
- **📧 Contact:** [Add your contact information]

---

<div align="center">

**⭐ If you find ELMO helpful, please consider giving it a star! ⭐**

**Built with ❤️ for student communities everywhere**

</div>
