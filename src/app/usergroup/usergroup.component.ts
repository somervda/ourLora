import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Crud } from "../models/helper.model";
import { Usergroup } from "../models/usergroup.model";
import { HelperService } from "../services/helper.service";
import { UsergroupService } from "../services/usergroup.service";

@Component({
  selector: "app-usergroup",
  templateUrl: "./usergroup.component.html",
  styleUrls: ["./usergroup.component.scss"],
})
export class UsergroupComponent implements OnInit, OnDestroy {
  usergroup: Usergroup;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  usergroupForm: FormGroup;
  usergroupSubscription$$: Subscription;

  constructor(
    private usergroupService: UsergroupService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService
  ) {}

  ngOnInit() {
    // console.log(
    //   "this.route.snapshot.paramMap.get('id')",
    //   this.route.snapshot.paramMap.get("id")
    // );
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "usergroup/delete/:id")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "usergroup/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.usergroup = {
        name: "",
        description: "",
      };
    } else {
      this.usergroup = this.route.snapshot.data["usergroup"];
      this.usergroupSubscription$$ = this.usergroupService
        .findById(this.usergroup.id)
        .subscribe((usergroup) => {
          this.usergroup = usergroup;
          this.usergroupForm.patchValue(this.usergroup);
        });
    }

    // Create form group and initialize with probe values
    this.usergroupForm = this.fb.group({
      name: [
        this.usergroup.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.usergroup.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.usergroupForm.controls) {
        this.usergroupForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    // console.log("create probe", this.probe);
    for (const field in this.usergroupForm.controls) {
      this.usergroup[field] = this.usergroupForm.get(field).value;
    }

    this.usergroupService
      .create(this.usergroup)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.usergroup.id = newDoc.id;
        this.helper.snackbar(
          "Usergroup '" + this.usergroup.name + "' created.",
          2000
        );
        this.helper.redirect("/usergroup/" + this.usergroup.id);
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.usergroup.name, error);
      });
  }

  onDelete() {
    // console.log("delete", this.probe.id);
    const teamId = this.usergroup.id;
    const name = this.usergroup.name;
    this.usergroupService
      .delete(this.usergroup.id)
      .then(() => {
        this.helper.snackbar("User Group '" + name + "' deleted!", 2000);
        this.helper.redirect("/usergroups");
      })
      .catch(function (error) {
        console.error("Error deleting user group: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.usergroupForm.get(fieldName).valid &&
      this.usergroup.id != "" &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.usergroupForm.get(fieldName).value;
      this.usergroupService.fieldUpdate(this.usergroup.id, fieldName, newValue);
    }
  }

  ngOnDestroy() {
    if (this.usergroupSubscription$$)
      this.usergroupSubscription$$.unsubscribe();
  }
}
