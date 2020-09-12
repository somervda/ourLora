import { Injectable } from "@angular/core";
import { AngularFirestore, DocumentReference } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { Usergroup } from "../models/usergroup.model";
import { map, first } from "rxjs/operators";
import { convertSnap, convertSnaps, dbFieldUpdate } from "./db-utils";

@Injectable({
  providedIn: "root",
})
export class UsergroupService {
  collectionName = "usergroups";

  constructor(private afs: AngularFirestore) {}

  /**
   * Find a Usergroup doc by Usergroup id
   * @param id Usergroup Id
   */
  findById(id: string): Observable<Usergroup> {
    return this.afs
      .doc("/" + this.collectionName + "/" + id)
      .snapshotChanges()
      .pipe(
        map((snap) => {
          return convertSnap<Usergroup>(snap);
        }),
        first()
      );
  }

  /**
   * Find all Usergroups
   * @param pageSize The maximum number of Usergroups to return
   */
  findAll(pageSize: number): Observable<Usergroup[]> {
    // console.log("Usergroup findAll", pageSize);
    return this.afs
      .collection(this.collectionName, (ref) => ref.limit(pageSize))
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          // console.log("find Usergroups", convertSnaps<Usergroup>(snaps));
          return convertSnaps<Usergroup>(snaps);
        })
      );
  }

  /**
   *Find Usergroups by matching on first letters of the name
   * @param name Partial name used for matching, will match on initial letters
   * @param pageSize The maximum number of categories to return
   */
  findByPartialName(
    name: string,
    pageSize: number = 100
  ): Observable<Usergroup[]> {
    // console.log( "findByPartialName",  pageSize  );
    return this.afs
      .collection(this.collectionName, (ref) =>
        ref
          .where("name", ">=", name)
          .where("name", "<=", name + "~")
          .orderBy("name", "asc")
          .limit(pageSize)
      )
      .snapshotChanges()
      .pipe(
        map((snaps) => {
          return convertSnaps<Usergroup>(snaps);
        })
      );
  }

  fieldUpdate(docId: string, fieldName: string, newValue: any) {
    if (docId && fieldName) {
      const updateObject = {};
      dbFieldUpdate(
        "/" + this.collectionName + "/" + docId,
        fieldName,
        newValue,
        this.afs
      );
    }
  }

  create(usergroup: Usergroup): Promise<DocumentReference> {
    return this.afs.collection(this.collectionName).add(usergroup);
  }

  delete(id: string): Promise<void> {
    return this.afs.collection(this.collectionName).doc(id).delete();
  }
}
