import * as admin from "firebase-admin";

export interface Device {
  id?: string;
  name: string;
  description: string;
  deviceId: string;
  iotDataSource: IotDataSource;
  deviceTypeRef: admin.firestore.DocumentReference;
  // location: firebase.firestore.GeoPoint;
  // Using discrete lat/lng for this, only use geopoint for events when I
  // don't need to edit them separately
  latitude: number;
  longitude: number;
  geoHash: string;
}

export enum IotDataSource {
  "TheThingsNetwork" = 1,
  "SigFox" = 2,
  "nb-iot" = 3,
  "Internet" = 4,
  "Hologram" = 5,
  "curl" = 6,
  "LTE" = 7,
}

export interface IotDataSourceInfoItem {
  iotDataSource: IotDataSource;
  name: string;
}

export const IotDataSourceInfo: IotDataSourceInfoItem[] = [
  {
    iotDataSource: IotDataSource.TheThingsNetwork,
    name: "The Things Network",
  },
  {
    iotDataSource: IotDataSource.SigFox,
    name: "SigFox",
  },
  {
    iotDataSource: IotDataSource["nb-iot"],
    name: "NB-IOT",
  },
  {
    iotDataSource: IotDataSource.Internet,
    name: "Internet",
  },
  {
    iotDataSource: IotDataSource.Hologram,
    name: "Hologram",
  },
  {
    iotDataSource: IotDataSource.curl,
    name: "curl testing",
  },
  {
    iotDataSource: IotDataSource.LTE,
    name: "LTE direct",
  },
];
