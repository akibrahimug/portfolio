# CRUD Operations Test Suite

Comprehensive testing suite for all client-side CRUD operations, data validation, and authentication flows in the portfolio application.

## 🎯 Test Coverage Overview

This test suite covers:

- ✅ **HTTP Client Methods** - All REST API calls with proper error handling
- ✅ **React Hooks** - Custom hooks for data fetching and mutations
- ✅ **Authentication Flow** - Token handling, refresh scenarios, and edge cases
- ✅ **Integration Tests** - End-to-end CRUD workflows
- ✅ **Error Scenarios** - Network errors, validation failures, and recovery
- ✅ **Data Consistency** - State management and data synchronization

## 📁 Test Structure

```
client/__tests__/
├── README.md                                    # This file
├── test-runner.ts                              # Custom test runner
├── auth/
│   └── authentication-flow.test.ts            # Auth token handling tests
└── integration/
    └── crud-operations.integration.test.tsx    # End-to-end CRUD tests

client/hooks/__tests__/
├── useHttpApi.test.ts                          # Original project tests
├── useHttpApi-complete.test.ts                 # Complete CRUD hook tests
└── useClerkAuth.test.ts                        # Authentication hook tests

client/lib/__tests__/
├── http-client-complete.test.ts                # Complete HTTP client tests
└── uploadAsset.test.ts                         # Asset upload tests
```

## 🚀 Running Tests

### Quick Start
```bash
# Run all CRUD tests
npm run test:crud

# Run with verbose output
npm run test:crud -- --verbose

# List available test suites
npm run test:crud -- --list

# Run specific test suite
npm run test:crud -- --suite "HTTP Client"
```

### Individual Test Files
```bash
# HTTP Client tests
npm test -- lib/__tests__/http-client-complete.test.ts

# Hooks tests
npm test -- hooks/__tests__/useHttpApi-complete.test.ts

# Integration tests
npm test -- __tests__/integration/crud-operations.integration.test.tsx

# Authentication tests
npm test -- __tests__/auth/authentication-flow.test.ts
```

## 📊 Test Categories

### 1. HTTP Client Tests (`lib/__tests__/http-client-complete.test.ts`)

**What it tests:**
- All CRUD operations for Projects, Experiences, Technologies, Messages, Resumes, Badges
- HTTP error handling (401, 403, 404, 422, 429, 500)
- Network timeouts and CORS errors
- Response parsing and data validation
- Query parameter handling
- Authentication header management

**Key scenarios:**
```typescript
// Example: Testing project creation with validation errors
it('should handle validation errors during creation', async () => {
  mockFetch.mockResolvedValueOnce({
    ok: false,
    status: 422,
    json: () => Promise.resolve({
      error: 'Validation failed',
      errors: ['Title is required', 'Slug must be unique']
    })
  })

  const result = await httpClient.createProject(invalidData, 'token')

  expect(result.success).toBe(false)
  expect(result.errors).toContain('Title is required')
})
```

### 2. Hooks Tests (`hooks/__tests__/useHttpApi-complete.test.ts`)

**What it tests:**
- React hook lifecycle and state management
- Loading states during operations
- Error state handling and recovery
- Authentication token integration
- Data caching and refetch functionality
- Concurrent hook operations

**Key scenarios:**
```typescript
// Example: Testing complete CRUD lifecycle
it('should complete full CRUD lifecycle for experiences', async () => {
  // Test CREATE
  const createResponse = await createResult.current.mutate(newData)
  expect(createResponse).toEqual(expect.objectContaining(newData))

  // Test READ
  expect(readResult.current.data).toContain(newData)

  // Test UPDATE
  const updateResponse = await updateResult.current.mutate({ id, updates })
  expect(updateResponse).toEqual(expect.objectContaining(updates))

  // Test DELETE
  const deleteResponse = await deleteResult.current.mutate(id)
  expect(deleteResponse).toEqual({ ok: true })
})
```

### 3. Integration Tests (`__tests__/integration/crud-operations.integration.test.tsx`)

**What it tests:**
- Complete data flow from UI to API
- Data consistency across operations
- Error propagation and handling
- Concurrent operations
- State synchronization between hooks

**Key scenarios:**
```typescript
// Example: Testing data consistency
it('should maintain data consistency across operations', async () => {
  // Create experience
  await createExperience(data1)

  // Verify it appears in list
  const list1 = await getExperiences()
  expect(list1).toContain(data1)

  // Update experience
  await updateExperience(id, updates)

  // Verify updates are reflected
  const list2 = await getExperiences()
  expect(list2.find(item => item.id === id)).toEqual(expect.objectContaining(updates))
})
```

### 4. Authentication Tests (`__tests__/auth/authentication-flow.test.ts`)

**What it tests:**
- Token availability and refresh scenarios
- Authentication state changes
- Token expiry handling
- Concurrent requests with token management
- Error recovery from auth failures

