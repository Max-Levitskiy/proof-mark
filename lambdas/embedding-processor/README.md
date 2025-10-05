# Embedding Processor Lambda

AWS Lambda function that processes S3 file uploads, generates embeddings using SentenceTransformer, and stores them in Supabase.

## Architecture

```
S3 Upload → S3 Event → SNS Topic → Lambda Function → SSM Parameter → Supabase
```

**Flow:**
1. File uploaded to S3 bucket triggers S3 event
2. S3 event publishes notification to SNS topic (bucket name included in event)
3. Lambda function subscribed to SNS receives notification
4. Lambda loads Supabase credentials from SSM Parameter Store (cached for warm starts)
5. Lambda downloads file content from S3 (bucket name from SNS event)
6. Generates 768-dimensional embedding using `google/embeddinggemma-300m` model
7. Stores content + embedding in Supabase `content_embeddings` table

## Project Structure

```
embedding-processor/
├── lambda_function.py           # Main Lambda handler
├── requirements.txt             # Lambda function dependencies (lightweight)
├── layers/
│   ├── dependencies/            # Heavy ML dependencies layer
│   │   ├── requirements.txt     # torch, sentence-transformers, etc.
│   │   └── build.sh            # Build script for dependencies layer
│   └── model/                   # Pre-downloaded model layer
│       ├── download_model.py   # Script to download model
│       └── build.sh            # Build script for model layer
├── terraform/                   # Infrastructure as Code
│   ├── main.tf                 # AWS resources definition
│   ├── variables.tf            # Configuration variables
│   └── outputs.tf              # Terraform outputs
└── README.md                    # This file
```

## Prerequisites

- Python 3.11
- AWS CLI configured with appropriate credentials
- Terraform >= 1.0
- Supabase project with `content_embeddings` table
- **SSM Parameter created** with Supabase configuration (see Setup step 1)

### Supabase Table Schema

The `content_embeddings` table should have:
- `id` (text, primary key) - Auto-generated from content hash
- `content` (text) - The text content
- `key` (text) - Identifier/filename
- `embedding` (vector(768)) - Embedding vector
- `metadata` (jsonb) - Additional metadata
- `created_at` (timestamp)

## Quick Setup (Automated)

Use the provided setup script to automate all prerequisites:

```bash
cd lambdas/embedding-processor

# Option 1: Interactive (will prompt for Supabase credentials)
./setup.sh

# Option 2: Non-interactive (provide credentials as env vars)
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="eyJ..."
export AWS_REGION="us-east-1"
./setup.sh
```

The script will:
1. ✅ Create SSM parameter with Supabase config
2. ✅ Build dependencies layer (~500MB)
3. ✅ Download and package model layer (~300MB)
4. ✅ Verify everything is ready for Terraform

**Then skip to step 4 (Deploy Infrastructure).**

---

## Manual Setup (Step-by-Step)

### 1. Create SSM Parameter for Supabase Configuration

**This must be done BEFORE running Terraform.**

Create an encrypted SSM parameter containing your Supabase credentials:

```bash
aws ssm put-parameter \
  --name "/proofmark/supabase/config" \
  --type "SecureString" \
  --description "Supabase configuration for embedding processor Lambda" \
  --value '{
    "url": "https://your-project.supabase.co",
    "service_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**Important:**
- Use your **service role key** (not anon key) for bypassing RLS
- The parameter is encrypted at rest using AWS KMS
- To update later: add `--overwrite` flag

**Verify the parameter was created:**
```bash
aws ssm get-parameter --name "/proofmark/supabase/config" --with-decryption
```

### 2. Build Lambda Layers

#### Dependencies Layer

```bash
cd layers/dependencies
./build.sh
```

This creates `embedding-dependencies.zip` (~500MB) containing:
- sentence-transformers
- torch
- transformers
- numpy

#### Model Layer

```bash
cd layers/model

# Install sentence-transformers first if not already installed
pip install sentence-transformers

