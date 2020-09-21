import { Device } from "./../../src/app/models/device.model";
import { Devicetype } from "./../../src/app/models/devicetype.model";
import { Sensor } from "./../../src/app/models/sensor.model";
import * as functions from "firebase-functions";
import { db } from "./init";

export const mailbox = functions.https.onRequest(async (request, response) => {
  // To test with curl
  //  curl -d '{"payload_fields" : {"lat": 40.1746711730957,"lng": -75.30223083496094, "dev_id": "curlTest01", "TEMPERATURE": 99}}' -H 'Content-Type: application/json' --user ourLora:password https://ourLora.com/mailbox

  if (request.headers.authorization != "Basic b3VyTG9yYTpwYXNzd29yZA==") {
    console.log("401 Unauthorized:", request.headers.authorization);
    response.status(401).send("Unauthorized");
    //  Exit if authentication information is missing or invalid
    return;
  }

  if (request.headers["content-type"] != "application/json") {
    console.log("Invalid content type: ", request.headers["content-type"]);
    response.status(412).send("Precondition Failed, invalid content-type");
    // Exit is invalid content-type
    return;
  }

  if (!request.headers["user-agent"]) {
    console.log("Missing user agent:");
    response.status(412).send("Precondition Failed, missing user-agent");
    // Exit if missing user-agent
    return;
  }

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
        response.status(412).send("Precondition Failed, invalid user agent");
        return;
      }
    }
    if (deviceId) {
      console.log("From " + iotBackend + " deviceId:" + deviceId);
      await prepareAndWriteEvent(deviceId, iotBackend, request.body)
        .then()
        .catch();
      response.status(200).send("Hello " + iotBackend + " - " + deviceId);
    }
    return;
  } else {
    console.log("Missing user agent:");
    response.status(412).send("Precondition Failed");
    return;
  }
});

async function prepareAndWriteEvent(
  deviceId: string,
  iotBackend: string,
  requestBody: any
) {
  // Doing all this stuff synchronously because asynchronous is hurting my brain
  console.log("prepareAndWriteEvent:", deviceId, JSON.stringify(requestBody));
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
        return <Device>deviceQuery.docs[0].data();
      }
    })
    .catch((e) => console.log("d error", e));

  if (device) {
    console.log("device.name:", device.name);
  }

  // Look up devicetype
  if (device) {
    // const deviceTypeRef = <FirebaseFirestore.DocumentReference>(
    //   device.deviceTypeRef
    // );

    const devicetype = await device.deviceTypeRef
      .get()
      .then((dt) => {
        if (dt.exists) {
          return <Devicetype>dt.data();
        }
        return undefined;
      })
      .catch((e) => console.log("dt error", e));
    if (devicetype) {
      console.log("devicetype.name:", devicetype.name);
      // get sensors
      const sensorsCollectionRef = <FirebaseFirestore.CollectionReference>(
        db.collection(device.deviceTypeRef.path + "/sensors")
      );
      console.log("sensorsCollectionRef.path:", sensorsCollectionRef.path);
      const sensorSnapShots = await sensorsCollectionRef.get();
      const sensors = sensorSnapShots.docs.map((sensorSnapShot) => {
        const sensor = <Sensor>{
          id: sensorSnapShot.id,
          ...sensorSnapShot.data(),
        };
        return sensor;
      });

      //  **********************************************
      // We have all the information needed to create an event document
      writeEvent(device, devicetype, sensors, iotBackend, requestBody);
      console.log("x", JSON.stringify(sensors));
    }
  }

  return;
}

function writeEvent(
  device: Device,
  devicetype: Devicetype,
  sensors: Sensor[],
  iotBackend: string,
  requestBody: any
) {
  // Match up the sensor definition with the data in the requestBody data, and write an event
  // for each matching sensor
  // const bodyAsString = JSON.stringify(requestBody);
  // const bodyAsObject = JSON.parse(bodyAsString);
  const getKeyValue = <U extends keyof T, T extends object>(key: U) => (
    obj: T
  ) => obj[key];
  sensors.forEach((sensor) => {
    if (requestBody[sensor.acquisitionMapValue]) {
      // Value property exists for the sensor, we can write an event
      const value = requestBody[sensor.acquisitionMapValue];
    }
  });
}
