#!/bin/bash
set -e

echo "⏳ Generating Prisma client..."
npx prisma generate

echo "⏳ Setting up database schema..."
npx prisma db push

echo "⏳ Seeding database..."
npx prisma db seed || true

echo "🚀 Starting application..."
exec node dist/main
