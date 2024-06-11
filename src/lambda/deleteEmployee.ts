import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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

  try {
    await docClient.send(new DeleteCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Employee deleted successfully' }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
