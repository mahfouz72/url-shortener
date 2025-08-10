const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { GetCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const getShortCode = event => {
    const shortCode = event.pathParameters.code;
    if (shortCode) {
        return shortCode;
    }
    throw new Error("Could not find shortcode in the request");
}

const getLongUrl = async (shortCode) => {
    const getCommand = new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {code: shortCode},
    })
    const result = await docClient.send(getCommand);
    if (result.Item) {
        return result.Item.longUrl;
    }
    throw new Error("Could not find shortcode in the database");
}

exports.handler = async (event) => {
    try {
        const shortCode = getShortCode(event);
        const longUrl = await getLongUrl(shortCode);
        return {
            statusCode: 302,
            headers: {
                Location: longUrl,
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({error: error.message || "Internal Server Error"}),
        }
    }
}