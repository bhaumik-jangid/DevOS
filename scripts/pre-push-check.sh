#!/bin/bash
set -e

echo "=== DevOS Pre-push Check ==="

echo ""
echo "--- Backend tests ---"
docker compose exec backend pytest apps/ -v --tb=short -q
if [ $? -ne 0 ]; then
  echo "FAILED: Backend tests failed. Fix before pushing."
  exit 1
fi

echo ""
echo "--- Backend lint ---"
docker compose exec backend flake8 apps/ --max-line-length=100 --exclude=migrations -q
if [ $? -ne 0 ]; then
  echo "FAILED: Linting failed. Fix before pushing."
  exit 1
fi

echo ""
echo "--- Frontend type check ---"
cd frontend && npx tsc --noEmit
if [ $? -ne 0 ]; then
  echo "FAILED: TypeScript errors. Fix before pushing."
  exit 1
fi
cd ..

echo ""
echo "--- Frontend lint ---"
cd frontend && npm run lint --quiet
if [ $? -ne 0 ]; then
  echo "FAILED: Frontend lint failed. Fix before pushing."
  exit 1
fi
cd ..

echo ""
echo "=== All checks passed. Safe to push. ==="
