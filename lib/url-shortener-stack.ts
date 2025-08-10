import * as cdk from 'aws-cdk-lib';
import {RemovalPolicy} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apiGateway from "aws-cdk-lib/aws-apigateway"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"

export class UrlShortenerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'UrlsTable', {
      partitionKey: {name: "code", type: dynamodb.AttributeType.STRING},
      removalPolicy: RemovalPolicy.DESTROY,
    })

    const createLink = new lambda.Function(this, 'CreateLinkLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'create-link.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    })

    const redirect = new lambda.Function(this, 'RedirectLambdaFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'redirect.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        TABLE_NAME: table.tableName,
      },
    })

    table.grantWriteData(createLink);
    table.grantReadData(redirect);

    const api = new apiGateway.RestApi(this, 'url-shortener-api');

    // POST /create  -> create-link lambda (return short code)
    api.root
        .addResource('create')
        .addMethod('POST', new apiGateway.LambdaIntegration(createLink));

    // GET  /{code}  -> redirect lambda (redirect from short code to the real url)
    api.root
        .addResource('{code}')
        .addMethod('GET', new apiGateway.LambdaIntegration(redirect));
  }
}
