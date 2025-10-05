variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name for resource naming"
  type        = string
  default     = "proofmark"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "lambda_memory_size" {
  description = "Lambda function memory in MB"
  type        = number
  default     = 3008  # 3GB for ML processing
}

variable "lambda_timeout" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 300  # 5 minutes
}

variable "ssm_parameter_name" {
  description = "SSM Parameter Store name for Supabase configuration (must be created manually before deployment)"
  type        = string
  default     = "/proofmark/supabase/config"
}

variable "dependencies_layer_path" {
  description = "Path to dependencies layer zip file"
  type        = string
  default     = "../layers/dependencies/embedding-dependencies.zip"
}

variable "model_layer_path" {
  description = "Path to model layer zip file"
  type        = string
  default     = "../layers/model/embedding-model.zip"
}

variable "lambda_code_path" {
  description = "Path to Lambda function code directory"
  type        = string
  default     = "../"
}

variable "sns_topic_name" {
  description = "SNS topic name for S3 notifications"
  type        = string
  default     = "s3-file-upload-notifications"
}

variable "s3_bucket_names" {
  description = "List of S3 bucket names to configure notifications for (optional - can be configured manually)"
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    Project   = "ProofMark"
    ManagedBy = "Terraform"
  }
}
