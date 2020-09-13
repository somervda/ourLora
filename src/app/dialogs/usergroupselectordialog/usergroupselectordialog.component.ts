import { Component, OnInit, Inject } from "@angular/core";
import { Usergroup } from "../../models/usergroup.model";
import { Observable } from "rxjs";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CategoryService } from "../../services/category.service";
import { map } from "rxjs/operators";
import { UsergroupService } from "src/app/services/usergroup.service";

@Component({
  selector: "app-usergroupselectordialog",
  templateUrl: "./usergroupselectordialog.component.html",
  styleUrls: ["./usergroupselectordialog.component.scss"],
})
export class UsergroupselectordialogComponent implements OnInit {
  usergroup: Usergroup;
  usergroups$: Observable<Usergroup[]>;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usergroupService: UsergroupService,
    private dialogRef: MatDialogRef<UsergroupselectordialogComponent>
  ) {}

  ngOnInit(): void {
    const idHide = this.data["id"];
    this.usergroups$ = this.usergroupService
      .findByPartialName("")
      .pipe(map((usergroups) => usergroups.filter((u) => u.id != idHide)));
  }

  returnItem() {
    this.dialogRef.close(this.usergroup);
  }

  onListItemSelected(id) {
    console.log("onListItemSelected:", id);
    this.usergroupService
      .findById(id)
      .toPromise()
      .then((usergroup) => {
        console.log("set usergroup:", usergroup);
        this.usergroup = usergroup;
      })
      .catch((e) => console.error("error:", e));
  }

  onKey(event: any) {
    console.log("searchName", event.target.value);
    this.usergroups$ = this.usergroupService.findByPartialName(
      event.target.value
    );
  }
}
