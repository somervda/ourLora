import * as admin from "firebase-admin";

export interface Trigger {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  sensorRef: admin.firestore.DocumentReference;
  triggerRange: {
    min: number;
    max: number;
  };
  message: string;
  triggerAction: TriggerAction;
  // TargetRef is a user or usergroup
  targetRef?: admin.firestore.DocumentReference;
}

export enum TriggerAction {
  "Notification" = 1,
  "eMail" = 2,
  "Log" = 3,
}
