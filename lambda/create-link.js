const crypto = require('crypto');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const parseRequest = body => {
    const parsedBody = JSON.parse(body || "{}");
    const longUrl = parsedBody.url;
    if (!longUrl) {
        throw new Error("URL is not found in request body");
    }
    return longUrl;
}

const generateShortCode = () => {
    return crypto.randomBytes(4).toString("hex");
}

const saveUrlMapping = async (shortCode, longUrl) => {
    const putCommand = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
            code: shortCode,
            longUrl: longUrl,
        }
    })
    await docClient.send(putCommand);
}

const buildShortUrl = (event, shortCode) => {
    const baseUrl = `https://${event.requestContext.domainName}/${event.requestContext.stage}`;
    return `${baseUrl}/${shortCode}`;
}

exports.handler = async (event) => {
    try {
        const longUrl = parseRequest(event.body);
        const shortCode = generateShortCode();
        await saveUrlMapping(shortCode, longUrl);
        const shortUrl = buildShortUrl(event, shortCode);
        return {
            statusCode: 200,
            body: JSON.stringify({shortUrl}),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({error: error.message || "Internal Server Error"}),
        }
    }
}
