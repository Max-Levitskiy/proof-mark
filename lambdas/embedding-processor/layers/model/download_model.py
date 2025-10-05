#!/usr/bin/env python3

"""
Download and prepare the SentenceTransformer model for Lambda layer.

This script downloads the google/embeddinggemma-300m model and packages it
for deployment as a Lambda layer.
"""

import os
import shutil
from pathlib import Path
from sentence_transformers import SentenceTransformer

# Configuration
MODEL_NAME = "google/embeddinggemma-300m"
BUILD_DIR = Path("build")
MODEL_DIR = BUILD_DIR / "model"

def main():
    print(f"Downloading model: {MODEL_NAME}")

    # Clean previous build
    if BUILD_DIR.exists():
        print(f"Cleaning previous build directory: {BUILD_DIR}")
        shutil.rmtree(BUILD_DIR)

    # Create build directory
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Loading and caching model to: {MODEL_DIR}")

    # Download and save model
    model = SentenceTransformer(MODEL_NAME)
    model.save(str(MODEL_DIR))

    print(f"Model downloaded successfully to {MODEL_DIR}")

    # Display model info
    total_size = sum(f.stat().st_size for f in MODEL_DIR.rglob('*') if f.is_file())
    print(f"Total model size: {total_size / (1024 * 1024):.2f} MB")

    print("\nModel files:")
    for file in sorted(MODEL_DIR.rglob('*')):
        if file.is_file():
            size = file.stat().st_size / (1024 * 1024)
            print(f"  {file.relative_to(MODEL_DIR)}: {size:.2f} MB")

    print("\n✅ Model download complete!")
    print(f"Next step: Run build.sh to create the Lambda layer zip file")

if __name__ == "__main__":
    main()
