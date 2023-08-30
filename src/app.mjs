import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (event) => {
    console.log(event);
    let response;

    if (event.httpMethod === 'POST') {
        try {
            response = await insertItem(JSON.parse(event.body));
        } catch (error) {
            response = buildResponse(404, '404 Not Found');
        }
    }
    return response;
};

function buildResponse(statusCode, body) {
    return {
        statusCode: statusCode,
        headers: {
            'Content-Type': 'application/json,'
        },
        body: JSON.stringify(body)
    }
}

async function insertItem(itemData) {
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            userId: itemData.userId,
        },
        UpdateExpression: 'SET #name = :name, #surname = :surname',
        ExpressionAttributeNames: {
            '#name': 'name',
            '#surname': 'surname',
        },
        ExpressionAttributeValues: {
            ':name': itemData.name,
            ':surname': itemData.surname,
        },
        ReturnValues: "ALL_NEW",
    }
    try {
        const command = new UpdateCommand(params);
        const response = await docClient.send(command);
        return buildResponse(200, response);
    } catch (error) {
        return buildResponse(500, error);
    }
}