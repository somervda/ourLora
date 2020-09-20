import * as functions from "firebase-functions";
import { db } from "./init";

export const mailbox = functions.https.onRequest(async (request, response) => {
  // To test with curl
  //  curl -d '{"payload_fields" : {"lat": 40.1746711730957,"lng": -75.30223083496094, "dev_id": "curlTest01", "TEMPERATURE": 99}}' -H 'Content-Type: application/json' --user ourLora:password https://ourLora.com/mailbox

  const isValidAuthorization =
    request.headers.authorization == "Basic b3VyTG9yYTpwYXNzd29yZA==";
  const isValidContentType =
    request.headers["content-type"] == "application/json";

  if (isValidAuthorization && isValidContentType) {
    // Basic authorization = looking for ourLora:password  as the authorization info
    // Body content tpe must be json
    const userAgent = request.headers["user-agent"]?.split("/", 2);
    if (userAgent) {
      let deviceId = undefined;
      let iotBackend = undefined;
      switch (userAgent[0]) {
        case "SIGFOX": {
          iotBackend = "SIGFOX";
          deviceId = request.body.payload_fields.deviceId;
          // SIG fox, you must add the "deviceId : {device}"  property to the to the payload_fields json
          break;
        }
        case "http-ttn": {
          //statements;
          iotBackend = "TTN";
          deviceId = request.body.dev_id;
          break;
        }
        case "curl": {
          iotBackend = "CURL";
          //statements;
          deviceId = request.body.payload_fields["dev_id"];
          break;
        }
        default: {
          //statements;
          console.log("Invalid user agent:", request.headers["user-agent"]);
          response.status(412).send("Precondition Failed");
          return;
        }
      }
      if (deviceId) {
        console.log("From " + iotBackend + " deviceId:" + deviceId);
        await writeSensorEvent(deviceId, request.body).then().catch();
        response.status(200).send("Hello " + iotBackend + " - " + deviceId);
      }
      return;
    } else {
      console.log("Missing user agent:");
      response.status(412).send("Precondition Failed");
      return;
    }
  }

  if (!isValidAuthorization) {
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

async function writeSensorEvent(deviceId: string, requestBody: object) {
  // Doing all this stuff synchronously because asynchronous is hurting my brain
  console.log("writeSensorEvent:", deviceId, JSON.stringify(requestBody));
  // Look up device, devicetype and sensors
  const devicesCollectionRef = <FirebaseFirestore.CollectionReference>(
    db.collection("devices")
  );

  const device = await devicesCollectionRef
    .where("deviceId", "==", deviceId)
    .limit(1)
    .get()
    .then((deviceQuery) => {
      if (deviceQuery.size === 0) {
        console.log("Device not found");
        return undefined;
      } else {
        console.log("Device found");
        return deviceQuery.docs[0].data();
      }
    })
    .catch((e) => console.log("d error", e));

  if (device) {
    console.log("device.name:", device.name);
  }

  // Look up devicetype
  if (device) {
    const deviceTypeRef = <FirebaseFirestore.DocumentReference>(
      device.deviceTypeRef
    );
    const devicetype = await deviceTypeRef
      .get()
      .then((dt) => {
        if (dt.exists) {
          return dt.data();
        }
        return undefined;
      })
      .catch((e) => console.log("dt error", e));
    if (devicetype) {
      console.log("devicetype.name:", devicetype.name);
    }
  }

  return;
}
