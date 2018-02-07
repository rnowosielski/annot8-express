const winston = require("winston");
const AWSXRay = require('aws-xray-sdk-core');

module.exports = function (req, res, next) {

  if (process.env.xray === "true") {
    let segment = AWSXRay.getSegment();
    let event = req.apiGateway ? req.apiGateway.event : null;

    if (event === null) {
      winston.info("Make sure to add the annot8 middleware after call to awsServerlessExpressMiddleware.eventContext()");
    } else {
      try {
        let query = event.queryStringParameters ? `?${Object.keys(event.queryStringParameters).map(k => `${k}=${event.queryStringParameters[k]}`).join('&')}` : "";
        segment.addAnnotation("Method", event.httpMethod);
        segment.addAnnotation("Url", (event.headers.Host.endsWith(".cimpress.io")) ? `${event.headers.Host}${event.path}` : `${event.headers.Host}/${event.requestContext.stage}${event.path}${query}`);
        segment.addAnnotation("ClientIp", event.requestContext.identity.sourceIp);
        segment.addAnnotation("UserAgent", event.headers["User-Agent"]);
        if (event && event.requestContext && event.requestContext.authorizer) {
          segment.addAnnotation("PrincipalId", event.requestContext.authorizer.principalId);
        }
        segment.addAnnotation("Authorization", event.headers.Authorization);
        segment.addAnnotation("Stage", event.requestContext.stage);

        segment.addMetadata("query", event.queryStringParameters);
        segment.addMetadata("headers", event.headers);

      } catch (err) {
        winston.error(err);
      }
    }
  }
  if (next && typeof next === 'function') {
    next();
  }
};
