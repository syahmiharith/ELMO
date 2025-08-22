# API Documentation Template

Based on the analysis of the current `api.stub.ts` file, here's the comprehensive template that should be applied to each function to meet the documentation format conventions:

## Template for GET endpoints (List functions):

```typescript
/**
 * functionName - Brief description
 * @route GET /path/:param
 * @method GET
 * @auth Public | Student | ClubAdmin | UniversityAdmin
 * @param {type} paramName - Description
 * @query cursor, limit (default 20, max 100), search, filter
 * @returns {Promise<Type[]>} Description
 * @status 200 | 400 | 401 | 403 | 404 | 500
 * @errors unauthorized | forbidden | not_found | validation_failed | internal
 * @pagination cursor + limit (default 20, max 100)
 * @caching ETag supported. If-None-Match supported.
 * @ratelimit X requests per minute
 * @Example `const result = await functionName('param');`
 */
```

## Template for GET endpoints (Single resource):

```typescript
/**
 * functionName - Brief description
 * @route GET /path/:param
 * @method GET
 * @auth Public | Student | ClubAdmin | UniversityAdmin
 * @param {type} paramName - Description
 * @returns {Promise<Type>} Description
 * @status 200 | 404 | 500
 * @errors not_found | internal
 * @caching ETag supported. If-None-Match supported.
 * @ratelimit X requests per minute
 * @Example `const result = await functionName('param');`
 */
```

## Template for POST endpoints (Create):

```typescript
/**
 * functionName - Brief description
 * @route POST /path
 * @method POST
 * @auth Student | ClubAdmin | UniversityAdmin
 * @param {type} payload - Description
 * @body { field1: type, field2: type }
 * @returns {Promise<Type>} Description
 * @status 201 | 400 | 401 | 403 | 409 | 500
 * @errors unauthorized | forbidden | validation_failed | conflict | internal
 * @idempotency Supports Idempotency-Key header
 * @ratelimit X requests per minute
 * @Example `const result = await functionName(payload);`
 */
```

## Template for PATCH/PUT endpoints (Update):

```typescript
/**
 * functionName - Brief description
 * @route PATCH /path/:param
 * @method PATCH
 * @auth Student | ClubAdmin | UniversityAdmin (+ owner if needed)
 * @param {type} paramName - Description
 * @param {type} payload - Description
 * @body { field1?: type, field2?: type }
 * @returns {Promise<Type>} Description
 * @status 200 | 400 | 401 | 403 | 404 | 409 | 500
 * @errors unauthorized | forbidden | not_found | validation_failed | conflict | internal
 * @idempotency Supports Idempotency-Key header
 * @ratelimit X requests per minute
 * @Example `const result = await functionName('param', payload);`
 */
```

## Template for DELETE endpoints:

```typescript
/**
 * functionName - Brief description
 * @route DELETE /path/:param
 * @method DELETE
 * @auth Student | ClubAdmin | UniversityAdmin (+ owner if needed)
 * @param {type} paramName - Description
 * @returns {Promise<{ success: boolean }>} Description
 * @status 200 | 401 | 403 | 404 | 500
 * @errors unauthorized | forbidden | not_found | internal
 * @idempotency Supports Idempotency-Key header
 * @ratelimit X requests per minute
 * @Example `const result = await functionName('param');`
 */
```

## Functions that need updates:

### Missing tags across most functions:

1. **@status** - Add HTTP status codes (200, 400, 401, 403, 404, 409, 500)
2. **@pagination** - For list functions (cursor + limit, default 20, max 100)
3. **@caching** - For GET requests (ETag supported. If-None-Match supported.)
4. **@ratelimit** - Add appropriate rate limits
5. **@query** - For functions with query parameters
6. **@body** - For POST/PATCH/PUT mutations
7. **@idempotency** - For non-GET operations
8. **@errors** - Use machine codes: unauthorized | forbidden | not_found | validation_failed | conflict | rate_limited | precondition_failed | internal

### Functions missing @errors entirely:

- listMyAdminClubs
- listClubMembershipRequests
- listClubFeedback
- createClubFeedback
- listClubProposals
- createClubProposal
- listFeedbackComments
- createFeedbackComment
- listProposalComments
- createProposalComment
- listPolicies
- createPolicy
- updatePolicy
- listActivityLog
- createAnnouncement

### Functions with incomplete @errors:

Most functions use inconsistent error descriptions instead of machine codes.

## Rate Limit Suggestions:

- List operations (public): 200-500 requests per minute
- Get single resource: 1000 requests per minute
- Admin operations: 100-300 requests per minute
- Create operations: 10-50 requests per minute
- User profile operations: 100 requests per minute
- File operations: 50 requests per minute

## Application Instructions:

1. Apply the appropriate template based on HTTP method and function type
2. Fill in specific details for each function
3. Use consistent machine error codes
4. Add appropriate rate limits based on operation type
5. Include @body for all mutations with proper schema
6. Add @query for functions with query parameters
7. Include @pagination for all list operations
8. Add @caching for all GET operations
9. Include @idempotency for all non-GET operations

This will ensure all API functions follow the documentation format conventions consistently.
