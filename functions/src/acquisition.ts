import { Device, IotDataSource } from "./models/device.model";
import { Devicetype } from "./models/devicetype.model";
import { Sensor } from "./models/sensor.model";
import { Event } from "./models/event.model";
import * as functions from "firebase-functions";
import { db } from "./init";
import * as admin from "firebase-admin";

export const mailbox = functions.https.onRequest(async (request, response) => {
  // To test with curl
  //  curl -d '{"payload_fields" : {"lat": 40.1746711730957,"lng": -75.30223083496094, "dev_id": "curlTest01", "TEMPERATURE": 99}}' -H 'Content-Type: application/json' --user ourLora:password https://ourLora.com/mailbox

  if (request.headers.authorization !== "Basic b3VyTG9yYTpwYXNzd29yZA==") {
    console.log("401 Unauthorized:", request.headers.authorization);
    response.status(401).send("Unauthorized");
    //  Exit if authentication information is missing or invalid
    return;
  }

  if (request.headers["content-type"] !== "application/json") {
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
    let iotDataSource: IotDataSource;
    switch (userAgent[0]) {
      case "SIGFOX": {
        iotDataSource = IotDataSource.SigFox;
        deviceId = request.body.payload_fields.deviceId;
        // SIG fox, you must add the "deviceId : {device}"  property to the to the payload_fields json
        break;
      }
      case "http-ttn": {
        //statements;
        iotDataSource = IotDataSource.TheThingsNetwork;
        deviceId = request.body.dev_id;
        break;
      }
      case "curl": {
        iotDataSource = IotDataSource.TheThingsNetwork;
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
      console.log("From " + iotDataSource + " deviceId:" + deviceId);
      await prepareAndWriteEvent(deviceId, iotDataSource, request.body)
        .then()
        .catch();
      response.status(200).send("Hello " + iotDataSource + " - " + deviceId);
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
  iotDataSource: IotDataSource,
  requestBody: any
) {
  // Doing all this stuff synchronously because asynchronous is hurting my brain
  // Assign all events for a particular acquisition operation the same timestamp;
  const timestamp = new Date();
  // console.log("prepareAndWriteEvent:", deviceId, JSON.stringify(requestBody));
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
        return <Device>{
          id: deviceQuery.docs[0].id,
          ...deviceQuery.docs[0].data(),
        };
      }
    })
    .catch((e) => console.log("d error", e));

  if (device) {
    console.log("device:", JSON.stringify(device));
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
          return <Devicetype>{ id: dt.id, ...dt.data() };
        }
        return undefined;
      })
      .catch((e) => console.log("dt error", e));
    if (devicetype) {
      console.log("devicetype:", JSON.stringify(devicetype));
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
      // console.log("sensors: ", JSON.stringify(sensors));

      //  **********************************************
      // We have all the information needed to create an event document
      await writeEvent(
        device,
        devicetype,
        sensors,
        iotDataSource,
        requestBody,
        timestamp
      );
    }
  }

  return;
}

async function writeEvent(
  device: Device,
  devicetype: Devicetype,
  sensors: Sensor[],
  iotDataSource: IotDataSource,
  requestBody: any,
  timestamp: Date
) {
  // Match up the sensor definition with the data in the requestBody data, and write an event
  // for each matching sensor
  // console.log(
  //   "writeEvent device:",
  //   JSON.stringify(device),
  //   " devicetype:",
  //   JSON.stringify(devicetype),
  //   " sensors:",
  //   JSON.stringify(sensors),
  //   " body:",
  //   JSON.stringify(requestBody),
  //   " timestamp:",
  //   timestamp,
  //   " devicetype:",
  //   iotDataSource
  // );

  sensors.forEach(async (sensor) => {
    // console.log(
    //   "getBodyField(requestBody,sensor.acquisitionMapValue)",
    //   getBodyField(requestBody, sensor.acquisitionMapValue)
    // );
    if (getBodyField(requestBody, sensor.acquisitionMapValue)) {
      // Value property exists for the sensor, we can write an event
      // console.log("Sensor found:", sensor.name);
      const value = getBodyField(requestBody, sensor.acquisitionMapValue);
      let latitude = device.latitude;
      let longitude = device.longitude;
      let event: Event;
      event = {
        timestamp: admin.firestore.Timestamp.fromDate(timestamp),
        value: value,
        location: new admin.firestore.GeoPoint(latitude, longitude),
        geohash: "",
        uom: sensor.uom,
        deviceRef: db.collection("devices").doc(device.id),
        sensorRef: db
          .collection("devicetypes")
          .doc(devicetype.id)
          .collection("sensors")
          .doc(sensor.id),
        applicationRefs: [],
        iotDataSource: iotDataSource,
      };
      console.log("Event to write", JSON.stringify(event));
      await db.collection("events").add(event);
    }
  });
}

function getBodyField(body: any, fieldName: string) {
  // console.log("getBodyField", fieldName, " body:", JSON.stringify(body));
  const fieldNameParts = fieldName.split(".", 3);
  switch (fieldNameParts.length) {
    case 1:
      return body[fieldNameParts[0]];
    case 2:
      return body[fieldNameParts[0]][fieldNameParts[1]];
    case 3:
      return body[fieldNameParts[0]][fieldNameParts[1]][fieldNameParts[2]];
  }

  return undefined;
}
