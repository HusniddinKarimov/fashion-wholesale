#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# In-place container deploy — runs ON an EC2 instance via SSM (AWS-RunShellScript).
#
# Self-contained: derives region from instance metadata, the ECR URI from the
# currently-running container's image, and the target tag from SSM. Reuses the
# existing container's env (DATABASE_URL / secrets) so nothing sensitive is
# passed in. Health-checks itself so a bad rollout fails the SSM command.
# ─────────────────────────────────────────────────────────────────────────────
set -e

# Region from IMDSv2
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" \
  -H "X-aws-ec2-metadata-token-ttl-seconds: 120")
REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" \
  http://169.254.169.254/latest/meta-data/placement/region)

# Target image: ECR URI from the running container, tag from SSM.
TAG=$(aws ssm get-parameter --name /fashionwholesale/CURRENT_IMAGE_TAG \
  --query "Parameter.Value" --output text --region "$REGION")
CUR_IMAGE=$(docker inspect fashionwholesale --format '{{.Config.Image}}')
ECR_URI="${CUR_IMAGE%:*}"          # strip the existing tag (ECR URIs have no other colon)
IMAGE="$ECR_URI:$TAG"
echo "Deploying $IMAGE"

aws ecr get-login-password --region "$REGION" \
  | docker login --username AWS --password-stdin "$ECR_URI"
docker pull "$IMAGE"

# Preserve the current container's runtime env (DB URL, secrets, etc.).
docker inspect fashionwholesale --format '{{range .Config.Env}}{{println .}}{{end}}' \
  | grep -E '^(DATABASE_URL|NEXTAUTH_SECRET|NEXTAUTH_URL|NODE_ENV)=' > /tmp/app.env

docker stop fashionwholesale 2>/dev/null || true
docker rm   fashionwholesale 2>/dev/null || true
docker run -d --name fashionwholesale --restart unless-stopped -p 3000:3000 \
  --env-file /tmp/app.env "$IMAGE"

# Idempotent migrations, then wait for the app to report healthy.
sleep 5
docker exec fashionwholesale npx prisma migrate deploy || true
for i in $(seq 1 18); do
  if curl -fs http://localhost:3000/api/health >/dev/null 2>&1; then
    echo "healthy"
    exit 0
  fi
  sleep 5
done
echo "health check failed after restart"
exit 1
