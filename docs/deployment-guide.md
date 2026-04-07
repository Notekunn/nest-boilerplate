# Deployment Guide

Quick-start guide for deploying nest-boilerplate. For detailed environment-specific instructions, see related docs.

---

## Quick Start

### Prerequisites

- **Node.js** >=22.14, **pnpm** >=9.0
- **PostgreSQL** 14+ (local or managed)
- **Docker** optional (recommended for consistency)

### Local Development (5 min)

```bash
git clone https://github.com/yourorg/nest-boilerplate.git
cd nest-boilerplate
pnpm install
cp .env.example .env

# Start PostgreSQL
docker compose up -d postgres

# Run migrations & start
pnpm migration:run
pnpm start:dev

# Navigate to http://localhost:3000/docs (Swagger UI)
```

### Docker Deployment

```bash
# Build image
docker build -t nest-boilerplate:1.17.1 .

# Run with env file
docker run -p 3000:3000 --env-file .env.prod nest-boilerplate:1.17.1

# Or use Docker Compose
docker compose up -d
```

---

## Environment Configuration

All config via environment variables (see `.env.example`):

| Variable                                                      | Purpose                                            | Example                   |
| ------------------------------------------------------------- | -------------------------------------------------- | ------------------------- |
| `NODE_ENV`                                                    | Feature toggles                                    | `production`              |
| `SERVICE_HOST` / `SERVICE_PORT`                               | Bind address                                       | `0.0.0.0` / `3000`        |
| `JWT_SECRET_KEY`                                              | Token signing (MUST be random in prod)             | `openssl rand -base64 32` |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | Database connection                                | See template              |
| `CORS_ORIGINS`                                                | Allowed origins (comma-separated or empty for all) | `https://app.example.com` |
| `DB_AUTO_RUN_MIGRATIONS`                                      | Auto-run migrations on boot                        | `false` (manual in prod)  |

**Development:** Keep `DB_AUTO_RUN_MIGRATIONS=true`, `DB_LOGGING=true`
**Production:** Set `DB_AUTO_RUN_MIGRATIONS=false`, use separate migration step

---

## Database Migrations

```bash
# Generate from entity changes
pnpm migration:generate AddNewTable

# Run pending migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert

# Show migration status
pnpm exec typeorm migration:show
```

**Safety:** Always test migrations on staging first. Backup production before running.

---

## Database Seeding

```bash
# Run all seeders
pnpm seed:run

# Run specific seeder
pnpm seed:run --only admin-user
```

**Note:** Seeding blocked in production (`NODE_ENV !== 'production'`). Always make seeders idempotent.

---

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

---

## Deployment Strategies

### 1. Docker + Cloud (ECS, Cloud Run, etc.)

```bash
docker build -t registry/nest-boilerplate:1.17.1 .
docker push registry/nest-boilerplate:1.17.1

# Update service (example: AWS ECS)
aws ecs update-service --cluster prod --service nest-boilerplate --force-new-deployment
```

### 2. Kubernetes

```bash
# Create ConfigMap & Secret first
kubectl create configmap app-config --from-literal=db-host=postgres.default
kubectl create secret generic app-secrets --from-literal=jwt-secret=$(openssl rand -base64 32)

# Deploy
kubectl apply -f k8s-deployment.yaml
```

See `system-architecture.md` for Kubernetes manifest template.

### 3. Virtual Machine

```bash
ssh user@server.com
cd /app/nest-boilerplate
git pull origin main
pnpm install && pnpm build
pnpm migration:run
sudo systemctl restart nest-boilerplate
```

---

## Secrets Management

**Development:** `.env` file (git-ignored)

**Staging/Production:** Never commit `.env`. Use:

- Docker: `--env-file /secure/prod.env`
- Kubernetes: `secretKeyRef`
- AWS: Secrets Manager or Parameter Store
- Azure: Key Vault
- GCP: Secret Manager

---

## Health Checks & Monitoring

```bash
# Check health endpoint
curl http://localhost:3000/health

# View logs (Docker)
docker logs -f nest-boilerplate

# View logs (Kubernetes)
kubectl logs -f deployment/nest-boilerplate

# View logs (systemd)
journalctl -u nest-boilerplate -f
```

Recommended: Prometheus + Grafana, ELK Stack, or Datadog for production.

---

## Rollback

```bash
# Docker: Use previous image tag
docker tag registry/nest-boilerplate:1.17.0 registry/nest-boilerplate:latest

# Kubernetes: Rollback deployment
kubectl rollout undo deployment/nest-boilerplate

# Database: Revert migration
pnpm migration:revert
```

---

## Security Checklist

Before production:

- [ ] Change `JWT_SECRET_KEY` to random secret
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (reverse proxy + SSL cert)
- [ ] Configure `CORS_ORIGINS` to specific domains
- [ ] Backup database before migrations
- [ ] Disable Swagger docs (auto-disabled in production)
- [ ] Enable database backups
- [ ] Configure secrets manager (not .env files)
- [ ] Set up monitoring & alerting
- [ ] Test disaster recovery

---

## Troubleshooting

| Issue                        | Solution                                                            |
| ---------------------------- | ------------------------------------------------------------------- |
| Database connection refused  | `docker compose up postgres` or check connection string             |
| Port 3000 already in use     | Change `SERVICE_PORT` or `lsof -i :3000 && kill <pid>`              |
| JWT unauthorized on requests | Re-login to get fresh token or check `JWT_SECRET_KEY` matches       |
| Migrations pending           | Run `pnpm migration:run` manually if `DB_AUTO_RUN_MIGRATIONS=false` |
| Docker build fails           | Clear cache: `docker build --no-cache`                              |

---

## Next Steps

- **Architecture details:** See `system-architecture.md`
- **Code standards & patterns:** See `code-standards.md` and `design-guidelines.md`
- **Development:** See README.md for local setup scripts

For advanced topics (K8s manifests, backup strategies, scaling), see detailed sections in earlier versions or contact the team.
