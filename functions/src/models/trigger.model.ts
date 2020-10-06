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

/**
 * Action to perform if a trigger is fired
 */
export enum TriggerAction {
  "Notification" = 1,
  "eMail" = 2,
  "Log" = 3,
}

export interface TriggerActionInfoItem {
  value: number;
  name: string;
  nameShort: string;
}

export const TriggerActionInfo: TriggerActionInfoItem[] = [
  {
    value: 1,
    name: "User Notification",
    nameShort: "Notification",
  },
  {
    value: 2,
    name: "User EMail",
    nameShort: "email",
  },
  {
    value: 3,
    name: "Log Entry",
    nameShort: "Log",
  },
];
