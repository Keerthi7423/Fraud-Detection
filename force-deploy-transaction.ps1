$ErrorActionPreference = "Stop"

$accountId = "310297109097"
$region = "eu-north-1"

Write-Host "Logging in to ECR..."
aws ecr get-login-password --region $region | docker login --username AWS --password-stdin "${accountId}.dkr.ecr.${region}.amazonaws.com"

Write-Host "Building image..."
docker build -t "fraudguard/transaction-service" "services/transaction-service"

Write-Host "Tagging image..."
docker tag "fraudguard/transaction-service:latest" "${accountId}.dkr.ecr.${region}.amazonaws.com/fraudguard/transaction-service:latest"

Write-Host "Pushing image to ECR..."
docker push "${accountId}.dkr.ecr.${region}.amazonaws.com/fraudguard/transaction-service:latest"

Write-Host "Forcing ECS deployment..."
aws ecs update-service --cluster fraudguard-cluster --service transaction-service --force-new-deployment | Out-Null

Write-Host "Waiting for service to stabilize..."
aws ecs wait services-stable --cluster fraudguard-cluster --services transaction-service

Write-Host "Deployment completed successfully!"
