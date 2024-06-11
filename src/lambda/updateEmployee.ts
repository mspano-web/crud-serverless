import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, UpdateCommandInput } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Employee ID is required' }),
    };
  }

  const updateEmployeeDto = JSON.parse(event.body!);
  if (!updateEmployeeDto.firstName || !updateEmployeeDto.lastName || !updateEmployeeDto.position) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'First name, last name, and position are required' }),
    };
  }

  const numericId = parseInt(id);

  if (isNaN(numericId)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid employee ID' }),
    };
  }

  const params: UpdateCommandInput = {
    TableName: process.env.DYNAMODB_TABLE_NAME || 'employees',
    Key: { employeeId: numericId },
    UpdateExpression: 'set firstName = :firstName, lastName = :lastName, #pos = :position',
    ExpressionAttributeNames: { '#pos': 'position' },
    ExpressionAttributeValues: {
      ':firstName': updateEmployeeDto.firstName,
      ':lastName': updateEmployeeDto.lastName,
      ':position': updateEmployeeDto.position,
    },
    ReturnValues: 'ALL_NEW',
  };

  try {
    const result = await docClient.send(new UpdateCommand(params));
    return {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