**Key scenarios:**
```typescript
// Example: Testing token refresh on page reload
it('should handle missing token on page refresh', async () => {
  const getTokenMock = jest.fn()
    .mockResolvedValueOnce(null)        // Initial load - no token
    .mockResolvedValueOnce('new-token') // After auth loads

  // First attempt should fail
  const result1 = await fetchData()
  expect(result1.error).toBe('No auth token')

  // Retry should succeed
  const result2 = await fetchData()
  expect(result2.data).toBeDefined()
})
```

## 🔍 Data Validation Tests

### Experience Data Structure
```typescript
interface Experience {
  _id: string
  title: string                    // ✅ Required
  company: string                  // ✅ Required
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship'
  location: string
  locationType: 'On-site' | 'Remote' | 'Hybrid'
  description: string
  startDate: string               // ✅ Required, format: YYYY-MM
  endDate?: string                // Optional if current = true
  current: boolean
  skills: string[]
  companyLogoUrl?: string
  linkedinUrl?: string
  ownerId: string
}
```

### Technology Data Structure
```typescript
interface Technology {
  _id: string
  name: string                    // ✅ Required
  category: 'frontend' | 'backend' | 'database' | 'devops' | 'mobile' | 'other'
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  description?: string
  iconUrl?: string
  websiteUrl?: string
  experience?: number             // Months of experience
  lastUsed?: string              // YYYY-MM format
  featured: boolean
  ownerId: string
}
```

### Message Data Structure
```typescript
interface Message {
  _id: string
  name: string                    // ✅ Required
  email: string                   // ✅ Required, valid email
  subject: string                 // ✅ Required
  message: string                 // ✅ Required
  status: 'unread' | 'read' | 'archived'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}
```

## 🚨 Error Scenarios Tested

### 1. Authentication Errors
- Missing or expired tokens
- Invalid token formats
- Insufficient permissions
- Token refresh failures

### 2. Network Errors
- Request timeouts
- Connection failures
- CORS issues
- Rate limiting (429)

### 3. Validation Errors
- Missing required fields
- Invalid data formats
- Business rule violations
- Duplicate entries

### 4. Server Errors
- 500 Internal Server Error
- Database connection issues
- Service unavailable
- Malformed responses

## 📈 Expected Test Results

### Success Criteria
- ✅ All HTTP methods return expected data structures
- ✅ Error responses include meaningful error messages
- ✅ Loading states transition correctly
- ✅ Authentication tokens are handled properly
- ✅ Data consistency maintained across operations
- ✅ Concurrent operations don't conflict

### Performance Expectations
- HTTP client tests: < 2 seconds
- Hook tests: < 5 seconds
- Integration tests: < 10 seconds
- Authentication tests: < 3 seconds

## 🛠️ Troubleshooting Common Issues

### "No auth token" Error
The experiences page showing "No auth token" on refresh is addressed by these tests:

```typescript
// This test validates the fix for the refresh issue
it('should handle missing token on page refresh', async () => {
  // Simulates the exact scenario you encountered
  // Tests token availability after page refresh
  // Validates error recovery mechanisms
})
```

### Test Failures
1. **Mock Setup Issues**: Ensure all dependencies are properly mocked
2. **Async Timing**: Use `waitFor` for async operations
3. **State Cleanup**: Clear mocks between tests
4. **Token Handling**: Mock Clerk auth consistently

### Running Specific Tests
```bash
# Test only experiences CRUD
npm test -- --testNamePattern="Experiences CRUD"

# Test only authentication flows
npm test -- --testNamePattern="Authentication"

# Test specific file with watch mode
npm test -- hooks/__tests__/useHttpApi-complete.test.ts --watch
```

## 📝 Adding New Tests

When adding new CRUD operations:

1. **Add HTTP Client Tests**
   ```typescript
   describe('New Resource CRUD', () => {
     it('should create resource successfully', async () => {
       // Test creation
     })

     it('should handle validation errors', async () => {
       // Test error cases
     })
   })
   ```

2. **Add Hook Tests**
   ```typescript
   describe('useNewResource', () => {
     it('should fetch resources with auth token', async () => {
       // Test hook functionality
     })
   })
   ```

3. **Add Integration Tests**
   ```typescript
   it('should complete full CRUD lifecycle for new resource', async () => {
     // Test end-to-end flow
   })
   ```

4. **Update Test Runner**
   Add new test suite to `testSuites` array in `test-runner.ts`

## 🎯 Next Steps

1. **Run the test suite**: `npm run test:crud`
2. **Fix any failing tests**: Address authentication and data handling issues
3. **Add missing tests**: For any uncovered CRUD operations
4. **Set up CI/CD**: Integrate tests into deployment pipeline
5. **Monitor coverage**: Ensure high test coverage for all CRUD operations

The comprehensive test suite will help identify and fix the "No auth token" error you encountered and ensure all CRUD operations work reliably across different scenarios.