# URL Shortener – AWS Serverless

A simple **serverless URL shortener** using **AWS Lambda**, **API Gateway**, **DynamoDB**, and **AWS CDK**.

---

## Features

* AWS Lambda – Handles URL creation and redirection.
* API Gateway – Exposes REST endpoints for POST (shorten URL) and GET (redirect).
* DynamoDB – Stores mappings between short codes and long URLs.
---

## Setup

```sh
# Install dependencies
npm install

# Bootstrap AWS CDK
cdk bootstrap

# Deploy to AWS
cdk deploy
```

---

## Usage

**Shorten URL**

```sh
curl -X POST https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod \
  -d '{"url": "https://example.com/very/long/link"}'
  ```

**Response:**

```json
{ "shortUrl": "https://xxx.api.com/abcd1234" }
```

**Redirect**

Visit: 
```
GET https://xxx.api.com/abcd1234/abcd1234
```

This will redirect to the original link