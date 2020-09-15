import { DocumentReference } from "@angular/fire/firestore";

export interface Device {
  id?: string;
  name: string;
  description: string;
  deviceId: string;
  networkSource: NetworkSource;
  deviceType: DocumentReference;
  location: firebase.firestore.GeoPoint;
  geoHash: string;
}

export enum NetworkSource {
  "TheThingsNetwork" = 1,
  "SigFox" = 2,
  "nb-iot" = 3,
  "Internet" = 4,
}

export interface NetworkSourceInfoItem {
  networkSource: NetworkSource;
  name: string;
}

export const NetworkSourceInfo: NetworkSourceInfoItem[] = [
  {
    networkSource: NetworkSource.TheThingsNetwork,
    name: "The Things Network",
  },
  {
    networkSource: NetworkSource.SigFox,
    name: "SigFox",
  },
  {
    networkSource: NetworkSource["nb-iot"],
    name: "NB-IOT",
  },
  {
    networkSource: NetworkSource.Internet,
    name: "Internet",
  },
];
