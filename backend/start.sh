#!/bin/bash
set -e

echo "⏳ Generating Prisma client..."
npx prisma generate

echo "⏳ Running database migrations..."
npx prisma migrate deploy

echo "⏳ Seeding database..."
npx prisma db seed || true

echo "🚀 Starting application..."
exec node dist/main
