$accountId = "310297109097"
$region = "eu-north-1"
$executionRoleArn = "arn:aws:iam::${accountId}:role/ecsTaskExecutionRole"
$secretArn = "arn:aws:secretsmanager:${region}:${accountId}:secret:fraudguard-secrets-ELoVen"

function CreateTaskDefinition($familyName, $serviceName, $port, $extraSecrets) {
    $secrets = @(
        @{ name = "MONGO_URI"; valueFrom = "${secretArn}:MONGO_URI::" }
    )
    if ($extraSecrets) {
        $secrets += $extraSecrets
    }
    
    $jsonObj = @{
        family = $familyName
        networkMode = "awsvpc"
        requiresCompatibilities = @("FARGATE")
        cpu = "256"
        memory = "512"
        executionRoleArn = $executionRoleArn
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
                environment = @(
                    @{ name = "PORT"; value = $port.ToString() }
                )
                secrets = $secrets
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

CreateTaskDefinition "fraudguard-transaction-task" "transaction-service" 3002 $null
CreateTaskDefinition "fraudguard-scoring-task" "ai-scoring-service" 3003 @(@{ name="GEMINI_API_KEY"; valueFrom="${secretArn}:GEMINI_API_KEY::"})
CreateTaskDefinition "fraudguard-notification-task" "notification-service" 3004 $null
