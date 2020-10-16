import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs";
import { User } from "../models/user.model";
import { HelperService } from "./helper.service";
import { UserService } from "./user.service";
@Injectable({
  providedIn: "root",
})
export class MessagingService {
  currentMessage = new BehaviorSubject(null);
  constructor(
    private angularFireMessaging: AngularFireMessaging,
    private helper: HelperService,
    userService: UserService
  ) {
    this.angularFireMessaging.messaging.subscribe((_messaging) => {
      _messaging.onMessage = _messaging.onMessage.bind(_messaging);
    });
  }

  /**
   * Will request permission to allow the use of messaging if not already set
   * (see in browser  settings -> Privacy & security -> site settings -> permissions -> notifications -> <site name>)
   * Then will get the token (Will return either the existing token if already set, or a new token)
   * @param user Used to add the token from the user's deviceMessagingTokens array (if not already present)
   */
  requestPermissionAndToken(user: User) {
    this.angularFireMessaging.requestToken.subscribe(
      (token) => {
        console.log("Permission granted! Save to the server!", token);
      },
      (error) => {
        console.error(error);
      }
    );
  }

  /**
   * Initialize a subscription to receive and process FCM messages
   */
  receiveMessage() {
    this.angularFireMessaging.messages.subscribe((payload) => {
      console.log("receiveMessage: ", payload);
      // this.helper.snackbar("Hi:- " + payload["notification"]["title"], 2000);
      this.currentMessage.next(payload);
    });
  }

  // receiveMessage$() {
  //   return this.angularFireMessaging.messages;
  // }

  /**
   * Delete the token if it exists, or create one and then delete it
   * @param user Used to remove the token from the user's deviceMessagingTokens array (if present)
   */
  deleteToken(user: User) {
    this.angularFireMessaging.getToken.subscribe((token) => {
      console.log("Token to delete:", token);
      this.angularFireMessaging.deleteToken(token).subscribe((result) => {
        console.log("Token deleted!", result);
      });
    });
  }
}
