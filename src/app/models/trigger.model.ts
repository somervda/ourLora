import { DocumentReference } from "@angular/fire/firestore";

export interface Trigger {
  id?: string;
  name: string;
  description: string;
  active: boolean;
  sensorRef: DocumentReference;
  triggerRange: {
    min: number;
    max: number;
  };
  triggerAction: TriggerAction;
  // TargetRef is a user or usergroup
  targetRef?: DocumentReference;
}

export enum TriggerAction {
  "Notification" = 1,
  "eMail" = 2,
  "Log" = 3,
}
