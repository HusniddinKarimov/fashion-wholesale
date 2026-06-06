# AWS Deployment Guide — FashionWholesale Corp

## Architecture

```
GitHub (push to main)
  │
  ▼ GitHub Actions CI/CD (OIDC auth — no stored keys)
  │  lint → build → docker build → push to ECR
  │  → update Launch Template → trigger Instance Refresh
  │
  ▼
Internet
  │
  ▼
┌──────────────────────────────────────────────┐
│  Application Load Balancer (public, HTTPS)   │
│  Health check: /api/health every 30s         │
└────────────┬───────────────────┬─────────────┘
             │                   │
    ┌────────▼────────┐ ┌────────▼────────┐
    │ EC2 (AZ-1)      │ │ EC2 (AZ-2)      │  ← Auto Scaling Group
    │ t3.small        │ │ t3.small        │    min:2  max:6
    │ Docker → app    │ │ Docker → app    │    scale on CPU > 60%
    └────────┬────────┘ └────────┬────────┘
             │   Private VPC     │
             └─────────┬─────────┘
                       │
             ┌─────────▼─────────┐
             │  RDS PostgreSQL   │  ← Multi-AZ ready, encrypted,
             │  (private subnet) │    7-day automated backups
             └───────────────────┘
```

---

## Step 1 — Push to GitHub

```bash
# In the project root
cd "/Users/khusniddindev/Desktop/Claude workshop/fashion-wholesale"

# Stage all files
git add .
git commit -m "feat: FashionWholesale Corp — full-stack B2B portal"

# Create repo on GitHub (go to https://github.com/new)
# Name: fashion-wholesale
# Visibility: Private (recommended)
# Do NOT initialise with README

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/fashion-wholesale.git
git branch -M main
git push -u origin main
```

---

## Step 2 — AWS Prerequisites

```bash
# Install AWS CLI (if not already installed)
brew install awscli

# Configure with your AWS credentials
aws configure
# AWS Access Key ID: <from IAM > Security credentials>
# AWS Secret Access Key: <same>
# Default region name: us-east-1
# Default output format: json

# Verify access
aws sts get-caller-identity
```

---

## Step 3 — Deploy AWS Infrastructure

Edit `infrastructure/setup.sh` and set:
```bash
GITHUB_ORG="your-github-username"
GITHUB_REPO="fashion-wholesale"
AWS_REGION="us-east-1"
```

Then run:
```bash
chmod +x infrastructure/setup.sh
./infrastructure/setup.sh
```

This takes **~15 minutes** (RDS provisioning is the slow step).

At the end it prints a table like:
```
Secret Name                    Value
──────────────────────         ──────────────────────────────────
AWS_ROLE_ARN                   arn:aws:iam::123456789:role/fashionwholesale-github-actions
AWS_REGION                     us-east-1
ECR_REPOSITORY_URI             123456789.dkr.ecr.us-east-1.amazonaws.com/fashionwholesale/app
ASG_NAME                       fashionwholesale-asg
```

---

## Step 4 — Add GitHub Secrets

Go to your GitHub repo:
**Settings → Secrets and variables → Actions → New repository secret**

Add all four secrets from the table above.

Also add a **GitHub Environment** called `production`:
**Settings → Environments → New environment → "production"**
(This gates the deploy job and lets you add approval rules later.)

---

## Step 5 — Trigger First Deploy

```bash
git push origin main
```

Watch the pipeline at:
`https://github.com/YOUR_USERNAME/fashion-wholesale/actions`

The deploy job starts a rolling **Instance Refresh** — new EC2 instances are launched with the fresh Docker image, health-checked by the ALB, and old instances are terminated only after the new ones pass.

---

## Step 6 — Get Your App URL

```bash
aws cloudformation describe-stacks \
  --stack-name fashionwholesale-prod \
  --query "Stacks[0].Outputs[?OutputKey=='LoadBalancerDNS'].OutputValue" \
  --output text
```

Open the printed URL in your browser.

---

## Adding HTTPS (optional but recommended)

1. Register a domain in **Route 53** (or use an existing one)
2. Request a certificate in **ACM** (AWS Certificate Manager) for your domain
3. Add an HTTPS listener to the ALB:
   ```bash
   aws elbv2 create-listener \
     --load-balancer-arn <ALB_ARN> \
     --protocol HTTPS \
     --port 443 \
     --certificates CertificateArn=<ACM_CERT_ARN> \
     --default-actions Type=forward,TargetGroupArn=<TG_ARN>
   ```
4. Update SSM parameter with HTTPS URL:
   ```bash
   # EC2 instances read NEXTAUTH_URL from the ALB DNS at boot.
   # To override, add a SSM parameter:
   aws ssm put-parameter \
     --name "/fashionwholesale/NEXTAUTH_URL" \
     --value "https://yourdomain.com" \
     --type String --overwrite
   ```

---

## Seed the Production Database

Run this **once** after the first successful deploy:

```bash
# Get RDS endpoint
RDS=$(aws cloudformation describe-stacks \
  --stack-name fashionwholesale-prod \
  --query "Stacks[0].Outputs[?OutputKey=='RDSEndpoint'].OutputValue" \
  --output text)

# Get the running container ID on one of the EC2 instances via SSM
INSTANCE_ID=$(aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names fashionwholesale-asg \
  --query "AutoScalingGroups[0].Instances[0].InstanceId" \
  --output text)

aws ssm start-session --target "$INSTANCE_ID"
# Then inside the session:
# docker exec fashionwholesale npx ts-node prisma/seed.ts
```

---

## Useful Commands

```bash
# View ASG instance list
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names fashionwholesale-asg \
  --query "AutoScalingGroups[0].Instances[*].[InstanceId,HealthStatus,LifecycleState]" \
  --output table

# View ALB target health
aws elbv2 describe-target-health \
  --target-group-arn $(aws cloudformation describe-stacks \
    --stack-name fashionwholesale-prod \
    --query "Stacks[0].Outputs[?OutputKey=='ALBTargetGroup'].OutputValue" \
    --output text)

# Manually trigger a rolling deploy (re-runs latest image)
aws autoscaling start-instance-refresh \
  --auto-scaling-group-name fashionwholesale-asg \
  --strategy Rolling \
  --preferences '{"MinHealthyPercentage":50,"InstanceWarmup":120}'

# Tear down everything (saves cost when not needed)
aws cloudformation delete-stack --stack-name fashionwholesale-prod
```

---

## Cost Estimate (us-east-1, on-demand)

| Resource           | Type         | Monthly ~cost |
|--------------------|--------------|---------------|
| EC2 × 2            | t3.small     | ~$30          |
| ALB                | —            | ~$20          |
| RDS                | db.t3.micro  | ~$15          |
| NAT Gateway        | —            | ~$35          |
| ECR storage        | ~1 GB        | ~$0.10        |
| **Total**          |              | **~$100/mo**  |

To reduce cost: use `t3.micro` for EC2 and RDS, or switch ASG min to 1 during off-hours.
