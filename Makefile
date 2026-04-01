.PHONY: dev dev-chat dev-all build start lint lint-fix format test test-watch test-ui test-coverage e2e e2e-ui storybook storybook-build analyze db-generate db-migrate db-studio chat-build chat-start

# ── Dev ──────────────────────────────────────────────────────────────────────
dev:
	pnpm dev

dev-chat:
	cd services/chat && pnpm dev

dev-all:
	@echo "Starting Next.js and chat microservice..."
	@lsof -ti:3001 | xargs kill -9 2>/dev/null || true
	@trap 'kill 0' INT; \
	pnpm dev & \
	(cd services/chat && pnpm dev) & \
	wait

# ── Build ────────────────────────────────────────────────────────────────────
build:
	pnpm build

build-all: build chat-build

start:
	pnpm start

analyze:
	pnpm analyze

# ── Lint & Format ────────────────────────────────────────────────────────────
lint:
	pnpm lint

lint-fix:
	pnpm lint:fix

format:
	pnpm format

prettier:
	pnpm prettier

prettier-fix:
	pnpm prettier:fix

# ── Tests ────────────────────────────────────────────────────────────────────
test:
	pnpm test

test-watch:
	pnpm test:watch

test-ui:
	pnpm test:ui

test-coverage:
	pnpm test:coverage

e2e:
	pnpm e2e:headless

e2e-ui:
	pnpm e2e:ui

# ── Storybook ────────────────────────────────────────────────────────────────
storybook:
	pnpm storybook

storybook-build:
	pnpm build-storybook

# ── Database ─────────────────────────────────────────────────────────────────
db-generate:
	pnpm prisma generate

db-migrate:
	pnpm prisma migrate dev

db-migrate-deploy:
	pnpm prisma migrate deploy

db-studio:
	pnpm prisma studio

db-push:
	pnpm prisma db push

# ── Chat Microservice ─────────────────────────────────────────────────────────
chat-build:
	cd services/chat && pnpm build

chat-start:
	cd services/chat && pnpm start
