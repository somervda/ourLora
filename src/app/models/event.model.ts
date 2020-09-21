import { DocumentReference } from "@angular/fire/firestore";
import { IotDataSource } from "./device.model";
import { UOM } from "./sensor.model";
export interface Event {
  id?: string;
  timestamp: Date | firebase.firestore.FieldValue;
  location: firebase.firestore.GeoPoint;
  geohash: string;
  sensorRef: DocumentReference;
  uom: UOM;
  deviceRef: DocumentReference;
  applicationRefs: DocumentReference[];
  value: number;
  iotDataSource: IotDataSource;
}
