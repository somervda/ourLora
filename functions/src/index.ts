import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const mailbox = functions.https.onRequest((request, response) => {
  // Test with
  //  curl -d '{"payload_fields" : {"lat": 40.1746711730957,"lng": -75.30223083496094, "dev_id": "curlTest01"}}' -H 'Content-Type: application/json' --user-agent "curl" --user ourLora:password https://ourLora.com/mailbox
  if (request.headers.authorization == "Basic b3VyTG9yYTpwYXNzd29yZA==") {
    // Basic authorization = looking for ourLora:password  as the authorization info
    // console.log("request.body.payload_fields:", request.body.payload_fields);
    // console.log("request.headers", request.headers);
    // console.log("request.body:", request.body);
    const userAgent = request.headers["user-agent"]?.split("/", 2);
    if (userAgent) {
      switch (userAgent[0]) {
        case "SIGFOX": {
          const deviceId = request.body.payload_fields.deviceId;
          // SIG fox, you must add the "deviceId : {device}"  property to the to the payload_fields json
          console.log("From SIGFOX , deviceId:", deviceId);
          response.status(200).send("Hello SIGFOX ");
          break;
        }
        case "http-ttn": {
          //statements;
          console.log("From TTN ");
          // TTN always provides the device id as part as the body json
          const deviceId = request.body.dev_id;
          console.log("From TTN , deviceId:", deviceId);
          response.status(200).send("Hello TTN!");
          break;
        }
        case "curl": {
          //statements;
          const deviceId = request.body.payload_fields["dev_id"];
          console.log(
            "From curl , deviceId:",
            deviceId,
            request.body.payload_fields
          );
          response.status(200).send("Hello curl - " + deviceId);
          break;
        }
        default: {
          //statements;
          console.log("Invalid user agent:", request.headers["user-agent"]);
          response.status(412).send("Precondition Failed");
          break;
        }
      }
    } else {
      console.log("Missing user agent:");
      response.status(412).send("Precondition Failed");
    }
  } else {
    console.log("401 Unauthorized:", request.headers.authorization);
    response.status(401).send("Unauthorized");
  }
});
