#!/bin/bash

# Project Restructuring Migration Script
# This script moves files to the new structure while preserving git history

echo "Starting project restructuring..."

# Create all necessary directories
echo "Creating directory structure..."

# Server directories
mkdir -p src/server/api/routers/onboarding
mkdir -p src/server/api/routers/dashboard
mkdir -p src/server/api/middlewares
mkdir -p src/server/db
mkdir -p src/server/services/onboarding
mkdir -p src/server/services/vendor

# Feature directories
mkdir -p src/features/onboarding/components
mkdir -p src/features/onboarding/hooks
mkdir -p src/features/onboarding/stores
mkdir -p src/features/onboarding/schemas
mkdir -p src/features/onboarding/types

mkdir -p src/features/dashboard/components
mkdir -p src/features/dashboard/hooks
mkdir -p src/features/dashboard/stores
mkdir -p src/features/dashboard/types

mkdir -p src/features/notifications/components
mkdir -p src/features/notifications/stores
mkdir -p src/features/notifications/types

mkdir -p src/features/analytics/components
mkdir -p src/features/analytics/hooks
mkdir -p src/features/analytics/types

# Shared directories
mkdir -p src/components/layout
mkdir -p src/components/forms
mkdir -p src/components/providers
mkdir -p src/lib/supabase
mkdir -p src/lib/validators
mkdir -p src/hooks
mkdir -p src/types/generated

echo "✅ Directory structure created"

# Phase 1: Move Server-Side Code
echo ""
echo "Phase 1: Moving server-side code..."

# API Routers
if [ -d "app/router/onboarding" ]; then
  git mv app/router/onboarding/*.ts src/server/api/routers/onboarding/
  echo "✅ Moved onboarding routers"
fi

if [ -f "app/router/index.ts" ]; then
  git mv app/router/index.ts src/server/api/index.ts
  echo "✅ Moved router index"
fi

# Middlewares
if [ -f "app/middlewares/auth.ts" ]; then
  git mv app/middlewares/auth.ts src/server/api/middlewares/auth.ts
  echo "✅ Moved auth middleware"
fi

# Database clients
if [ -f "lib/prisma.ts" ]; then
  git mv lib/prisma.ts src/server/db/client.ts
  echo "✅ Moved Prisma client"
fi

if [ -f "lib/redis.ts" ]; then
  git mv lib/redis.ts src/server/db/redis.ts
  echo "✅ Moved Redis client"
fi

if [ -f "lib/orpc.server.ts" ]; then
  git mv lib/orpc.server.ts src/server/api/orpc.server.ts
  echo "✅ Moved oRPC server config"
fi

# Services
if [ -f "lib/onboarding.ts" ]; then
  git mv lib/onboarding.ts src/server/services/onboarding/index.ts
  echo "✅ Moved onboarding service"
fi

if [ -f "lib/vendorType.ts" ]; then
  git mv lib/vendorType.ts src/server/services/vendor/vendor-type.ts
  echo "✅ Moved vendor type service"
fi

# Phase 2: Move Feature Code
echo ""
echo "Phase 2: Moving feature code..."

# Onboarding Feature
if [ -d "app/onboarding/_components" ]; then
  git mv app/onboarding/_components/*.tsx src/features/onboarding/components/
  echo "✅ Moved onboarding components"
fi

if [ -f "store/onboardingStore.ts" ]; then
  git mv store/onboardingStore.ts src/features/onboarding/stores/onboarding-store.ts
  echo "✅ Moved onboarding store"
fi

if [ -f "hooks/useOnboardingAPI.ts" ]; then
  git mv hooks/useOnboardingAPI.ts src/features/onboarding/hooks/use-onboarding-api.ts
  echo "✅ Moved onboarding hooks"
fi

# Dashboard Feature
if [ -d "app/dashboard/_components" ]; then
  # Move all except notification-modal
  for file in app/dashboard/_components/*.tsx; do
    filename=$(basename "$file")
    if [ "$filename" != "notification-modal.tsx" ]; then
      git mv "$file" src/features/dashboard/components/
    fi
  done
  echo "✅ Moved dashboard components"
fi

if [ -f "store/vendor-store.ts" ]; then
  git mv store/vendor-store.ts src/features/dashboard/stores/vendor-store.ts
  echo "✅ Moved vendor store"
fi

# Notifications Feature
if [ -f "app/dashboard/_components/notification-modal.tsx" ]; then
  git mv app/dashboard/_components/notification-modal.tsx src/features/notifications/components/notification-modal.tsx
  echo "✅ Moved notification modal"
fi

if [ -f "store/notification-store.tsx" ]; then
  git mv store/notification-store.tsx src/features/notifications/stores/notification-store.ts
  echo "✅ Moved notification store"
fi

# Phase 3: Move Shared Code
echo ""
echo "Phase 3: Moving shared code..."

# Providers
if [ -f "components/ui/AuthProvider.tsx" ]; then
  git mv components/ui/AuthProvider.tsx src/components/providers/auth-provider.tsx
  echo "✅ Moved auth provider"
fi

if [ -f "lib/theme-provider.tsx" ]; then
  git mv lib/theme-provider.tsx src/components/providers/theme-provider.tsx
  echo "✅ Moved theme provider"
fi

# Utilities
if [ -f "lib/utils.ts" ]; then
  git mv lib/utils.ts src/lib/utils.ts
  echo "✅ Moved utils"
fi

if [ -f "lib/orpc.ts" ]; then
  git mv lib/orpc.ts src/lib/orpc.ts
  echo "✅ Moved oRPC client config"
fi

if [ -d "utils/supabase" ]; then
  git mv utils/supabase/*.ts src/lib/supabase/
  echo "✅ Moved Supabase utilities"
fi

# Hooks
if [ -f "hooks/use-mobile.ts" ]; then
  git mv hooks/use-mobile.ts src/hooks/use-mobile.ts
  echo "✅ Moved mobile hook"
fi

# Generated types
if [ -d "app/generated" ]; then
  git mv app/generated/* src/types/generated/
  echo "✅ Moved generated types"
fi

# Phase 4: Move RPC route
echo ""
echo "Phase 4: Moving API routes..."

if [ -d "app/rpc" ]; then
  mkdir -p app/api/rpc
  git mv app/rpc/* app/api/rpc/
  echo "✅ Moved RPC route to app/api"
fi

# Phase 5: Cleanup empty directories
echo ""
echo "Phase 5: Cleaning up empty directories..."

# Remove empty directories (git doesn't track empty dirs)
find . -type d -empty -delete 2>/dev/null || true

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Update import paths in all files"
echo "2. Update tsconfig.json with new path aliases"
echo "3. Test the application"
echo "4. Commit the changes"
