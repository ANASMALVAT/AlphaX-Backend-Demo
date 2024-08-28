const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

const AWS_REGION = 'us-east-1'; 
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const TABLE_NAME = 'questions-list';

const client = new DynamoDBClient({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  }
});

const docClient = DynamoDBDocumentClient.from(client);

async function questionListModel() {
  try {
    const scanCommand = new ScanCommand({
        TableName: TABLE_NAME,
    });
    const scanResponse = await docClient.send(scanCommand);
    if (scanResponse.Items) {
      return  scanResponse.Items;
    }
  } catch (error) {
    return { success:false, message: "Error retrieving items from the table" }; 
  }
}

module.exports = {
  questionListModel,
};
