# Current Folder Structure

## `src/` Directory
- **features/**: Contains feature-based modules
  - `analytics/`
  - `dashboard/`
  - `notifications/`
  - `onboarding/`
- **server/**: Server-side logic
  - `api/`: API routers and middlewares
  - `db/`: Database clients (Prisma, Redis)
  - `services/`: Business logic services
- **components/**: Shared UI components
- **lib/**: Shared utilities
- **types/**: Shared TypeScript types

## `app/` Directory (Next.js Routes)
- **(landing)/**: Marketing/Landing pages
- **dashboard/**: Dashboard routes
- **onboarding/**: Onboarding routes
- **api/**: API routes
- **generated/**: Generated code (e.g., Prisma client)

## `prisma/` Directory
- `schema.prisma`: Database schema definition

For a detailed visual guide and architectural principles, please refer to **[PROJECT_STRUCTURE_VISUAL.md](./PROJECT_STRUCTURE_VISUAL.md)**.
