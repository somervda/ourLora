import { DocumentReference } from "@angular/fire/firestore";
export interface Event {
  id?: string;
  timestamp: Timestamp;
  location: geopoint;
  geohash: string;
  sensor: docref;
  uom: enum;
  device: docref;
  applications: docref[];
  value: number;
}
