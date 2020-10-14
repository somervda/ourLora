import { DocumentReference } from "@angular/fire/firestore";
export interface User {
  uid: string;
  email: string;
  photoURL?: string;
  displayName?: string;
  // Date and time the user first logged into the application (used for aging)
  dateCreated?: Date | firebase.firestore.FieldValue;
  dateLastLogon?: Date | firebase.firestore.FieldValue;

  // Simple Authorization scheme
  isAdmin?: Boolean;
  // Indicates the user has administration rights including ability to
  // set a users roles
  isActivated?: Boolean;
  // Indicates the user can use the application , by default
  // a user is inactive until an administrator activates them
  usergroups?: DocumentReference[];
  // The Firebase Cloud Messaging (FCM) tokens registered for device
  // Note: multiple users may register the same shared device (Deal with that when sending messages)
  deviceMessagingTokens?: string[];
}
