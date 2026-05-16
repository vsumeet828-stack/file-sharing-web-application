# DropX Security Specification

## Overview
DropX implements a zero-trust, attribute-based access control (ABAC) architecture using Firebase Authentication and Firestore Security Rules.

## Data Invariants
1. **User Identity Recovery**: A user profile (`/users/{uid}`) must be created upon first login and is immutable in its ownership.
2. **Relational Integrity**: Files must always belong to a valid `ownerId` that matches the authenticated user's UID.
3. **Storage Quota Enforcement**: File uploads update the user's `storageUsed`, which is validated against `storageLimit`.
4. **Email Verification**: Only users with verified emails (via Google Auth) are permitted write access to prevent bot spam.

## Hardened Security Rules (The Eight Pillars)
1. **The Master Gate**: All paths default to `deny`. Specific matches allow access only if `isSignedIn()` and `email_verified` is true.
2. **Validation Blueprints**: `isValidUser` and `isValidFile` helpers enforce strict key checks (using `.keys().hasAll()` and `.keys().size()`), type safety, and size limits.
3. **Path Variable Hardening**: `isValidId()` validates all path variables to prevent ID poisoning attacks.
4. **Tiered Identity Logic**: Updates use `affectedKeys().hasOnly()` to restrict field changes (e.g., users cannot change their own `isPremium` status).
5. **PII Isolation**: User email is restricted to the specific user document.
6. **Immortal Fields**: `createdAt` and `ownerId` are immutable after document creation.
7. **Temporal Integrity**: All timestamps use `request.time` (Server Timestamp) rather than client-provided values.
8. **Secure List Queries**: `allow list` explicitly enforces `resource.data.ownerId == request.auth.uid`, forcing the client to use secure filters.

## Dirty Dozen Payloads (Rejection Scenarios)
| Payload Type | Target | Expected Result | Reason |
|--------------|--------|-----------------|--------|
| Shadow field injection | `/files/{id}` | DENIED | `keys().size()` check fails |
| Identity Spoofing | `/files/{id}` | DENIED | `ownerId` mismatch check |
| Invalid ID length | `/files/{id}` | DENIED | `isValidId` regex/size check |
| Unverified Email | `/files/{id}` | DENIED | `email_verified` check |
| Mutating Immutable Field | `/users/{id}` | DENIED | `createdAt` equality check |
| Negative Storage Size | `/files/{id}` | DENIED | `size >= 0` check |
| Privilege Escalation | `/users/{id}` | DENIED | `isPremium` field protection |
| Query Scaping | `/files/` | DENIED | No list query filter |
| Status Skipping | `/transfers/{id}` | DENIED | Helper validation |
| Orphaned Record | `/files/{id}` | DENIED | Created without valid user reference |
| Oversized String | `/files/{id}` | DENIED | String `.size()` check |
| Future Timestamp | `/files/{id}` | DENIED | `request.time` check |
