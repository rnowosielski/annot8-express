const winston = require("winston");
const AWSXRay = require('aws-xray-sdk-core');

function go(next) {
    if (next && typeof next === 'function') {
        next();
    }
}

module.exports = function (req, res, next) {
  if (process.env.xray !== "true") {
    go(next);
    return;
  }

  let event = req.apiGateway ? req.apiGateway.event : null;
  if (event === null) {
    winston.info("Make sure to add the annot8 middleware after call to awsServerlessExpressMiddleware.eventContext()");
    go(next);
    return;
  }

  try {
    let query = event.queryStringParameters ? `?${Object.keys(event.queryStringParameters || {}).map(k => `${k}=${event.queryStringParameters[k]}`).join('&')}` : "";

    let requestContext = event.requestContext || {};

    let segment = AWSXRay.getSegment();
    segment.addAnnotation("Method", event.httpMethod);

    if (event.headers) {
      segment.addMetadata("headers", event.headers);

      let host = event.headers.Host || '';
      segment.addAnnotation("Url", (host.endsWith(".amazonaws.com")) ? `${host}/${requestContext.stage}${event.path}${query}` : `${host}${event.path}`);

      segment.addAnnotation("UserAgent", event.headers["User-Agent"]);

      if (event.headers.Authorization) {
          segment.addAnnotation("Authorization", event.headers.Authorization);
      }
    }

    segment.addAnnotation("ClientIp", (requestContext.identity || {}).sourceIp);
    if (requestContext.authorizer) {
      segment.addAnnotation("PrincipalId", requestContext.authorizer.principalId);
    }

    segment.addAnnotation("Stage", requestContext.stage);
    segment.addMetadata("query", event.queryStringParameters);

  } catch (err) {
    winston.error(err);
  }

  go(next);
};
