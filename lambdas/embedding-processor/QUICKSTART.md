# Quick Start Guide

## Fix Terraform Errors

If you're seeing errors about missing files or SSM parameters, run this:

```bash
cd lambdas/embedding-processor

# Run automated setup
./setup.sh
```

This will create:
- ✅ SSM parameter with Supabase credentials
- ✅ `layers/dependencies/embedding-dependencies.zip`
- ✅ `layers/model/embedding-model.zip`

## Then Deploy

```bash
cd terraform
terraform init
terraform apply
```

## Configure S3 Bucket

After deployment, configure your S3 bucket to trigger the Lambda:

```bash
# Get SNS topic ARN
SNS_TOPIC_ARN=$(cd terraform && terraform output -raw sns_topic_arn)

# Configure S3 notification
aws s3api put-bucket-notification-configuration \
  --bucket YOUR_BUCKET_NAME \
  --notification-configuration '{
    "TopicConfigurations": [{
      "TopicArn": "'"$SNS_TOPIC_ARN"'",
      "Events": ["s3:ObjectCreated:*"]
    }]
  }'
```

## Test It

Upload a text file:

```bash
echo "This is a test document for embedding generation." > test.txt
aws s3 cp test.txt s3://YOUR_BUCKET_NAME/

# Check logs
aws logs tail /aws/lambda/proofmark-dev-embedding-processor --follow
```

## Troubleshooting

### Error: SSM parameter not found
```bash
# Create it manually
aws ssm put-parameter \
  --name "/proofmark/supabase/config" \
  --type "SecureString" \
  --value '{"url":"https://xxx.supabase.co","service_key":"eyJ..."}' \
  --region us-east-1
```

### Error: Layer zip files not found
```bash
cd layers/dependencies && ./build.sh
cd ../model && python3 download_model.py && ./build.sh
```

### Error: sentence-transformers not installed
```bash
pip3 install sentence-transformers
```

### Lambda out of memory
Increase memory in `terraform/variables.tf`:
```hcl
lambda_memory_size = 4096  # 4GB
```

### Lambda timeout
Increase timeout in `terraform/variables.tf`:
```hcl
lambda_timeout = 600  # 10 minutes
```

## Full Documentation

See [README.md](README.md) for detailed documentation.
