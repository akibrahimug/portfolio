# Dependency Cleanup After WebSocket Refactor

This document outlines the dependencies that were removed after the WebSocket refactor and the reasons for their removal.

## Removed Dependencies

### HTTP/API Dependencies

#### 1. `swr` (^2.1.3)

- **Reason**: Replaced by custom WebSocket hooks (`useProjects`, `useProject`, etc.)
- **Previous Usage**: Used in `client/pages/api/useFetch.ts` for HTTP data fetching
- **Replacement**: Custom React hooks in `client/hooks/useWebSocket.ts`

#### 2. `axios` (^1.1.3)

- **Reason**: Replaced by WebSocket client for API communication
- **Previous Usage**: Used in `client/components/AuthProvider.tsx` and `client/pages/restapi/messages.js`
- **Replacement**: WebSocket client in `client/lib/websocket.ts`

### Authentication Dependencies

#### 3. `next-auth` (^4.17.0)

- **Reason**: Not currently implemented in the WebSocket refactor
- **Previous Usage**: Authentication system (not actively used)
- **Status**: May be re-added when WebSocket authentication is implemented

#### 4. `passport` (^0.6.0)

- **Reason**: Not currently implemented in the WebSocket refactor
- **Previous Usage**: Authentication middleware (not actively used)
- **Status**: May be re-added when WebSocket authentication is implemented

#### 5. `jwt-decode` (^3.1.2)

- **Reason**: Used with old authentication system
- **Previous Usage**: Used in `client/components/AuthProvider.tsx`
- **Status**: May be re-added when JWT authentication is implemented for WebSocket

#### 6. `js-cookie` (^3.0.1) and `@types/js-cookie` (^3.0.6)

- **Reason**: Used with old authentication system for cookie management
- **Previous Usage**: Used in `client/components/AuthProvider.tsx`
- **Status**: May be re-added when cookie-based authentication is implemented

### Security Dependencies

#### 7. `bcryptjs` (^2.4.3)

- **Reason**: Client-side password hashing (security anti-pattern)
- **Previous Usage**: Not actively used in the codebase
- **Status**: Should remain removed - password hashing should be server-side only

## Dependencies That Were Kept

### Still in Use

#### 1. `react-hook-form` (^7.54.1)

- **Reason**: Still used in dashboard forms and new project creation
- **Usage**: `client/components/dashboard/DynamicForm.tsx`, `client/pages/restapi/newproject.tsx`

#### 2. `zod` (^3.24.1)

- **Reason**: Still used for form validation and schema definitions
- **Usage**: `client/lib/schemas.ts`, `client/components/dashboard/DynamicForm.tsx`

#### 3. `react-loading-skeleton` (^3.4.0)

- **Reason**: Still used in components for loading states
- **Usage**: `client/components/BigProject.tsx`, `client/components/Resume.tsx`, etc.

### UI/UX Dependencies

#### 4. `framer-motion` (^6.5.1)

- **Reason**: Used for animations throughout the application
- **Usage**: Various components for smooth transitions

#### 5. `@radix-ui/*` packages

- **Reason**: Used for UI components (buttons, dialogs, etc.)
- **Usage**: Various UI components throughout the application

#### 6. `@mui/material` and `@mui/icons-material`

- **Reason**: Used for Material-UI components
- **Usage**: Various components and icons

## Migration Status

### Completed

- ✅ WebSocket client implementation
- ✅ Custom React hooks for data fetching
- ✅ New project creation page
- ✅ Updated components to use WebSocket hooks
- ✅ Removed unused HTTP dependencies

### Pending

- ⏳ Full migration of all components from HTTP to WebSocket
- ⏳ Authentication implementation for WebSocket
- ⏳ Dashboard pages migration
- ⏳ Complete removal of old API routes

## Files That Need Attention

### Components Still Using Old HTTP API

1. `client/components/SmallProjects.tsx` - Still uses `NoAuthRoutes`
2. `client/components/AuthProvider.tsx` - Still uses axios and old auth
3. `client/pages/restapi/messages.js` - Still uses axios
4. Various dashboard pages - Still use old schemas and API

### Old API Files (Can be removed after full migration)

1. `client/pages/api/useFetch.ts` - Replaced by WebSocket hooks
2. `client/pages/api/NoAuthRoutes.ts` - Replaced by WebSocket client
3. `client/pages/api/Config.ts` - Replaced by `client/lib/config.ts`

## Next Steps

1. **Complete Component Migration**: Update remaining components to use WebSocket hooks
2. **Remove Old API Files**: Delete unused API files after full migration
3. **Implement Authentication**: Add JWT authentication to WebSocket client
4. **Update Documentation**: Update README and other docs to reflect new architecture
5. **Testing**: Ensure all functionality works with new WebSocket system

## Notes

- The Node.js version incompatibility (18.15.0 vs required 18.17.0) is preventing proper dependency management
- Some dependencies may need to be re-added when authentication is implemented
- The cleanup is conservative - only removed dependencies that are definitely unused
- Dashboard functionality may need to be re-evaluated or migrated to the new WebSocket system
