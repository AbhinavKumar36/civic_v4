# Security Specifications

Civic Pulse is a public-facing application that handles citizen identities and potentially sensitive demands. The following security practices are strictly enforced:

## 1. Credentials Management
- **No Hardcoded Secrets**: All API keys, tokens, and database URIs must be stored in `.env`.
- **No Git Commit of `.env`**: `.env` is explicitly ignored. An `.env.example` is provided for reference.
- **No Log Output of Secrets**: Passwords, OTPs, API keys, and JWT secrets are **never** logged to the console or log files.

## 2. Authentication
- **OTP Hashing**: Raw OTPs are not stored. They are hashed via bcrypt upon generation and compared using the hash.
- **Rate Limiting**: The `/send-otp` and `/verify-otp` endpoints are protected by rate limiting to prevent brute force attacks and SMS pumping.
- **JWT**:
  - Short-lived Access Tokens.
  - Long-lived Refresh Tokens stored as secure HTTP-only cookies.
  - No sensitive data is included in the JWT payload (only `userId` and `role`).

## 3. Server Security
- **Helmet**: Secures Express apps by setting various HTTP headers.
- **CORS**: Configured strictly to the allowed `CLIENT_URL`.
- **Validation**: Strict schema validation using Zod for incoming requests to prevent malformed or malicious data injection.
