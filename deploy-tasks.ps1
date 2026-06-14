$accountId = "310297109097"
$region = "eu-north-1"
$cluster = "fraudguard-cluster"
$executionRoleArn = "arn:aws:iam::${accountId}:role/ecsTaskExecutionRole"
$secretArn = "arn:aws:secretsmanager:${region}:${accountId}:secret:fraudguard-secrets-ELoVen"
$subnets = '["subnet-0047ae82da6baeacb", "subnet-0957bd98cc53e1843", "subnet-0b04fa58d5fcf6847"]'
$securityGroup = '["sg-01dbac01fef4bef0b"]'

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
    
    $jsonStr = $jsonObj | ConvertTo-Json -Depth 10 -Compress
    $filePath = "$env:TEMP\${familyName}.json"
    [System.IO.File]::WriteAllText($filePath, $jsonStr, [System.Text.Encoding]::ASCII)
    
    Write-Host "Registering $familyName..."
    & "C:\Program Files\Amazon\AWSCLIV2\aws.exe" ecs register-task-definition --cli-input-json file://$filePath | Out-Null
    Write-Host "Successfully registered $familyName"
}

function CreateService($serviceName, $familyName, $containerPort, $targetGroupArn) {
    Write-Host "Creating/Updating service $serviceName..."
    
    $svcCheck = aws ecs describe-services --cluster $cluster --services $serviceName --query "services[0].status" --output text
    
    if ($svcCheck -eq "ACTIVE" -or $svcCheck -eq "DRAINING") {
        Write-Host "Service exists. Deleting it first to reattach load balancers..."
        aws ecs update-service --cluster $cluster --service $serviceName --desired-count 0 | Out-Null
        aws ecs delete-service --cluster $cluster --service $serviceName --force | Out-Null
        
        do {
            Write-Host "Waiting for service to finish draining..."
            Start-Sleep -Seconds 5
            $svcCheck = aws ecs describe-services --cluster $cluster --services $serviceName --query "services[0].status" --output text
        } while ($svcCheck -ne "INACTIVE" -and $svcCheck -ne "None")
    }
    
    $networkStr = "{ `"awsvpcConfiguration`": { `"subnets`": $subnets, `"securityGroups`": $securityGroup, `"assignPublicIp`": `"ENABLED`" } }"
    $networkFile = "$env:TEMP\${serviceName}-net.json"
    [System.IO.File]::WriteAllText($networkFile, $networkStr, [System.Text.Encoding]::ASCII)
    
    if ($targetGroupArn) {
        $lbStr = "[ { `"targetGroupArn`": `"$targetGroupArn`", `"containerName`": `"$serviceName`", `"containerPort`": $containerPort } ]"
        $lbFile = "$env:TEMP\${serviceName}-lb.json"
        [System.IO.File]::WriteAllText($lbFile, $lbStr, [System.Text.Encoding]::ASCII)
        
        aws ecs create-service `
            --cluster $cluster `
            --service-name $serviceName `
            --task-definition $familyName `
            --desired-count 1 `
            --launch-type "FARGATE" `
            --network-configuration file://$networkFile `
            --load-balancers file://$lbFile | Out-Null
    } else {
        aws ecs create-service `
            --cluster $cluster `
            --service-name $serviceName `
            --task-definition $familyName `
            --desired-count 1 `
            --launch-type "FARGATE" `
            --network-configuration file://$networkFile | Out-Null
    }
    Write-Host "Successfully created $serviceName"
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
CreateService "transaction-service" "fraudguard-transaction-task" 3002 "arn:aws:elasticloadbalancing:eu-north-1:310297109097:targetgroup/transaction-tg/0c69a556fb15c938"

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
CreateService "ai-scoring-service" "fraudguard-scoring-task" 3003 $null

# Notification Service
$notifEnv = @(
    @{ name = "SQS_NOTIFICATION_QUEUE_URL"; value = "https://sqs.${region}.amazonaws.com/${accountId}/transaction-notification-queue" }
)
$notifSecrets = @(
    @{ name = "JWT_SECRET"; valueFrom = "${secretArn}:JWT_SECRET::" }
)
CreateTaskDefinition "fraudguard-notification-task" "notification-service" 3004 $notifEnv $notifSecrets
CreateService "notification-service" "fraudguard-notification-task" 3004 "arn:aws:elasticloadbalancing:eu-north-1:310297109097:targetgroup/audit-tg/cf90cc688fa03ffc"

# Auth Service
$authSecrets = @(
    @{ name = "JWT_SECRET"; valueFrom = "${secretArn}:JWT_SECRET::" }
)
CreateTaskDefinition "fraudguard-auth-task" "auth-service" 3001 $null $authSecrets
CreateService "auth-service" "fraudguard-auth-task" 3001 "arn:aws:elasticloadbalancing:eu-north-1:310297109097:targetgroup/auth-tg/817606264e35568b"

Write-Host "Deployment scripts completed successfully!"
