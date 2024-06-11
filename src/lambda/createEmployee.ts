import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || "http://localhost:8000",
});

const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { body } = event;
  console.log(`LAMBDA createEmployee - body: ${body}`)
  const createEmployeeDto = JSON.parse(body!);

  console.log(`LAMBDA createEmployee - data: ${createEmployeeDto}`)

  const params = {
    TableName: process.env.DYNAMODB_TABLE_NAME || 'employees',
    Item: {
      firstName: createEmployeeDto.firstName,
      lastName: createEmployeeDto.lastName,
      employeeId: createEmployeeDto.employeeId,
      position: createEmployeeDto.position,
    },
  };

  try {
    await docClient.send(new PutCommand(params));
    return {
      statusCode: 201,
      body: JSON.stringify({ message: 'Employee created successfully' }),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};
