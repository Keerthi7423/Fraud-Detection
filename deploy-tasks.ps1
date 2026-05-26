$accountId = "310297109097"
$region = "eu-north-1"
$executionRoleArn = "arn:aws:iam::${accountId}:role/ecsTaskExecutionRole"
$secretArn = "arn:aws:secretsmanager:${region}:${accountId}:secret:fraudguard-secrets-ELoVen"

function CreateTaskDefinition($familyName, $serviceName, $port, $extraEnv, $extraSecrets) {
    $secrets = @(
        @{ name = "MONGO_URI"; valueFrom = "${secretArn}:MONGO_URI::" }
    )
    if ($extraSecrets) {
        $secrets += $extraSecrets
    }
    
    $environment = @(
        @{ name = "PORT"; value = $port.ToString() }
        @{ name = "AWS_REGION"; value = $region }
        @{ name = "NODE_ENV"; value = "production" }
    )
    if ($extraEnv) {
        $environment += $extraEnv
    }
    
    $jsonObj = @{
        family = $familyName
        networkMode = "awsvpc"
        requiresCompatibilities = @("FARGATE")
        cpu = "256"
        memory = "512"
        executionRoleArn = $executionRoleArn
        taskRoleArn = $executionRoleArn
        containerDefinitions = @(
            @{
                name = $serviceName
                image = "${accountId}.dkr.ecr.${region}.amazonaws.com/fraudguard/${serviceName}:latest"
                portMappings = @(
                    @{
                        containerPort = $port
                        protocol = "tcp"
                    }
                )
                essential = $true
                environment = $environment
                secrets = $secrets
                logConfiguration = @{
                    logDriver = "awslogs"
                    options = @{
                        "awslogs-create-group" = "true"
                        "awslogs-group" = "/ecs/$familyName"
                        "awslogs-region" = $region
                        "awslogs-stream-prefix" = "ecs"
                    }
                }
            }
        )
    }
    
    $jsonStr = $jsonObj | ConvertTo-Json -Depth 10
    $filePath = "$env:TEMP\${familyName}.json"
    $jsonStr | Set-Content -Path $filePath
    
    Write-Host "Registering $familyName..."
    & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" ecs register-task-definition --cli-input-json file://$filePath | Out-Null
    Write-Host "Successfully registered $familyName"
}

# Transaction Service
$txnEnv = @(
    @{ name = "SQS_SCORING_QUEUE_URL"; value = "https://sqs.${region}.amazonaws.com/${accountId}/transaction-scoring-queue" }
    @{ name = "RAZORPAY_KEY_ID"; value = "rzp_test_Spv9YpkxAUa8nm" }
    @{ name = "RAZORPAY_KEY_SECRET"; value = "W8VZuD8MUDfgCtIRg8ibWIC7" }
    @{ name = "RAZORPAY_WEBHOOK_SECRET"; value = "fraud_guard_secret" }
)
$txnSecrets = @(
    @{ name = "JWT_SECRET"; valueFrom = "${secretArn}:JWT_SECRET::" }
)
CreateTaskDefinition "fraudguard-transaction-task" "transaction-service" 3002 $txnEnv $txnSecrets

# AI Scoring Service
$scoringEnv = @(
    @{ name = "SQS_SCORING_QUEUE_URL"; value = "https://sqs.${region}.amazonaws.com/${accountId}/transaction-scoring-queue" }
    @{ name = "SQS_NOTIFICATION_QUEUE_URL"; value = "https://sqs.${region}.amazonaws.com/${accountId}/transaction-notification-queue" }
)
$scoringSecrets = @(
    @{ name = "GEMINI_API_KEY"; valueFrom="${secretArn}:GEMINI_API_KEY::"}
    @{ name = "JWT_SECRET"; valueFrom = "${secretArn}:JWT_SECRET::" }
)
CreateTaskDefinition "fraudguard-scoring-task" "ai-scoring-service" 3003 $scoringEnv $scoringSecrets

# Notification Service
$notifEnv = @(
    @{ name = "SQS_NOTIFICATION_QUEUE_URL"; value = "https://sqs.${region}.amazonaws.com/${accountId}/transaction-notification-queue" }
)
$notifSecrets = @(
    @{ name = "JWT_SECRET"; valueFrom = "${secretArn}:JWT_SECRET::" }
)
CreateTaskDefinition "fraudguard-notification-task" "notification-service" 3004 $notifEnv $notifSecrets

# Auth Service
$authSecrets = @(
    @{ name = "JWT_SECRET"; valueFrom = "${secretArn}:JWT_SECRET::" }
)
CreateTaskDefinition "fraudguard-auth-task" "auth-service" 3001 $null $authSecrets
