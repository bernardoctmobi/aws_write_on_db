import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

export const lambdaHandler = async (event) => {
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
    const details = itemData.Details ?? null;
    const params = {
        TableName: process.env.DYNAMODB_TABLE,
        Key: {
            PK: itemData.PK,
            SK: itemData.SK
        },
        UpdateExpression: 'SET #details = :details',
        ExpressionAttributeNames: {
            '#details': 'details'
        },
        ExpressionAttributeValues: {
            ':details': details
        },
        ReturnValues: "ALL_NEW",
    }
    console.log(params);
    try {
        const command = new UpdateCommand(params);
        const response = await docClient.send(command);
        console.log(`Inserimento riuscito`);
        return buildResponse(200, response);
    } catch (error) {
        console.log(`Inserimento fallito`);
        return buildResponse(500, error);
    }
}