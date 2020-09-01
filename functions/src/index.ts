import * as functions from "firebase-functions";
// import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const mailbox = functions.https.onRequest((request, response) => {
  console.log("request.body.payload_fields:", request.body.payload_fields);
  //   console.log("request.header:", request.header);
  response.status(200).send("Hello from Firebase!");
});

// exports.usersDateCreated = functions.firestore
//   .document("users/{uid}")
//   .onCreate((snap, context) => {
//     return snap.ref.set(
//       {
//         dateCreated: admin.firestore.FieldValue.serverTimestamp()
//       },
//       { merge: true }
//     );
//   });
