import { db } from "./init";
import { Event } from "./models/event.model";
import { Application } from "./models/application.model";
import { Trigger, TriggerAction } from "./models/trigger.model";
import { Triggerlog } from "./models/triggerlog.model";
import { User } from "./models/user.model";
import * as admin from "firebase-admin";

export const eventTrigger = function (event: Event) {
  console.log("eventTrigger", JSON.stringify(event));
  event.applicationRefs.forEach((e) => {
    e.get()
      .then((a) => {
        const application: Application = <Application>{ id: a.id, ...a.data() };
        console.log("appRef:", JSON.stringify(application));
        processApplicationSensorTrigger(event, application);
      })
      .catch();
  });
};

function processApplicationSensorTrigger(
  event: Event,
  application: Application
) {
  const triggerCollectionPath = `applications/${application.id}/triggers`;
  const triggerCollectionRef = <FirebaseFirestore.CollectionReference>(
    db.collection(triggerCollectionPath)
  );
  console.log(
    "triggerCollectionRef:",
    triggerCollectionPath,
    " ref:",
    JSON.stringify(triggerCollectionRef)
  );
  triggerCollectionRef
    .where("sensorRef", "==", event.sensorRef)
    .where("active", "==", true)
    .get()
    .then((triggerSnaps) => {
      triggerSnaps.forEach((triggerSnap) => {
        // We found a matching, active, trigger for this application and sensor
        const trigger: Trigger = <Trigger>{
          id: triggerSnap.id,
          ...triggerSnap.data(),
        };
        console.log("trigger:", JSON.stringify(trigger));
        // Check if event value is within the required trigger range
        if (
          event.value >= trigger.triggerRangeMin &&
          event.value <= trigger.triggerRangeMax
        ) {
          // Process the trigger action, note a log is always done
          writeTriggerLog(event, application, trigger);
          switch (trigger.triggerAction) {
            case TriggerAction.eMail:
              // send an email to the application users
              break;
            case TriggerAction.Notification:
              // Send a notification to each application user
              sendNotifications(trigger, event, application);
              break;
          }
        }
      });
    })
    .catch();
}

function writeTriggerLog(
  event: Event,
  application: Application,
  trigger: Trigger
) {
  const triggerPath = `applications/${application.id}/triggers/${trigger.id}`;
  const triggerRef = <FirebaseFirestore.DocumentReference>db.doc(triggerPath);
  const eventPath = `events/${event.id}`;
  const eventRef = <FirebaseFirestore.DocumentReference>db.doc(eventPath);
  const triggerlog: Triggerlog = {
    timestamp: admin.firestore.Timestamp.fromDate(new Date()),
    triggerRef: triggerRef,
    eventRef: eventRef,
  };
  console.log("triggerlog to write", JSON.stringify(triggerlog));
  db.collection("triggerlogs").add(triggerlog);
}

/**
 * Send a FCM notification to each user in the application
 * @param trigger
 * @param event
 * @param application
 */
function sendNotifications(
  trigger: Trigger,
  event: Event,
  application: Application
) {
  application.userRefs.forEach((userRef) => {
    userRef
      .get()
      .then((userSnap) => {
        const user = <User>userSnap.data();
        sendNotification(trigger, event, user);
      })
      .catch();
  });
}

/**
 * Send a FCM notification to a specific user
 * @param trigger
 * @param event
 * @param user
 */
function sendNotification(trigger: Trigger, event: Event, user: User) {
  // console.log("sendNotification user:", JSON.stringify(user));
  if (user.deviceMessagingToken) {
    const payload = {
      notification: {
        title: trigger.name,
        body: trigger.message,
      },
    };
    admin
      .messaging()
      .sendToDevice(user.deviceMessagingToken, payload)
      .then(() => console.log("Successful message"))
      .catch((e) => console.error("Send message failed:", e));
  }
}
