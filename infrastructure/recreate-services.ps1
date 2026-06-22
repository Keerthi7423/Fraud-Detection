$cluster = "fraudguard-cluster"
$subnets = "subnet-0047ae82da6baeacb", "subnet-0957bd98cc53e1843", "subnet-0b04fa58d5fcf6847"
$securityGroup = "sg-01dbac01fef4bef0b"

function RecreateService($serviceName, $familyName, $containerPort, $targetGroupArn) {
    Write-Host "Deleting service $serviceName..."
    aws ecs update-service --cluster $cluster --service $serviceName --desired-count 0 | Out-Null
    aws ecs delete-service --cluster $cluster --service $serviceName --force | Out-Null
    
    Start-Sleep -Seconds 10
    
    $networkConfig = @{
        awsvpcConfiguration = @{
            subnets = $subnets
            securityGroups = @($securityGroup)
            assignPublicIp = "ENABLED"
        }
    }
    
    $loadBalancers = @(
        @{
            targetGroupArn = $targetGroupArn
            containerName = $serviceName
            containerPort = $containerPort
        }
    )
    
    $networkConfigJson = $networkConfig | ConvertTo-Json -Depth 5 -Compress
    $loadBalancersJson = $loadBalancers | ConvertTo-Json -Depth 5 -Compress
    
    Write-Host "Creating service $serviceName..."
    aws ecs create-service `
        --cluster $cluster `
        --service-name $serviceName `
        --task-definition $familyName `
        --desired-count 1 `
        --launch-type "FARGATE" `
        --network-configuration $networkConfigJson `
        --load-balancers $loadBalancersJson | Out-Null
        
    Write-Host "Successfully recreated $serviceName with ALB attached."
}

RecreateService "transaction-service" "fraudguard-transaction-task" 3002 "arn:aws:elasticloadbalancing:eu-north-1:310297109097:targetgroup/transaction-tg/0c69a556fb15c938"
RecreateService "notification-service" "fraudguard-notification-task" 3004 "arn:aws:elasticloadbalancing:eu-north-1:310297109097:targetgroup/audit-tg/cf90cc688fa03ffc"
RecreateService "auth-service" "fraudguard-auth-task" 3001 "arn:aws:elasticloadbalancing:eu-north-1:310297109097:targetgroup/auth-tg/817606264e35568b"

Write-Host "All services recreated!"
