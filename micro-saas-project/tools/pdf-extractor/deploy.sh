#!/bin/bash
# PDF Data Extractor - Deployment Script

set -e

APP_NAME="pdf-extractor"
DOCKER_REGISTRY="your-registry.com"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

echo "🚀 Deploying PDF Data Extractor v$VERSION to $ENVIRONMENT"

# Build and push Docker image
echo "🔨 Building Docker image..."
docker build -t $DOCKER_REGISTRY/$APP_NAME:$VERSION .
docker tag $DOCKER_REGISTRY/$APP_NAME:$VERSION $DOCKER_REGISTRY/$APP_NAME:latest

echo "📤 Pushing Docker image..."
docker push $DOCKER_REGISTRY/$APP_NAME:$VERSION
docker push $DOCKER_REGISTRY/$APP_NAME:latest

# Deploy
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌐 Deploying to production..."
    docker-compose pull
    docker-compose up -d --no-deps app
    
    # Health check
    echo "🏥 Health check..."
    sleep 10
    if curl -f http://localhost/api/health; then
        echo "✅ Deployment successful!"
    else
        echo "❌ Health check failed!"
        exit 1
    fi
else
    echo "🧪 Deploying to staging..."
    docker-compose -f docker-compose.staging.yml up -d
fi

echo "🎉 Deployment completed!"
