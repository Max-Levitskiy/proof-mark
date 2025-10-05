#!/bin/bash

# Build script for Lambda dependencies layer
# Creates a deployment package with all Python dependencies

set -e

echo "Building Lambda dependencies layer..."

# Configuration
LAYER_NAME="embedding-dependencies"
PYTHON_VERSION="python3.11"
BUILD_DIR="build"
PACKAGE_DIR="$BUILD_DIR/python"

# Clean previous build
rm -rf "$BUILD_DIR"
mkdir -p "$PACKAGE_DIR"

echo "Installing dependencies for $PYTHON_VERSION..."

# Install dependencies to the package directory
pip install \
    --platform manylinux2014_x86_64 \
    --target="$PACKAGE_DIR" \
    --implementation cp \
    --python-version 3.11 \
    --only-binary=:all: \
    --upgrade \
    -r requirements.txt

# Remove unnecessary files to reduce layer size
echo "Cleaning up unnecessary files..."
find "$PACKAGE_DIR" -type d -name "tests" -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find "$PACKAGE_DIR" -name "*.pyc" -delete
find "$PACKAGE_DIR" -name "*.pyo" -delete
find "$PACKAGE_DIR" -name "*.dist-info" -exec rm -rf {} + 2>/dev/null || true

# Create deployment package
echo "Creating deployment package..."
cd "$BUILD_DIR"
zip -r "../${LAYER_NAME}.zip" python -q

cd ..
echo "Dependencies layer built successfully: ${LAYER_NAME}.zip"
echo "Layer size: $(du -h ${LAYER_NAME}.zip | cut -f1)"

# Cleanup
rm -rf "$BUILD_DIR"

echo "Build complete!"
