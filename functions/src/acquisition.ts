import * as functions from "firebase-functions";

export const mailbox = functions.https.onRequest((request, response) => {
  // To test with curl
  //  curl -d '{"payload_fields" : {"lat": 40.1746711730957,"lng": -75.30223083496094, "dev_id": "curlTest01", "TEMPERATURE": 99}}' -H 'Content-Type: application/json' --user-agent "curl" --user ourLora:password https://ourLora.com/mailbox

  const isValidAuthorization =
    request.headers.authorization == "Basic b3VyTG9yYTpwYXNzd29yZA==";
  const isValidContentType =
    request.headers["content-type"] == "application/json";

  if (isValidAuthorization && isValidContentType) {
    // Basic authorization = looking for ourLora:password  as the authorization info
    // Body content tpe must be json
    const userAgent = request.headers["user-agent"]?.split("/", 2);
    if (userAgent) {
      switch (userAgent[0]) {
        case "SIGFOX": {
          const deviceId = request.body.payload_fields.deviceId;
          // SIG fox, you must add the "deviceId : {device}"  property to the to the payload_fields json
          console.log("From SIGFOX , deviceId:", deviceId);
          writeSensorEvent(deviceId, request.body);
          response.status(200).send("Hello SIGFOX ");
          return;
        }
        case "http-ttn": {
          //statements;
          console.log("From TTN ");
          // TTN always provides the device id as part as the body json
          const deviceId = request.body.dev_id;
          console.log("From TTN , deviceId:", deviceId);
          writeSensorEvent(deviceId, request.body);
          response.status(200).send("Hello TTN!");
          return;
        }
        case "curl": {
          //statements;
          const deviceId = request.body.payload_fields["dev_id"];
          console.log("From curl , deviceId:", deviceId);
          writeSensorEvent(deviceId, request.body);
          response.status(200).send("Hello curl - " + deviceId);
          return;
        }
        default: {
          //statements;
          console.log("Invalid user agent:", request.headers["user-agent"]);
          response.status(412).send("Precondition Failed");
          return;
        }
      }
    } else {
      console.log("Missing user agent:");
      response.status(412).send("Precondition Failed");
      return;
    }
  }

  if (!isValidAuthorization) {
    console.log("401 Unauthorized:", request.headers.authorization);
    response.status(401).send("Unauthorized");
    return;
  }

  if (!isValidContentType) {
    console.log("Invalid content type: ", request.headers["content-type"]);
    response.status(412).send("Precondition Failed");
    return;
  }
});

function writeSensorEvent(deviceId: string, requestBody: object) {
  console.log("writeSensorEvent:", deviceId, JSON.stringify(requestBody));
  return;
}
