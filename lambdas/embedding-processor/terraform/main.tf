terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = var.tags
  }
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Note: S3 bucket is provided in SNS event, no data source needed

# ===========================
# SNS Topic for S3 Events
# ===========================

resource "aws_sns_topic" "s3_notifications" {
  name = "${var.project_name}-${var.environment}-${var.sns_topic_name}"

  tags = {
    Name = "${var.project_name}-${var.environment}-s3-notifications"
  }
}

resource "aws_sns_topic_policy" "s3_notifications" {
  arn = aws_sns_topic.s3_notifications.arn

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "s3.amazonaws.com"
        }
        Action   = "SNS:Publish"
        Resource = aws_sns_topic.s3_notifications.arn
      }
    ]
  })
}

# ===========================
# Lambda Layers
# ===========================

resource "aws_lambda_layer_version" "dependencies" {
  filename            = var.dependencies_layer_path
  layer_name          = "${var.project_name}-${var.environment}-embedding-dependencies"
  compatible_runtimes = ["python3.11"]
  source_code_hash    = filebase64sha256(var.dependencies_layer_path)

  description = "Python dependencies for embedding generation (torch, sentence-transformers)"
}

resource "aws_lambda_layer_version" "model" {
  filename            = var.model_layer_path
  layer_name          = "${var.project_name}-${var.environment}-embedding-model"
  compatible_runtimes = ["python3.11"]
  source_code_hash    = filebase64sha256(var.model_layer_path)

  description = "Pre-downloaded embeddinggemma-300m model"
}

# ===========================
# Lambda Function Code Package
# ===========================

data "archive_file" "lambda_code" {
  type        = "zip"
  source_dir  = var.lambda_code_path
  output_path = "${path.module}/lambda_function.zip"

  excludes = [
    "terraform",
    "layers",
    ".git",
    "*.md",
    "__pycache__",
    "*.pyc",
    ".DS_Store"
  ]
}

# ===========================
# SSM Parameter Data Source
# ===========================

# Reference existing SSM parameter containing Supabase configuration
# This parameter must be created manually before running Terraform
data "aws_ssm_parameter" "supabase_config" {
  name = var.ssm_parameter_name
}

# ===========================
# IAM Role for Lambda
# ===========================

resource "aws_iam_role" "lambda_execution" {
  name = "${var.project_name}-${var.environment}-embedding-processor-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_s3_access" {
  name = "s3-read-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:GetObjectVersion"
        ]
        Resource = "*"  # Allow access to any S3 bucket (bucket name comes from SNS event)
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_ssm_access" {
  name = "ssm-parameter-access"
  role = aws_iam_role.lambda_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "ssm:GetParameter",
          "ssm:GetParameters"
        ]
        Resource = data.aws_ssm_parameter.supabase_config.arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# ===========================
# Lambda Function
# ===========================

resource "aws_lambda_function" "embedding_processor" {
  filename         = data.archive_file.lambda_code.output_path
  function_name    = "${var.project_name}-${var.environment}-embedding-processor"
  role             = aws_iam_role.lambda_execution.arn
  handler          = "lambda_function.lambda_handler"
  source_code_hash = data.archive_file.lambda_code.output_base64sha256
  runtime          = "python3.11"
  timeout          = var.lambda_timeout
  memory_size      = var.lambda_memory_size

  layers = [
    aws_lambda_layer_version.dependencies.arn,
    aws_lambda_layer_version.model.arn
  ]

  environment {
    variables = {
      SSM_PARAMETER_NAME = var.ssm_parameter_name
      MODEL_PATH         = "/opt/model"
    }
  }

  tags = {
    Name = "${var.project_name}-${var.environment}-embedding-processor"
  }
}

# ===========================
# CloudWatch Log Group
# ===========================

resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/${aws_lambda_function.embedding_processor.function_name}"
  retention_in_days = 7

  tags = {
    Name = "${var.project_name}-${var.environment}-embedding-processor-logs"
  }
}

# ===========================
# SNS Subscription
# ===========================

resource "aws_sns_topic_subscription" "lambda_subscription" {
  topic_arn = aws_sns_topic.s3_notifications.arn
  protocol  = "lambda"
  endpoint  = aws_lambda_function.embedding_processor.arn
}

resource "aws_lambda_permission" "allow_sns" {
  statement_id  = "AllowExecutionFromSNS"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.embedding_processor.function_name
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.s3_notifications.arn
}

# ===========================
# S3 Bucket Notification (Optional)
# ===========================

# Note: S3 bucket notifications must be configured separately for each bucket
# that should trigger the Lambda. The bucket name is provided in the SNS event.
# To set up notifications, use AWS CLI or Console:
#
# aws s3api put-bucket-notification-configuration \
#   --bucket YOUR_BUCKET_NAME \
#   --notification-configuration file://notification.json
#
# Where notification.json contains:
# {
#   "TopicConfigurations": [{
#     "TopicArn": "<SNS_TOPIC_ARN>",
#     "Events": ["s3:ObjectCreated:*"]
#   }]
# }
