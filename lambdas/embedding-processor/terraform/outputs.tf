output "lambda_function_arn" {
  description = "ARN of the embedding processor Lambda function"
  value       = aws_lambda_function.embedding_processor.arn
}

output "lambda_function_name" {
  description = "Name of the embedding processor Lambda function"
  value       = aws_lambda_function.embedding_processor.function_name
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for S3 notifications"
  value       = aws_sns_topic.s3_notifications.arn
}

output "sns_topic_name" {
  description = "Name of the SNS topic"
  value       = aws_sns_topic.s3_notifications.name
}

output "dependencies_layer_arn" {
  description = "ARN of the dependencies Lambda layer"
  value       = aws_lambda_layer_version.dependencies.arn
}

output "dependencies_layer_version" {
  description = "Version of the dependencies Lambda layer"
  value       = aws_lambda_layer_version.dependencies.version
}

output "model_layer_arn" {
  description = "ARN of the model Lambda layer"
  value       = aws_lambda_layer_version.model.arn
}

output "model_layer_version" {
  description = "Version of the model Lambda layer"
  value       = aws_lambda_layer_version.model.version
}

output "cloudwatch_log_group" {
  description = "CloudWatch log group for Lambda function"
  value       = aws_cloudwatch_log_group.lambda_logs.name
}

output "iam_role_arn" {
  description = "ARN of the Lambda execution IAM role"
  value       = aws_iam_role.lambda_execution.arn
}

output "ssm_parameter_name" {
  description = "SSM Parameter Store name containing Supabase configuration"
  value       = data.aws_ssm_parameter.supabase_config.name
}

output "ssm_parameter_arn" {
  description = "ARN of the SSM parameter containing Supabase configuration"
  value       = data.aws_ssm_parameter.supabase_config.arn
}
