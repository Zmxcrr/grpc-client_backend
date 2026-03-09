# gRPC Client Backend

NestJS backend providing REST API, GraphQL API, and SSE streams, with gRPC upstream proxy, JWT authentication, RBAC, and more.

Built-in frontend UI is available at `/` (served from `public/`) for quick interaction with auth, search, history, favorites, and saved searches.

## Features

- **REST API** with Swagger/OpenAPI documentation at `/api`
- **GraphQL API** with Apollo Playground at `/graphql`
- **SSE Streams** for real-time user notifications and admin monitoring
- **gRPC Proxy** - proxies search requests to upstream gRPC service
- **JWT Authentication** with HttpOnly cookie support
- **RBAC** - Role-based access control (USER, PREMIUM, MODERATOR, ADMIN)
- **Rate Limiting** - Role-based request throttling
- **Caching** - In-memory caching for favorites and search history
- **Audit Logging** - All gRPC calls logged with real-time admin SSE stream

## Domain Entities

- **User** - id, email, passwordHash, role, createdAt
- **Favorite** - userId, itemId, payload (jsonb), collectionId, createdAt
- **FavoriteCollection** - userId, name, createdAt
- **SearchHistory** - userId, query, filters (jsonb), createdAt
- **SavedSearch** - userId, name, query, filters (jsonb), createdAt
- **GrpcCallLog** - userId, service, method, request (jsonb), durationMs, status, errorMessage, createdAt

## Tech Stack

- Node.js + TypeScript
- NestJS (REST Controllers, GraphQL Resolvers, SSE)
- Apollo Server (GraphQL)
- gRPC (@grpc/grpc-js, @grpc/proto-loader)
- PostgreSQL + TypeORM
- Passport JWT + bcrypt
- @nestjs/throttler (rate limiting)
- cache-manager (in-memory caching)
- class-validator (input validation)
- Swagger/OpenAPI

## Setup

```bash
# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Run in development mode
npm run start:dev

# Build for production
npm run build
npm run start:prod
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| DB_HOST | localhost | PostgreSQL host |
| DB_PORT | 5432 | PostgreSQL port |
| DB_USERNAME | postgres | Database username |
| DB_PASSWORD | postgres | Database password |
| DB_DATABASE | grpc_client | Database name |
| JWT_SECRET | default-secret | JWT signing secret |
| JWT_EXPIRATION | 3600s | JWT token expiry |
| GRPC_URL | localhost:50051 | Upstream gRPC service URL |
| PORT | 3000 | Application port |

## API Endpoints

### REST

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /auth/register | - | Register new user |
| POST | /auth/login | - | Login user |
| POST | /auth/set-role | ADMIN | Set user role |
| POST | /proxy/search | JWT | Proxy search to gRPC |
| GET | /history | JWT | Get search history |
| DELETE | /history | JWT | Clear search history |
| GET | /favorites | JWT | Get favorites |
| POST | /favorites | JWT | Add to favorites |
| DELETE | /favorites/:itemId | JWT | Remove from favorites |
| GET | /favorite-collections | JWT | Get collections |
| POST | /favorite-collections | JWT | Create collection |
| PATCH | /favorite-collections/:id | JWT | Update collection |
| DELETE | /favorite-collections/:id | JWT | Delete collection |
| GET | /saved-searches | JWT | Get saved searches |
| POST | /saved-searches | JWT | Create saved search |
| PATCH | /saved-searches/:id | JWT | Update saved search |
| DELETE | /saved-searches/:id | JWT | Delete saved search |
| GET | /grpc-call-logs | MOD/ADMIN | Get gRPC call logs |

### SSE

| Path | Auth | Description |
|------|------|-------------|
| GET /sse/events | JWT | User notifications stream |
| GET /sse/admin/grpc-calls | MOD/ADMIN | Admin gRPC monitoring stream |

### GraphQL

Available at `/graphql` with queries: `proxySearch`, `favorites`, `favoriteCollections`, `history`, `savedSearches`, `grpcCallLogs`

And mutations: `register`, `login`, `setUserRole`, `addFavorite`, `removeFavorite`, `createCollection`, `updateCollection`, `deleteCollection`, `clearHistory`, `createSavedSearch`, `updateSavedSearch`, `deleteSavedSearch`

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run e2e tests
npm run test:e2e
```

## RBAC Roles

| Role | Permissions |
|------|------------|
| USER | Search, history, favorites, saved searches, SSE notifications |
| PREMIUM | Same as USER with higher rate limits (180/min) |
| MODERATOR | USER + access to gRPC call logs and admin SSE (300/min) |
| ADMIN | Full access + user role management (1000/min) |
