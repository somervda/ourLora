import { Component, OnInit, Inject } from "@angular/core";
import { Usergroup } from "../../models/usergroup.model";
import { Observable } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { UsergroupService } from "src/app/services/usergroup.service";
import { DocumentReference } from "@angular/fire/firestore";
import { HelperService } from "src/app/services/helper.service";

@Component({
  selector: "app-usergroupselectordialog",
  templateUrl: "./usergroupselectordialog.component.html",
  styleUrls: ["./usergroupselectordialog.component.scss"],
})
export class UsergroupselectordialogComponent implements OnInit {
  usergroups: DocumentReference[];
  usergroups$: Observable<Usergroup[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usergroupService: UsergroupService,
    private dialogRef: MatDialogRef<UsergroupselectordialogComponent>,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.usergroups = this.data["refSelected"];
    // console.log("usergroupselectordialog this.usergroups", this.usergroups);
    this.usergroups$ = this.usergroupService.findAll(100);
  }

  returnItem() {
    // console.log("Close:", this.usergroups);
    this.dialogRef.close(this.usergroups);
  }

  onListItemSelected(id) {
    // console.log("onListItemSelected:", id);
    if (id) {
      if (this.isInUsergroup(id)) {
        // Remove from usergroup array
        let index = this.usergroups.findIndex(
          (ug) => this.helper.getDocRefId(ug) == id
        ); //find index in your array
        this.usergroups.splice(index, 1); //remove element from array
      } else {
        const usergroupDocRef = this.helper.docRef("usergroups/" + id);
        this.usergroups.push(usergroupDocRef);
      }
    }
  }

  isInUsergroup(id: string) {
    if (this.usergroups.find((ug) => this.helper.getDocRefId(ug) == id))
      return true;
    return false;
  }
}
