#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# FashionWholesale Corp — AWS One-Time Setup Script
#
# Run this ONCE to:
#   1. Create the GitHub OIDC Identity Provider in your AWS account
#   2. Deploy the CloudFormation stack (VPC, ALB, ASG, RDS, ECR, IAM)
#   3. Print all values you need for GitHub Secrets
#
# Prerequisites:
#   - AWS CLI configured (aws configure) with admin permissions
#   - Your GitHub username/org and repo name
#   - jq installed (brew install jq)
#
# Usage:
#   chmod +x infrastructure/setup.sh
#   ./infrastructure/setup.sh
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── EDIT THESE ───────────────────────────────────────────────────────────────
GITHUB_ORG="HusniddinKarimov"               # GitHub username or org that owns the repo
GITHUB_REPO="fashion-wholesale"             # GitHub repo name
AWS_REGION="${AWS_DEFAULT_REGION:-us-east-1}"
STACK_NAME="fashionwholesale-prod"
ENV_NAME="fashionwholesale"
DB_PASSWORD=""        # Will prompt if empty
NEXTAUTH_SECRET=""    # Will generate if empty
KEY_PAIR=""           # Optional: EC2 key pair name for SSH
# ─────────────────────────────────────────────────────────────────────────────

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}[✓]${NC} $*"; }
warn() { echo -e "${YELLOW}[!]${NC} $*"; }
err()  { echo -e "${RED}[✗]${NC} $*"; exit 1; }

command -v aws  >/dev/null || err "AWS CLI not found. Run: brew install awscli"
command -v jq   >/dev/null || err "jq not found. Run: brew install jq"

AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
log "AWS Account: ${AWS_ACCOUNT_ID} | Region: ${AWS_REGION}"

# ── Generate secrets if not set ───────────────────────────────────────────────
if [ -z "$NEXTAUTH_SECRET" ]; then
  NEXTAUTH_SECRET=$(openssl rand -base64 32)
  log "Generated NEXTAUTH_SECRET"
fi

if [ -z "$DB_PASSWORD" ]; then
  read -s -p "Enter RDS master password (min 12 chars): " DB_PASSWORD
  echo ""
  [ ${#DB_PASSWORD} -ge 12 ] || err "Password must be at least 12 characters"
fi

# ── Step 1: Register GitHub OIDC Provider (skip if already exists) ────────────
log "Checking GitHub OIDC provider..."
OIDC_ARN="arn:aws:iam::${AWS_ACCOUNT_ID}:oidc-provider/token.actions.githubusercontent.com"

if ! aws iam get-open-id-connect-provider --open-id-connect-provider-arn "$OIDC_ARN" 2>/dev/null; then
  log "Creating GitHub OIDC provider..."
  aws iam create-open-id-connect-provider \
    --url "https://token.actions.githubusercontent.com" \
    --client-id-list "sts.amazonaws.com" \
    --thumbprint-list "6938fd4d98bab03faadb97b34396831e3780aea1"
  log "OIDC provider created"
else
  log "OIDC provider already exists"
fi

# ── Step 2: Update the trust policy to scope to your specific repo ─────────────
warn "Note: The CloudFormation role trusts repo:${GITHUB_ORG}/${GITHUB_REPO}"
warn "Make sure GITHUB_ORG and GITHUB_REPO match your actual repository!"

# ── Step 3: Store secrets in SSM (SecureString) ───────────────────────────────
# NOTE: CloudFormation's AWS::SSM::Parameter cannot create SecureString params,
# so we create them here via the CLI. EC2 instances read them at boot using the
# instance-role permissions granted in the template.
log "Storing secrets in SSM Parameter Store (SecureString)..."
aws ssm put-parameter --name "/${ENV_NAME}/DB_PASSWORD" \
  --value "$DB_PASSWORD" --type SecureString --overwrite --region "$AWS_REGION" >/dev/null
aws ssm put-parameter --name "/${ENV_NAME}/NEXTAUTH_SECRET" \
  --value "$NEXTAUTH_SECRET" --type SecureString --overwrite --region "$AWS_REGION" >/dev/null
log "Secrets stored"

# ── Step 4: Deploy CloudFormation stack ───────────────────────────────────────
log "Deploying CloudFormation stack: ${STACK_NAME}"
log "This takes ~15 minutes (RDS provisioning)..."

aws cloudformation deploy \
  --template-file infrastructure/cloudformation.yml \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    EnvironmentName="$ENV_NAME" \
    DBPassword="$DB_PASSWORD" \
    GitHubOrg="$GITHUB_ORG" \
    GitHubRepo="$GITHUB_REPO" \
    KeyPairName="$KEY_PAIR" \
  --tags \
    Project=FashionWholesale \
    Environment=production

log "CloudFormation stack deployed!"

# ── Step 5: Retrieve outputs ──────────────────────────────────────────────────
log "Fetching stack outputs..."

get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$AWS_REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

ALB_DNS=$(get_output "LoadBalancerDNS")
ECR_URI=$(get_output "ECRRepositoryURI")
RDS_ENDPOINT=$(get_output "RDSEndpoint")
ASG_NAME=$(get_output "AutoScalingGroupName")
GH_ROLE_ARN=$(get_output "GitHubActionsRoleArn")

# ── Step 6: Store image tag placeholder in SSM ────────────────────────────────
aws ssm put-parameter \
  --name "/${ENV_NAME}/CURRENT_IMAGE_TAG" \
  --value "latest" \
  --type String \
  --overwrite \
  --region "$AWS_REGION" || true

# ── Step 7: Print GitHub Secrets ──────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "  Add these as GitHub Repository Secrets"
echo "  (Settings → Secrets and variables → Actions → New repository secret)"
echo "════════════════════════════════════════════════════════════════════"
echo ""
printf "%-30s %s\n" "Secret Name"          "Value"
printf "%-30s %s\n" "──────────────────────" "──────────────────────────────────────────────"
printf "%-30s %s\n" "AWS_ROLE_ARN"          "$GH_ROLE_ARN"
printf "%-30s %s\n" "AWS_REGION"            "$AWS_REGION"
printf "%-30s %s\n" "ECR_REPOSITORY_URI"    "$ECR_URI"
printf "%-30s %s\n" "ASG_NAME"              "$ASG_NAME"
printf "%-30s %s\n" "STACK_NAME"            "$STACK_NAME"
echo ""
echo "  App URL (set as NEXTAUTH_URL after adding HTTPS):  $ALB_DNS"
echo "  RDS Endpoint: $RDS_ENDPOINT"
echo ""
echo "════════════════════════════════════════════════════════════════════"
log "Setup complete! Next: add GitHub Secrets, then push to main to trigger deploy."
