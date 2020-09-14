import { DocumentReference } from "@angular/fire/firestore";
export interface Device {
  id?: string;
  name: string;
  description: string;
  deviceId: string;
  networkSource: NetworkSource;
  deviceType: DocumentReference;
}

export enum NetworkSource {
  "TheThingsNetwork" = 1,
  "SigFox" = 2,
  "nb-iot" = 3,
  "WiFi" = 4,
}
