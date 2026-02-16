# File Upload Service

A production-ready file upload service built with TypeScript, Node.js, Express, and MySQL using Prisma ORM.

## Project Structure

```
src/
├── config/                  # Configuration layer
│   ├── environment.ts       # Environment variables validation
│   ├── database.ts          # Prisma database client
│   ├── storage.ts           # File storage settings
│   └── constants.ts         # App-wide constants
│
├── controllers/             # HTTP request handlers
│   └── fileController.ts    # File upload/download/list endpoints
│
├── services/                # Business logic layer
│   ├── fileService.ts       # File upload orchestration
│   └── storageService.ts    # Disk storage operations
│
├── repositories/            # Data access layer
│   └── fileRepository.ts    # Database queries for files
│
├── routes/                  # API endpoint definitions
│   ├── files.ts             # File endpoints
│   ├── health.ts            # Health check endpoints
│   └── index.ts             # Route aggregator
│
├── middlewares/             # Express middleware
│   ├── errorHandler.ts      # Global error handling
│   ├── fileUpload.ts        # Multer file upload config
│   ├── requestId.ts         # Request ID tracking
│   └── requestLogger.ts     # HTTP request logging
│
├── errors/                  # Custom error classes
│   ├── AppError.ts          # Base error class
│   ├── ValidationError.ts   # Validation errors
│   ├── FileUploadError.ts   # File upload errors
│   └── NotFoundError.ts     # 404 errors
│
├── utils/                   # Utility functions
│   ├── asyncHandler.ts      # Async route wrapper
│   ├── fileUploadUtils.ts   # File helper functions
│   ├── logger.ts            # Winston logger config
│   ├── requestLogger.ts     # Request logging middleware
│   ├── responseFormatter.ts # Standardized API responses
│   └── validators.ts        # Joi validation schemas
│
├── types/                   # TypeScript type definitions
│   ├── express.d.ts         # Express Request/Response types
│   ├── api.ts               # API response types
│   └── models.ts            # Database model types
│
├── generated/               # Auto-generated files
│   └── prisma/              # Prisma client types
│
└── index.ts                 # Server entry point
```

## Architecture Pattern

### Layered Architecture
- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic and orchestrate operations
- **Repositories**: Handle database queries (data access layer)
- **Middlewares**: Process requests before reaching controllers
- **Errors**: Custom error handling with specific status codes

### Benefits of This Structure
1. **Separation of Concerns**: Each layer has a single responsibility
2. **Testability**: Services can be tested independently
3. **Reusability**: Services can be called from multiple controllers
4. **Maintainability**: Easy to locate and modify code
5. **Scalability**: Easy to add new features without affecting existing code

## Tech Stack

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Database**: MySQL (via Prisma ORM)
- **ORM**: Prisma (type-safe, migrations built-in)
- **File Upload**: Multer (streaming, memory storage)
- **Validation**: Joi (schema validation)
- **Logging**: Winston (structured logging)
- **Security**: Helmet (security headers), Express Rate Limit

## API Endpoints

### File Operations
- `POST /api/files` - Upload a file
- `GET /api/files` - List all files with pagination
- `GET /api/files/:id` - Get file metadata
- `GET /api/files/:id/download` - Download file
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/stats` - Get file statistics

### Health Check
- `GET /api/health` - Simple health check
- `GET /api/health/status` - Detailed server status

## Getting Started

### Prerequisites
- Node.js 18+
- MySQL 8+
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   # Copy .env and configure your database URL
   cp .env .env.local
   # Edit .env.local and set DATABASE_URL
   ```

3. **Generate Prisma types** (after setting DATABASE_URL):
   ```bash
   npx prisma generate
   # Then run migrations:
   npx prisma migrate dev --name init
   ```

4. **Build TypeScript**:
   ```bash
   npm run build
   ```

5. **Start the server**:
   ```bash
   # Development
   npm run dev

   # Production
   npm start
   ```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Database Schema

### File Model
```sql
- id (String, Primary Key, unique ID)
- filename (String, original filename)
- mimetype (String, file MIME type)
- size (Int, file size in bytes)
- hash (String, SHA-256 unique hash for deduplication)
- storagePath (String, path where file is stored)
- uploadedAt (DateTime, upload timestamp)
- updatedAt (DateTime, last update timestamp)
- expiresAt (DateTime?, optional expiration date)
```

## Best Practices Implemented

1. **Error Handling**: Centralized error handling with specific error types
2. **Input Validation**: Joi schemas for request validation
3. **Type Safety**: Full TypeScript with strict mode
4. **Logging**: Structured logging with Winston
5. **Security**: Rate limiting, helmet headers, input sanitization
6. **Code Organization**: Clear separation of concerns
7. **Configuration**: Environment-based configuration
8. **Database**: ORM with type safety via Prisma
9. **Async Handling**: Proper async/await error handling
10. **Graceful Shutdown**: Clean shutdown on SIGTERM/SIGINT

## ORM: Prisma

**Why Prisma?**
- Modern, TypeScript-first design
- Auto-generated, type-safe client
- Built-in migration system
- Excellent developer experience
- Clear query syntax (not SQL strings)
- Supports MySQL, PostgreSQL, SQLite, and more

**Key Features Used**:
- Migrations: `prisma migrate` for schema versioning
- Studio: `prisma studio` for database GUI
- Client: Auto-generated type-safe client

## File Upload Configuration

- **Max file size**: 50MB (configurable via `MAX_FILE_SIZE` env var)
- **Storage**: Local filesystem (`src/uploads/`)
- **Allowed types**: Images, PDFs, Office docs, archives
- **Deduplication**: SHA-256 hashing prevents duplicate uploads
- **Safe naming**: Prevents filename conflicts

## Next Steps for Learning

1. **Connect to MySQL**: Set `DATABASE_URL` and run migrations
2. **Implement Authentication**: Add JWT or session-based auth
3. **Add Tests**: Unit tests for services, endpoint tests
4. **Cloud Storage**: Replace local storage with S3/GCS
5. **Rate Limiting**: Enhance with user-based rate limits
6. **Virus Scanning**: Integrate with ClamAV for security
7. **Deployment**: Deploy to AWS EC2, Heroku, or Vercel

## Environment Variables

```bash
PORT=3000                                    # Server port
NODE_ENV=development                         # Environment
DATABASE_URL="mysql://user:pass@localhost:3306/db"  # Database URL
MAX_FILE_SIZE=52428800                      # Max file size (50MB)
UPLOAD_DIR="./src/uploads"                  # Uploads directory
LOG_LEVEL=debug                              # Log level
```

## Troubleshooting

**Prisma Generation Issues**:
If Prisma types aren't generating, ensure DATABASE_URL is set and MySQL is running.

**File Upload Fails**:
- Check file size limits
- Verify MIME type is allowed
- Ensure `src/uploads/` directory exists and is writable

**Database Connection**:
- Verify MySQL is running
- Check DATABASE_URL format: `mysql://user:password@host:port/database`
- Ensure user has CREATE/ALTER permissions for migrations

## Resources

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Multer Docs](https://github.com/expressjs/multer)
- [Joi Validation](https://joi.dev/)
