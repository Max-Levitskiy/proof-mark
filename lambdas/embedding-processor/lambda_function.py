"""
AWS Lambda function to process S3 file events, generate embeddings, and store in Supabase.

Triggered by SNS notifications from S3 create events.
Uses SentenceTransformer (embeddinggemma-300m) for embedding generation.
Stores results in Supabase content_embeddings table.
"""

import json
import os
import logging
from typing import Dict, Any, List, Optional
from urllib.parse import unquote_plus

import boto3
from sentence_transformers import SentenceTransformer
from supabase import create_client, Client

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
SSM_PARAMETER_NAME = os.environ.get('SSM_PARAMETER_NAME', '/proofmark/supabase/config')
MODEL_PATH = os.environ.get('MODEL_PATH', '/opt/model')

# Initialize clients (reused across warm starts)
s3_client = boto3.client('s3')
ssm_client = boto3.client('ssm')
supabase_client: Client = None
supabase_config: Optional[Dict[str, str]] = None
embedding_model: SentenceTransformer = None


def get_supabase_config() -> Dict[str, str]:
    """
    Load Supabase configuration from SSM Parameter Store.

    Expected SSM parameter value (JSON):
    {
        "url": "https://your-project.supabase.co",
        "service_key": "your-service-role-key"
    }

    Returns:
        Dict with 'url' and 'service_key'
    """
    global supabase_config

    if supabase_config is None:
        logger.info(f"Loading Supabase config from SSM parameter: {SSM_PARAMETER_NAME}")

        try:
            response = ssm_client.get_parameter(
                Name=SSM_PARAMETER_NAME,
                WithDecryption=True
            )

            config_json = response['Parameter']['Value']
            supabase_config = json.loads(config_json)

            # Validate required keys
            if 'url' not in supabase_config or 'service_key' not in supabase_config:
                raise ValueError("SSM parameter must contain 'url' and 'service_key'")

            logger.info("Supabase config loaded successfully from SSM")

        except Exception as e:
            logger.error(f"Failed to load Supabase config from SSM: {str(e)}")
            raise

    return supabase_config


def get_supabase_client() -> Client:
    """Get or create Supabase client (singleton pattern)."""
    global supabase_client

    if supabase_client is None:
        config = get_supabase_config()
        supabase_client = create_client(config['url'], config['service_key'])
        logger.info("Supabase client initialized")

    return supabase_client


def get_embedding_model() -> SentenceTransformer:
    """Load embedding model (singleton pattern for warm starts)."""
    global embedding_model
    if embedding_model is None:
        logger.info(f"Loading embedding model from {MODEL_PATH}")
        embedding_model = SentenceTransformer(MODEL_PATH)
        logger.info("Embedding model loaded successfully")
    return embedding_model


def extract_s3_info_from_sns(event: Dict[str, Any]) -> List[Dict[str, str]]:
    """
    Extract S3 bucket and key information from SNS notification.

    Args:
        event: Lambda event from SNS

    Returns:
        List of dicts with 'bucket' and 'key' for each S3 object
    """
    s3_objects = []

    for record in event.get('Records', []):
        # Parse SNS message
        if 'Sns' in record:
            sns_message = json.loads(record['Sns']['Message'])

            # Extract S3 event records
            for s3_record in sns_message.get('Records', []):
                if 's3' in s3_record:
                    bucket = s3_record['s3']['bucket']['name']
                    key = unquote_plus(s3_record['s3']['object']['key'])
                    s3_objects.append({'bucket': bucket, 'key': key})
                    logger.info(f"Extracted S3 object: s3://{bucket}/{key}")

    return s3_objects


def download_s3_content(bucket: str, key: str) -> str:
    """
    Download text content from S3.

    Args:
        bucket: S3 bucket name
        key: S3 object key

    Returns:
        Text content from S3 object
    """
    logger.info(f"Downloading s3://{bucket}/{key}")
    response = s3_client.get_object(Bucket=bucket, Key=key)
    content = response['Body'].read().decode('utf-8')
    logger.info(f"Downloaded {len(content)} characters")
    return content


def generate_embedding(text: str, model: SentenceTransformer) -> List[float]:
    """
    Generate embedding vector from text.

    Args:
        text: Input text
        model: SentenceTransformer model

    Returns:
        Embedding vector as list of floats
    """
    logger.info(f"Generating embedding for text ({len(text)} chars)")
    embedding = model.encode(text, convert_to_numpy=True)
    embedding_list = embedding.tolist()
    logger.info(f"Generated embedding with dimension {len(embedding_list)}")
    return embedding_list


def store_embedding_in_supabase(
    content: str,
    key: str,
    embedding: List[float],
    metadata: Dict[str, Any] = None
) -> Dict[str, Any]:
    """
    Store content and embedding in Supabase content_embeddings table.

    Args:
        content: Text content
        key: Identifier/key for the content
        embedding: Embedding vector
        metadata: Optional metadata as JSON

    Returns:
        Response from Supabase insert
    """
    supabase = get_supabase_client()

    # Prepare record
    record = {
        'content': content,
        'key': key,
        'embedding': embedding,
        'metadata': metadata or {}
    }
    # Note: 'id' will be auto-generated by trg_set_id_from_content trigger

    logger.info(f"Inserting record for key: {key}")

    # Insert into content_embeddings table
    # Using upsert to handle duplicates (based on content hash)
    result = supabase.table('content_embeddings').upsert(
        record,
        on_conflict='id'  # id is generated from content hash
    ).execute()

    logger.info(f"Successfully stored embedding for key: {key}")
    return result.data


def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    AWS Lambda handler function.

    Triggered by SNS topic subscribed to S3 create events.

    Args:
        event: Lambda event (SNS notification)
        context: Lambda context

    Returns:
        Response with status and processed objects count
    """
    logger.info(f"Received event: {json.dumps(event)}")

    try:
        # Extract S3 information from SNS
        s3_objects = extract_s3_info_from_sns(event)

        if not s3_objects:
            logger.warning("No S3 objects found in event")
            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'No S3 objects to process'})
            }

        # Load model (once per container)
        model = get_embedding_model()

        processed_count = 0
        errors = []

        # Process each S3 object
        for s3_obj in s3_objects:
            try:
                bucket = s3_obj['bucket']
                key = s3_obj['key']

                # Download content
                content = download_s3_content(bucket, key)

                # Generate embedding
                embedding = generate_embedding(content, model)

                # Prepare metadata
                metadata = {
                    's3_bucket': bucket,
                    's3_key': key,
                    'processed_by': 'embedding-processor-lambda'
                }

                # Store in Supabase
                store_embedding_in_supabase(content, key, embedding, metadata)

                processed_count += 1
                logger.info(f"Successfully processed {key}")

            except Exception as e:
                error_msg = f"Error processing {s3_obj.get('key', 'unknown')}: {str(e)}"
                logger.error(error_msg, exc_info=True)
                errors.append(error_msg)

        # Return response
        response = {
            'statusCode': 200 if not errors else 207,  # 207 Multi-Status if partial success
            'body': json.dumps({
                'message': f'Processed {processed_count}/{len(s3_objects)} objects',
                'processed': processed_count,
                'total': len(s3_objects),
                'errors': errors
            })
        }

        logger.info(f"Lambda execution completed: {response['body']}")
        return response

    except Exception as e:
        logger.error(f"Lambda execution failed: {str(e)}", exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({
                'error': str(e),
                'message': 'Lambda execution failed'
            })
        }
