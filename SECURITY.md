# Security Guidelines for ELMO

This document outlines security practices and guidelines for developing and maintaining the ELMO platform. All contributors should follow these guidelines to ensure the security of the application and its data.

## Table of Contents

- [Authentication & Authorization](#authentication--authorization)
- [Data Security](#data-security)
- [Firebase Security Rules](#firebase-security-rules)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Backend Security](#backend-security)
- [Deployment Security](#deployment-security)
- [Reporting Security Issues](#reporting-security-issues)

## Authentication & Authorization

### Authentication

- ELMO uses Firebase Authentication for user identity management
- Never implement custom authentication systems outside of Firebase Auth
- Enforce strong password requirements using Firebase Auth settings
- Enable MFA for administrative accounts

### Authorization (Custom Claims)

- All authorization is based on Firebase custom claims:
  - `superAdmin`: Global administrator privileges
  - `officerOfClub`: `{[clubId]: true}` for club officers
  - `memberOfClub`: `{[clubId]: true}` for club members
- Custom claims can only be modified by backend Cloud Functions
- Never trust client-side role assertions

### Security Principle: Server-Side Verification

- **Always** verify permissions on the server side
- **Never** rely on UI-based permission checks alone
- Validate user claims in every Cloud Function and security rule

## Data Security

### Sensitive Data

- Never store passwords or authentication tokens in Firestore
- Store only minimal user information required for the application
- Use field-level security in Firestore rules for sensitive user data

### PII (Personally Identifiable Information)

- Minimize collection of PII to what's absolutely necessary
- Implement field-level access controls for contact information
- Allow users to control visibility of their profile information

### Student Data

- University IDs and verification status must have restricted access
- Club officers should only see necessary member information
- Store student-specific data according to applicable education privacy laws

## Firebase Security Rules

### Firestore Rules

Rules must enforce the following security model:

1. **Users**:
   - Users can read other users' public information
   - Users can only update their own user-editable fields
   - Admin-locked fields require superAdmin privileges

2. **Clubs**:
   - Public club data is readable by authenticated users
   - Only officers or superAdmins can update club info
   - Only superAdmins can delete clubs

3. **Memberships**:
   - Users can create join requests for themselves
   - Club officers can approve/reject for their clubs
   - Members can leave clubs (change status to archived)

4. **Events**:
   - Read access based on visibility settings
   - Write access restricted to club officers and admins

5. **Orders & Tickets**:
   - Users can only read/write their own orders
   - Officers can only review orders for their club events
   - Ticket write operations are restricted to backend only

### Storage Rules

1. **Club Files**:
   - `clubFiles/{clubId}/...` accessible based on visibility metadata
   - Write access only for club officers and superAdmins

2. **Receipts**:
   - `receipts/{userId}/{orderId}/...` accessible by:
     - The order owner
     - Officers of the event's club
     - superAdmins

## API Security

### Callable Functions

- All callable functions must verify user authentication
- Implement rate limiting for API endpoints
- Validate all input parameters before processing
- Return appropriate error codes without leaking implementation details

### AppCheck Integration

- Enable Firebase AppCheck to verify legitimate app instances
- Use reCAPTCHA for web instances
- Enforce AppCheck on all Cloud Functions and API endpoints

## Frontend Security

### Client-Side Validation

- Implement client-side validation for better user experience
- **Never** rely on client-side validation alone
- Assume all client-side checks can be bypassed

### XSS Prevention

- Use Next.js's built-in XSS protections
- Sanitize any user-generated HTML content
- Implement Content Security Policy headers

### Sensitive Data

- Never store access tokens in localStorage
- Use HttpOnly cookies for session management
- Clear sensitive data when the user logs out

## Backend Security

### Cloud Functions

- Always use the principle of least privilege
- Validate all inputs with proper type checking
- Implement idempotency for critical operations
- Use transactions for operations requiring atomicity

### Secrets Management

- Store secrets in Firebase Secret Manager
- Never hardcode credentials in source code
- Rotate secrets periodically

### Error Handling

- Log security events appropriately
- Don't expose detailed error information to clients
- Implement proper error codes for security-related failures

## Deployment Security

### CI/CD Pipeline

- Scan dependencies for vulnerabilities during builds
- Run security linting before deployment
- Implement approval gates for production deployments

### Firebase Configuration

- Use separate Firebase projects for development and production
- Restrict Firebase service account permissions
- Enable Firebase Security features including:
  - IP allowlisting for Firebase Auth
  - Resource location restrictions

## Reporting Security Issues

If you discover a security vulnerability:

1. **Do not** disclose it publicly in issues, discussions, or pull requests
2. Send details privately to the security team at [security@example.com]
3. Include detailed steps to reproduce the issue
4. We will acknowledge receipt within 48 hours
5. We will provide regular updates on our progress

## Security Review Checklist

Before submitting a pull request, ensure:

- [ ] New Firestore collections have appropriate security rules
- [ ] Cloud Functions verify user permissions
- [ ] Input validation is implemented for all user inputs
- [ ] No secrets or credentials are included in the code
- [ ] User data access follows the principle of least privilege
- [ ] Security-relevant operations are properly logged
- [ ] Transactions are used where required for data consistency

---

By following these security guidelines, we can maintain a secure platform for our users. Security is everyone's responsibility, so please take these guidelines seriously when contributing to ELMO.
