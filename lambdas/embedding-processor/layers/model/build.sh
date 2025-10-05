#!/bin/bash

# Build script for Lambda model layer
# Packages the pre-downloaded model as a Lambda layer

set -e

echo "Building Lambda model layer..."

# Configuration
LAYER_NAME="embedding-model"
BUILD_DIR="build"

# Check if model exists
if [ ! -d "$BUILD_DIR/model" ]; then
    echo "Error: Model not found in $BUILD_DIR/model"
    echo "Please run download_model.py first to download the model"
    exit 1
fi

echo "Packaging model..."

# Create deployment package
cd "$BUILD_DIR"
zip -r "../${LAYER_NAME}.zip" model -q

cd ..
echo "Model layer built successfully: ${LAYER_NAME}.zip"
echo "Layer size: $(du -h ${LAYER_NAME}.zip | cut -f1)"

echo "Build complete!"
echo ""
echo "Note: Lambda layers have a 250MB unzipped size limit."
echo "If the layer is too large, consider:"
echo "  1. Using a quantized model"
echo "  2. Removing unnecessary model files"
echo "  3. Storing the model in S3 and downloading at runtime"
