#!/bin/sh

echo "Running Prisma migrations..."

npx prisma migrate deploy

echo "Starting NestJS..."

exec npm run start:prod