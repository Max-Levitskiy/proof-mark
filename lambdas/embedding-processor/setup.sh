#!/bin/bash

# Setup script for embedding processor Lambda
# Run this before deploying with Terraform

set -e

echo "================================================"
echo "Embedding Processor Lambda - Setup Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SSM_PARAMETER_NAME="${SSM_PARAMETER_NAME:-/proofmark/supabase/config}"
SUPABASE_URL="${SUPABASE_URL}"
SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY}"
AWS_REGION="${AWS_REGION:-us-east-1}"

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
echo ""

if ! command -v aws &> /dev/null; then
    echo -e "${RED}✗ AWS CLI not found. Please install it first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ AWS CLI found${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${RED}✗ Python 3 not found. Please install Python 3.11+${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python 3 found${NC}"

if ! command -v pip &> /dev/null && ! command -v pip3 &> /dev/null; then
    echo -e "${RED}✗ pip not found. Please install pip${NC}"
    exit 1
fi
echo -e "${GREEN}✓ pip found${NC}"

echo ""

# Step 2: Create SSM parameter
echo "Step 2: Creating SSM parameter with Supabase configuration..."
echo ""

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo -e "${YELLOW}⚠ Supabase credentials not provided as environment variables${NC}"
    echo ""
    echo "Please provide your Supabase configuration:"
    read -p "Supabase URL (e.g., https://xxx.supabase.co): " SUPABASE_URL
    read -sp "Supabase Service Key: " SUPABASE_SERVICE_KEY
    echo ""
fi

echo "Creating SSM parameter: $SSM_PARAMETER_NAME"

aws ssm put-parameter \
    --region "$AWS_REGION" \
    --name "$SSM_PARAMETER_NAME" \
    --type "SecureString" \
    --description "Supabase configuration for embedding processor Lambda" \
    --value "{\"url\":\"$SUPABASE_URL\",\"service_key\":\"$SUPABASE_SERVICE_KEY\"}" \
    --overwrite \
    2>/dev/null || {
        echo -e "${YELLOW}⚠ Parameter might already exist, updating...${NC}"
        aws ssm put-parameter \
            --region "$AWS_REGION" \
            --name "$SSM_PARAMETER_NAME" \
            --type "SecureString" \
            --value "{\"url\":\"$SUPABASE_URL\",\"service_key\":\"$SUPABASE_SERVICE_KEY\"}" \
            --overwrite
    }

echo -e "${GREEN}✓ SSM parameter created/updated${NC}"
echo ""

# Step 3: Build dependencies layer
echo "Step 3: Building dependencies layer..."
echo ""

cd layers/dependencies

if [ ! -f "embedding-dependencies.zip" ]; then
    echo "Installing dependencies (this may take several minutes)..."
    ./build.sh
    echo -e "${GREEN}✓ Dependencies layer built${NC}"
else
    echo -e "${YELLOW}⚠ Dependencies layer already exists (embedding-dependencies.zip)${NC}"
    read -p "Rebuild? (y/N): " rebuild
    if [[ $rebuild =~ ^[Yy]$ ]]; then
        ./build.sh
        echo -e "${GREEN}✓ Dependencies layer rebuilt${NC}"
    else
        echo -e "${GREEN}✓ Using existing dependencies layer${NC}"
    fi
fi

cd ../..
echo ""

# Step 4: Download and build model layer
echo "Step 4: Building model layer..."
echo ""

cd layers/model

if [ ! -f "embedding-model.zip" ]; then
    echo "Checking if sentence-transformers is installed..."

    if ! python3 -c "import sentence_transformers" 2>/dev/null; then
        echo "Installing sentence-transformers..."
        pip3 install sentence-transformers
    fi

    echo "Downloading model (this may take several minutes)..."
    python3 download_model.py

    echo "Packaging model..."
    ./build.sh

    echo -e "${GREEN}✓ Model layer built${NC}"
else
    echo -e "${YELLOW}⚠ Model layer already exists (embedding-model.zip)${NC}"
    read -p "Rebuild? (y/N): " rebuild
    if [[ $rebuild =~ ^[Yy]$ ]]; then
        rm -rf build
        python3 download_model.py
        ./build.sh
        echo -e "${GREEN}✓ Model layer rebuilt${NC}"
    else
        echo -e "${GREEN}✓ Using existing model layer${NC}"
    fi
fi

cd ../..
echo ""

# Step 5: Verify everything is ready
echo "Step 5: Verifying setup..."
echo ""

READY=true

# Check SSM parameter
if aws ssm get-parameter --region "$AWS_REGION" --name "$SSM_PARAMETER_NAME" &>/dev/null; then
    echo -e "${GREEN}✓ SSM parameter exists${NC}"
else
    echo -e "${RED}✗ SSM parameter not found${NC}"
    READY=false
fi

# Check dependencies layer
if [ -f "layers/dependencies/embedding-dependencies.zip" ]; then
    SIZE=$(du -h layers/dependencies/embedding-dependencies.zip | cut -f1)
    echo -e "${GREEN}✓ Dependencies layer exists ($SIZE)${NC}"
else
    echo -e "${RED}✗ Dependencies layer not found${NC}"
    READY=false
fi

# Check model layer
if [ -f "layers/model/embedding-model.zip" ]; then
    SIZE=$(du -h layers/model/embedding-model.zip | cut -f1)
    echo -e "${GREEN}✓ Model layer exists ($SIZE)${NC}"
else
    echo -e "${RED}✗ Model layer not found${NC}"
    READY=false
fi

echo ""

if [ "$READY" = true ]; then
    echo -e "${GREEN}================================================${NC}"
    echo -e "${GREEN}✓ Setup complete! Ready to deploy with Terraform${NC}"
    echo -e "${GREEN}================================================${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. cd terraform"
    echo "  2. terraform init"
    echo "  3. terraform plan"
    echo "  4. terraform apply"
    echo ""
    echo "After deployment, configure S3 bucket notifications:"
    echo "  SNS_TOPIC_ARN=\$(cd terraform && terraform output -raw sns_topic_arn)"
    echo "  aws s3api put-bucket-notification-configuration \\"
    echo "    --bucket YOUR_BUCKET_NAME \\"
    echo "    --notification-configuration '{"
    echo "      \"TopicConfigurations\": [{"
    echo "        \"TopicArn\": \"'\$SNS_TOPIC_ARN'\","
    echo "        \"Events\": [\"s3:ObjectCreated:*\"]"
    echo "      }]"
    echo "    }'"
else
    echo -e "${RED}================================================${NC}"
    echo -e "${RED}✗ Setup incomplete. Please fix the errors above.${NC}"
    echo -e "${RED}================================================${NC}"
    exit 1
fi
