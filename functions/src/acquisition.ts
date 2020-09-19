import * as functions from "firebase-functions";

export const mailbox = functions.https.onRequest((request, response) => {
  // To test with curl
  //  curl -d '{"payload_fields" : {"lat": 40.1746711730957,"lng": -75.30223083496094, "dev_id": "curlTest01", "TEMPERATURE": 99}}' -H 'Content-Type: application/json' --user ourLora:password https://ourLora.com/mailbox

  // Perform basic validation of data being received
  if (request.headers.authorization != "Basic b3VyTG9yYTpwYXNzd29yZA==") {
    console.log("401 Unauthorized:", request.headers.authorization);
    response.status(401).send("Unauthorized");
    //  Exit if authentication information is missing or invalid
    return;
  }

  if (request.headers["content-type"] != "application/json") {
    console.log("Invalid content type: ", request.headers["content-type"]);
    response.status(412).send("Precondition Failed");
    // Exit is invalid content-type
    return;
  }

  if (!request.headers["user-agent"]) {
    console.log("Missing user agent:");
    response.status(412).send("Precondition Failed");
    // Exit if missing user-agent
    return;
  }

  // Process the body information based on the source (user-agent) of the request
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
        // Exit if invalid user-agent
        return;
      }
    }
  }
});

function writeSensorEvent(deviceId: string, requestBody: object) {
  //   Extract any sensor information, resolve device, application and
  //  then write each sensor event and related data  to the event collection
  console.log("writeSensorEvent:", deviceId, JSON.stringify(requestBody));
  return;
}
