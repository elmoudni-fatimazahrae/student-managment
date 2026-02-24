# Docker Deployment Guide

This guide explains how to deploy the Student Management System using Docker.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+

## Local Development with Docker

### 1. Build and Run with Docker Compose

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### 2. Login Credentials

- Email: `admin@example.com`
- Password: `password123`

### 3. View Logs

```bash
docker-compose logs -f app
```

### 4. Stop Containers

```bash
docker-compose stop
```

### 5. Remove Containers and Volumes

```bash
docker-compose down -v
```

## Production Deployment

### 1. Build Docker Image

```bash
docker build -t student-management:latest .
```

### 2. Run Container

```bash
docker run -p 3000:3000 \
  -e NEXTAUTH_URL=https://your-domain.com \
  -e NEXTAUTH_SECRET=your-secret-key \
  -e DATABASE_URL=postgresql://user:password@host:5432/db \
  -v ./data:/app/data \
  student-management:latest
```

### 3. Push to Container Registry

#### Docker Hub
```bash
docker tag student-management:latest username/student-management:latest
docker push username/student-management:latest
```

#### GitHub Container Registry
```bash
docker tag student-management:latest ghcr.io/username/student-management:latest
docker push ghcr.io/username/student-management:latest
```

## Environment Variables

Create a `.env` file for Docker:

```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<secure-random-key>
DATABASE_URL=postgresql://user:password@postgres:5432/student_management
```

## Using PostgreSQL with Docker Compose

To use PostgreSQL instead of SQLite:

1. Update Prisma schema in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Uncomment the PostgreSQL service in `docker-compose.yml`

3. Update `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/student_management
```

4. Run with compose:
```bash
docker-compose up --build
```

5. Initialize database:
```bash
docker-compose exec app npm run db:init
```

## Kubernetes Deployment

For Kubernetes, create a simple manifest file (k8s-deployment.yaml):

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: student-management
spec:
  replicas: 2
  selector:
    matchLabels:
      app: student-management
  template:
    metadata:
      labels:
        app: student-management
    spec:
      containers:
      - name: app
        image: ghcr.io/username/student-management:latest
        ports:
        - containerPort: 3000
        env:
        - name: NEXTAUTH_URL
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: nextauth_url
        - name: NEXTAUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: nextauth_secret
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database_url
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: student-management-service
spec:
  type: LoadBalancer
  ports:
  - port: 80
    targetPort: 3000
  selector:
    app: student-management
```

Deploy with:
```bash
kubectl apply -f k8s-deployment.yaml
```

## Docker Compose Advanced Configuration

For production with PostgreSQL and volumes:

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}
    volumes:
      - app-logs:/app/logs
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  app-logs:
```

## Security Best Practices

1. **Use secrets** for sensitive environment variables
2. **Don't include** `.env` files in Docker images
3. **Run as non-root** user (already configured)
4. **Use health checks** to restart unhealthy containers
5. **Implement** proper logging and monitoring
6. **Use** multi-stage builds to reduce image size
7. **Scan images** for vulnerabilities: `docker scan student-management:latest`

## Troubleshooting

### Container won't start
```bash
docker-compose logs app
```

### Port already in use
```bash
docker-compose up -p 8080:3000 --build
```

### Database connection errors
- Ensure PostgreSQL is running: `docker-compose ps`
- Check DATABASE_URL format
- Verify network: `docker network inspect student-management_default`

### Permission denied errors
- Build with correct context
- Check file permissions in volumes

## Performance Optimization

1. **Use production Node image**: `node:20-alpine`
2. **Minimize layers** in Dockerfile
3. **Use .dockerignore** to exclude unnecessary files
4. **Enable BuildKit**: `DOCKER_BUILDKIT=1 docker build .`
5. **Cache dependencies** in separate layer

## Monitoring and Logging

### View logs
```bash
docker-compose logs -f app
```

### Export logs
```bash
docker logs student-management > app.log
```

### Docker stats
```bash
docker stats student-management
```

## Cleanup

```bash
# Stop all containers
docker-compose down

# Remove unused volumes
docker volume prune

# Remove unused images
docker image prune

# Full cleanup
docker system prune -a --volumes
```

## Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/compose-file/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment/docker)
- [Node.js Docker Best Practices](https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md)
