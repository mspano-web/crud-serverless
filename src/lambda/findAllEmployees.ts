import { APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (): Promise<APIGatewayProxyResult> => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME || 'employees',
  };

  try {
    const result = await docClient.send(new ScanCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
