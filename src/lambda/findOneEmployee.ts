import { APIGatewayProxyHandler } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

const docClient = DynamoDBDocumentClient.from(client);

export const handler: APIGatewayProxyHandler = async (event) => {
  const employeeId = event.pathParameters?.id;

  if (employeeId === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Employee ID is missing in request' }),
    };
  }

  const numericId = parseInt(employeeId);

  if (isNaN(numericId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid employee ID' }),
    };
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME || 'employees',
    Key: { employeeId: numericId },
  };

  console.log('FindOne params:', params);

  try {
    const result = await docClient.send(new GetCommand(params));
    console.log('FindOne result:', JSON.stringify(result, null, 2));
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Employee not found' }),
      };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };
  } catch (error: any) {
    console.error('FindOne error:', error.message);
    console.error('Error Stack Trace:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
