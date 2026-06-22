const { CloudWatchLogsClient, FilterLogEventsCommand } = require("@aws-sdk/client-cloudwatch-logs");
require('dotenv').config();

async function getLogs() {
  const client = new CloudWatchLogsClient({ region: "eu-north-1" });
  try {
    const command = new FilterLogEventsCommand({
      logGroupName: "/ecs/fraudguard-notification-task",
      limit: 20
    });
    const response = await client.send(command);
    response.events.forEach(e => console.log(e.message));
  } catch (err) {
    console.error(err);
  }
}
getLogs();
