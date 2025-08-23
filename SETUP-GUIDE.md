# 🔧 Setup Guide for Judges/Evaluators

This guide will help you set up and run the ELMO project locally for evaluation.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Git installed

## 🚀 Quick Setup

### 1. Clone and Install
```bash
git clone <repository-url>
cd ELMO
npm install
cd functions && npm install && cd ..
cd shared && npm install && cd ..
```

### 2. Firebase Configuration

#### Option A: Use Demo/Test Mode (Recommended for Evaluation)
You can run the frontend without setting up Firebase:
```bash
npm run dev
```
The app will run in demo mode with mock data.

#### Option B: Full Firebase Setup (Optional)
If you want to test the full backend functionality:

1. **Create a Firebase project** at https://console.firebase.google.com
2. **Copy environment variables:**
   ```bash
   cp .env.example .env.local
   ```
3. **Fill in your Firebase config** in `.env.local` with values from Firebase Console > Project Settings
4. **Set up service account** (for Functions):
   ```bash
   cd functions
   cp service-account-key.example.json service-account-key.json
   ```
   Fill in the service account details from Firebase Console > Project Settings > Service Accounts

### 3. Run the Application

```bash
# Frontend (Next.js)
npm run dev

# Backend Testing (Optional)
npm run test:backend
```

## 🎯 Key Features to Evaluate

### Frontend Features:
- 🎨 **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 🔍 **Global Search** - Search clubs and events
- 📱 **Mobile Responsive** - Works on all device sizes
- 🌙 **Dark/Light Mode** - Theme toggle
- 👤 **User Authentication** - Firebase Auth integration
- 🎯 **Personalization** - AI-powered recommendations

### Backend Features:
- ⚡ **Firebase Functions** - 32+ cloud functions deployed
- 🔥 **Firestore Database** - 10 collections with proper security rules
- 🛡️ **Authentication** - Secure user management
- 📁 **Storage** - File upload and management
- 🤖 **AI Integration** - Google AI for recommendations

### Architecture:
- 📁 **Monorepo Structure** - Organized codebase with shared types
- 🔒 **Security Rules** - Proper Firestore security implementation  
- 📊 **TypeScript** - Full type safety across the project
- 🧪 **Testing** - Comprehensive backend testing suite

## 🔍 How to Test

1. **Frontend Testing:**
   ```bash
   npm run dev
   ```
   Visit http://localhost:9002

2. **Backend Health Check:**
   ```bash
   npm run test:backend
   ```
   This runs a comprehensive test of all backend systems.

3. **Build Testing:**
   ```bash
   npm run build
   ```
   Ensures the project builds successfully.

## 📊 Expected Results

- **Frontend:** Should load without errors, display clubs/events, responsive design
- **Backend Test:** Should show ~70%+ system health (some functions require authentication)
- **Build:** Should complete without TypeScript errors

## 🆘 Troubleshooting

### Common Issues:
- **Port 9002 in use:** Change port in package.json dev script
- **Firebase errors:** Use demo mode (just run `npm run dev`)
- **Build errors:** Run `npm run typecheck` for detailed error info

### Getting Help:
If you encounter issues, the project includes:
- 📋 Comprehensive README.md
- 🔧 Backend testing tools
- 📝 Detailed code comments
- 🎯 Type definitions for all APIs

## 📱 Demo Credentials (if needed)

The app works in demo mode without authentication, but if you want to test auth features:
- Email: demo@example.com
- Password: demo123456

---

**Note:** This project is designed to work in demo mode for easy evaluation. Full Firebase setup is optional but recommended to see all features.