# Download model
python3 download_model.py

# Package model
./build.sh
```

This creates `embedding-model.zip` (~300MB) containing the pre-downloaded model.

**Note:** Lambda layers have a 250MB **unzipped** size limit. If the model layer exceeds this:
- Consider using a quantized model
- Or download the model from S3 at runtime
- Or use a smaller embedding model

### 3. Configure Terraform Variables

Create `terraform/terraform.tfvars`:

```hcl
aws_region    = "us-east-1"
project_name  = "proofmark"
environment   = "dev"

# SSM parameter name (must match the parameter created in step 1)
ssm_parameter_name = "/proofmark/supabase/config"

# Optional: customize Lambda settings
lambda_memory_size = 3008  # 3GB (recommended for ML)
lambda_timeout     = 300   # 5 minutes
```

**Note:** No Supabase credentials needed in Terraform! They're securely stored in SSM Parameter Store.

### 4. Deploy Infrastructure

```bash
cd terraform

# Initialize Terraform
terraform init

# Preview changes
terraform plan

# Deploy
terraform apply
```

### 5. Configure S3 Bucket Notifications

After deploying with Terraform, you need to configure S3 bucket(s) to send notifications to the SNS topic:

#### Option 1: Using AWS CLI

```bash
# Get SNS topic ARN from Terraform output
SNS_TOPIC_ARN=$(cd terraform && terraform output -raw sns_topic_arn)

# Configure S3 bucket notification
aws s3api put-bucket-notification-configuration \
  --bucket YOUR_BUCKET_NAME \
  --notification-configuration '{
    "TopicConfigurations": [{
      "TopicArn": "'"$SNS_TOPIC_ARN"'",
      "Events": ["s3:ObjectCreated:*"]
    }]
  }'
```

#### Option 2: Using AWS Console

1. Go to S3 → Your Bucket → Properties → Event Notifications
2. Create notification
3. Select Events: `s3:ObjectCreated:*`
4. Destination: SNS topic
5. Select the topic created by Terraform (e.g., `proofmark-dev-s3-file-upload-notifications`)

**Note:** The bucket name will be automatically extracted from the SNS event, so you can configure multiple S3 buckets to use the same Lambda function.

## Usage

### Trigger Processing

Simply upload a text file to your S3 bucket:

```bash
aws s3 cp document.txt s3://your-bucket-name/
```

The Lambda will automatically:
1. Download the file
2. Generate embedding
3. Store in Supabase

### Monitor Execution

```bash
# View Lambda logs
aws logs tail /aws/lambda/proofmark-dev-embedding-processor --follow

# Or use Terraform output
terraform output cloudwatch_log_group
```

### Test Locally

```bash
# Set environment variables
export SSM_PARAMETER_NAME="/proofmark/supabase/config"
export MODEL_PATH="./layers/model/build/model"
export AWS_REGION="us-east-1"

# Note: SSM parameter must exist with Supabase config
# Or for local testing without SSM, mock the config in lambda_function.py

# Run test (requires model downloaded locally)
python3 -c "
import json
from lambda_function import lambda_handler

event = {
    'Records': [{
        'Sns': {
            'Message': json.dumps({
                'Records': [{
                    's3': {
                        'bucket': {'name': 'your-bucket'},
                        'object': {'key': 'test.txt'}
                    }
                }]
            })
        }
    }]
}

