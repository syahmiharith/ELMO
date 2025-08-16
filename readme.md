# [NEXUS] - Connect your student life

> A student governance application for multiple universities.

## About

This project is building a comprehensive student governance application designed to connect students, clubs, and administrators across multiple universities. The goal is to provide a platform for managing student organizations, facilitating proposal submissions and reviews, and gathering feedback to improve student life.

## Features (MVP)

The initial version (MVP) of the application will include the following core features:

*   **Role Management:**
    *   Super Admin: Manages the overall application and universities.
    *   Campus Admin: Manages clubs within their specific university.
    *   User: Students interested in joining clubs and participating in governance processes.
*   **Club Management:**
    *   Create clubs (by Campus Admins).
    *   Propose new clubs (by Users).
    *   Promote clubs.
*   **Proposal Management:**
    *   Submit proposals (by Users and Campus Admins).
    *   Review proposals (by Admins).
*   **Feedback:**
    *   A channel for all users to provide feedback on the application and related activities.

## Technology Stack

*   **Frontend:** React
*   **Backend:** Firebase
*   **Data Access:** Firebase Data Connect (for interacting with data sources like PostgreSQL via Cloud SQL)

## Install
To set up the project locally, follow these steps:

1.  **Clone the repository:**

git clone [syahmiharith/ELMO]

3.  **Install dependencies:**

npm install


## Dev

### Run Locally

To run the application locally in development mode:

npm start

This will start the React development server.

### Build

To build the production-ready application:

npm run build

This will create a `build` directory (or your configured build output directory) with the optimized production build.

### Test

To run the project tests:

npm test

### Deploy

To deploy the application to Firebase:

firebase deploy

You can also deploy specific parts:

firebase deploy --only hosting # Deploy hosting firebase deploy --only functions # Deploy functions

---