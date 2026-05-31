.PHONY: test test-backend test-frontend test-all

test-backend:
	docker compose exec backend pytest apps/ -v --tb=short

test-frontend:
	cd frontend && npm test -- --passWithNoTests

test: test-backend test-frontend
	@echo "All tests complete"

test-coverage:
	docker compose exec backend pytest apps/ --cov=apps --cov-report=term-missing

lint-backend:
	docker compose exec backend flake8 apps/ --max-line-length=100

lint-frontend:
	cd frontend && npm run lint

pre-push:
	bash scripts/pre-push-check.sh

deploy-check:
	docker compose exec backend python manage.py check --deploy