result = lambda_handler(event, None)
print(json.dumps(result, indent=2))
"
```

## Configuration

### Environment Variables

Set in Terraform (`terraform/main.tf`):

- `SSM_PARAMETER_NAME` - SSM Parameter Store path containing Supabase config (default: `/proofmark/supabase/config`)
- `MODEL_PATH` - Path to model in layer (`/opt/model`)

### SSM Parameter Format

The SSM parameter should contain a JSON object with Supabase credentials:

```json
{
  "url": "https://your-project.supabase.co",
  "service_key": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

To update the SSM parameter (e.g., rotate credentials):

```bash
aws ssm put-parameter \
  --name "/proofmark/supabase/config" \
  --type "SecureString" \
  --value '{"url":"https://your-project.supabase.co","service_key":"your-new-key"}' \
  --overwrite
```

**Note:** Lambda will pick up the new credentials on the next cold start.

### Lambda Settings

Adjust in `terraform/variables.tf`:

- `lambda_memory_size` (default: 3008 MB / 3GB)
  - Higher memory = more CPU and faster processing
  - Minimum 1GB recommended for ML workloads
- `lambda_timeout` (default: 300 seconds / 5 minutes)
  - Adjust based on file size and model inference time

### Model Configuration

To use a different model, edit `layers/model/download_model.py`:

```python
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"  # Smaller model
```

**Important:** Ensure embedding dimension matches Supabase table:
- Current: `vector(768)` for embeddinggemma-300m
- Update migration if using different dimension

## Cost Optimization

### Lambda Pricing
- First 1M requests/month: Free
- After: $0.20 per 1M requests
- Compute: $0.0000166667 per GB-second

**Example:** 3GB Lambda running 5 seconds
- Cost per invocation: ~$0.00025
- 10,000 files/month: ~$2.50

### Layer Size Optimization

Reduce costs and cold start time:

```bash
# In layers/dependencies/build.sh, add:
find "$PACKAGE_DIR" -name "*.so" -exec strip {} \;  # Strip debug symbols
pip install --no-deps ...  # Skip unnecessary dependencies
```

### S3 Transfer Costs
- Data transfer from S3 to Lambda in same region: Free
- Store models in same region as Lambda

## Troubleshooting

### Lambda Out of Memory

Increase memory in `terraform/variables.tf`:

```hcl
lambda_memory_size = 4096  # 4GB
```

### Layer Size Limit Exceeded

Options:
1. Download model from S3 at runtime
2. Use smaller model (all-MiniLM-L6-v2 is ~80MB)
3. Quantize model weights

### Cold Start Timeouts

- First invocation downloads layers: ~30 seconds
- Subsequent warm starts: <1 second
- Use provisioned concurrency for consistent performance (additional cost)

### Supabase Connection Errors

Verify service role key has permissions:
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'content_embeddings';

-- Service role should bypass RLS, but verify grants:
GRANT ALL ON TABLE content_embeddings TO service_role;
```

## Development

### Running Tests

```bash
# Install dev dependencies
pip install pytest moto

# Run tests (TODO: add test suite)
pytest tests/
```

### Updating Dependencies

```bash
cd layers/dependencies
pip install --upgrade -r requirements.txt
./build.sh

# Redeploy layer
cd ../../terraform
terraform apply
```

### Debugging

Enable debug logging in `lambda_function.py`:

```python
logger.setLevel(logging.DEBUG)
```

## Security Best Practices

1. **Never commit secrets** - Use AWS Secrets Manager or Parameter Store
2. **Use least privilege IAM** - Lambda role only has S3 read access
3. **Enable VPC** - For production, run Lambda in VPC with Supabase
4. **Rotate keys** - Regularly rotate Supabase service key
5. **Monitor costs** - Set up AWS Budgets alerts

## Production Checklist

- [ ] Move secrets to AWS Secrets Manager
- [ ] Set up CloudWatch alarms for errors
- [ ] Configure VPC for Lambda
- [ ] Enable X-Ray tracing for debugging
- [ ] Set up Lambda reserved concurrency limits
- [ ] Configure dead letter queue (DLQ) for failed events
- [ ] Set up automated backups for Supabase
- [ ] Document model version and retraining process
- [ ] Set up CI/CD pipeline for deployments

## Additional Resources

- [AWS Lambda Layers](https://docs.aws.amazon.com/lambda/latest/dg/configuration-layers.html)
- [SentenceTransformers Documentation](https://www.sbert.net/)
- [Supabase Python Client](https://github.com/supabase-community/supabase-py)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

## License

See project root LICENSE file.
