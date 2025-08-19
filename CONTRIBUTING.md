# Contributing to ELMO

Welcome to the ELMO project! This guide will help you understand how to contribute to both the frontend and backend parts of the application, especially if you're new to Git and GitHub.

## Project Structure

ELMO is a multi-university student-club platform with:

- **Frontend**: Built with Next.js, located in the `src` directory
- **Backend**: Firebase Cloud Functions, located in the `functions` directory

```
ELMO/
├── src/               # Frontend code (Next.js)
│   ├── app/           # Next.js app router
│   ├── components/    # React components
│   ├── contexts/      # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions
│   └── service/       # Service layer
├── functions/         # Backend code (Firebase Cloud Functions)
│   ├── src/           # TypeScript source code
│   │   ├── api/       # API endpoints
│   │   ├── auth/      # Authentication functions
│   │   ├── clubs/     # Club management
│   │   ├── events/    # Event management
│   │   ├── models/    # Data models
│   │   ├── storage/   # Storage functions
│   │   └── utils/     # Utilities
```

## Git Basics for New Contributors

### Setting Up Git

1. **Install Git**: Download and install from [git-scm.com](https://git-scm.com/downloads)

2. **Configure Git**:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

3. **Clone the repository**:
   ```bash
   git clone https://github.com/syahmiharith/ELMO.git
   cd ELMO
   ```

### Essential Git Commands

- **Check status**: See which files have changed
   ```bash
   git status
   ```

- **View changes**: See exactly what's changed in files
   ```bash
   git diff
   ```

- **Stage changes**: Prepare files for commit
   ```bash
   git add filename.ts          # Add specific file
   git add src/components/      # Add specific directory
   git add .                    # Add all changes
   ```

- **Commit changes**: Save your changes locally
   ```bash
   git commit -m "Brief description of your changes"
   ```

- **Push changes**: Send commits to GitHub
   ```bash
   git push origin your-branch-name
   ```

## Branching Workflow

### ⚠️ Important: Never Push Directly to Main ⚠️

Always create a new branch for your work and use pull requests.

### Creating and Using Branches

1. **Make sure you're on main and it's up to date**:
   ```bash
   git checkout main
   git pull origin main
   ```

2. **Create a new branch**:
   ```bash
   # For features:
   git checkout -b feature/descriptive-name

   # For bug fixes:
   git checkout -b fix/issue-description

   # Examples:
   git checkout -b feature/club-dashboard
   git checkout -b fix/login-error
   ```

3. **Work on your branch**:
   Make changes, commit frequently with clear messages.

4. **Push your branch to GitHub**:
   ```bash
   git push origin your-branch-name
   ```

5. **Create a Pull Request (PR)**:
   - Go to the GitHub repository
   - Click "Pull requests" > "New pull request"
   - Select your branch as the "compare" branch
   - Add a description of your changes
   - Request a review

## Frontend Development (src/)

### Getting Started with Frontend

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Access the application**: Open http://localhost:3000

### Frontend Guidelines

- Place new components in the appropriate subdirectory under `src/components/`
- Use existing UI components from `src/components/ui/`
- Use hooks from `src/hooks/` for shared functionality
- Follow the existing patterns for data fetching from Firebase

## Backend Development (functions/)

### Getting Started with Backend

1. **Navigate to functions directory**:
   ```bash
   cd functions
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run Firebase emulators**:
   ```bash
   npm run serve
   ```

### Backend Guidelines

- Place new functions in the appropriate directory based on functionality
- Add new types to `models/types.ts`
- Use the Firebase Admin SDK from `utils/firebase.ts`
- Follow the patterns in existing files for error handling and logging
- Use transactions for operations that need atomicity
- Add audit logs for important operations
- Write tests for new functions

## Testing

### Frontend Testing
```bash
# In the main directory
npm run test
```

### Backend Testing
```bash
# In the functions directory
cd functions
npm run test
```

## Handling Firebase Configuration

- **Never** commit Firebase API keys or secrets
- Use environment variables for sensitive configuration
- Ask for the `.env.local` file from the project maintainer

## Code Review Process

1. All pull requests require at least one review
2. Address review comments by making additional commits to your branch
3. Once approved, your changes will be merged to main

## Getting Help

If you're stuck, here are some resources:

- **Git issues**: [Git documentation](https://git-scm.com/doc)
- **Firebase questions**: [Firebase documentation](https://firebase.google.com/docs)
- **Next.js help**: [Next.js documentation](https://nextjs.org/docs)
- **Project specific questions**: Create an issue on GitHub or contact the project maintainer

## Common Git Scenarios

### What if I need to update my branch with changes from main?

```bash
# First commit or stash your changes
git checkout main
git pull origin main
git checkout your-branch-name
git merge main
# Resolve any conflicts if they arise
```

### What if I made changes on the wrong branch?

```bash
# Stash your changes
git stash

# Switch to the correct branch
git checkout correct-branch

# Apply your changes
git stash apply

# Commit on the correct branch
git add .
git commit -m "Your message"
```

### What if I need to undo my last commit?

```bash
# Undo commit but keep the changes
git reset --soft HEAD~1

# Undo commit and discard changes (be careful!)
git reset --hard HEAD~1
```

Thank you for contributing to ELMO!
