import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { Application } from "../models/application.model";
import { Crud } from "../models/helper.model";
import { Trigger } from "../models/trigger.model";
import { ApplicationService } from "../services/application.service";
import { HelperService } from "../services/helper.service";
import { TriggerService } from "../services/trigger.service";

@Component({
  selector: "app-trigger",
  templateUrl: "./trigger.component.html",
  styleUrls: ["./trigger.component.scss"],
})
export class TriggerComponent implements OnInit, OnDestroy {
  trigger: Trigger;
  aid: string;
  application$: Observable<Application>;
  crudAction: Crud;
  // Declare an instance of crud enum to use for checking crudAction value
  Crud = Crud;

  triggerForm: FormGroup;
  triggerSubscription$$: Subscription;

  constructor(
    private triggerService: TriggerService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private applicationService: ApplicationService
  ) {}

  ngOnInit() {
    console.log(
      "trigger init :",
      this.route.snapshot.paramMap.get("aid"),
      this.route.snapshot.paramMap.get("tid")
    );
    this.aid = this.route.snapshot.paramMap.get("aid");
    this.application$ = this.applicationService.findById(this.aid);
    this.crudAction = Crud.Update;
    if (this.route.routeConfig.path == "application/:aid/trigger/:tid/delete")
      this.crudAction = Crud.Delete;
    if (this.route.routeConfig.path == "application/:aid/trigger/create")
      this.crudAction = Crud.Create;

    if (this.crudAction == Crud.Create) {
      this.trigger = {
        name: "",
        description: "",
        active: null,
        sensorRef: null,
        triggerAction: null,
        targetRef: null,
        triggerRange: null,
        message: null,
      };
    } else {
      this.trigger = this.route.snapshot.data["trigger"];
      this.triggerSubscription$$ = this.triggerService
        .findById(this.aid, this.trigger.id)
        .subscribe((trigger) => {
          this.trigger = trigger;
          this.triggerForm.patchValue(this.trigger);
        });
    }

    // Create form group and initialize with probe values
    this.triggerForm = this.fb.group({
      name: [
        this.trigger.name,
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(35),
        ],
      ],
      description: [
        this.trigger.description,
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(500),
        ],
      ],
    });

    // Mark all fields as touched to trigger validation on initial entry to the fields
    if (this.crudAction != Crud.Create) {
      for (const field in this.triggerForm.controls) {
        this.triggerForm.get(field).markAsTouched();
      }
    }
  }

  onCreate() {
    console.log("create trigger", this.aid, this.trigger);
    for (const field in this.triggerForm.controls) {
      this.trigger[field] = this.triggerForm.get(field).value;
    }
    this.triggerService
      .create(this.aid, this.trigger)
      .then((newDoc) => {
        this.crudAction = Crud.Update;
        this.trigger.id = newDoc.id;
        this.helper.snackbar(
          "Trigger '" + this.trigger.name + "' created.",
          2000
        );
        this.helper.redirect(
          "/application/" + this.aid + "/trigger/" + this.trigger.id
        );
      })
      .catch(function (error) {
        console.error("Error adding document: ", this.trigger.name, error);
      });
  }

  onDelete() {
    console.log("delete", this.aid, this.trigger.id);
    const name = this.trigger.name;
    this.triggerService
      .delete(this.aid, this.trigger.id)
      .then(() => {
        this.helper.snackbar("Trigger '" + name + "' deleted!", 2000);
        this.helper.redirect("/application/" + this.aid);
      })
      .catch(function (error) {
        console.error("Error deleting trigger: ", error);
      });
  }

  onFieldUpdate(fieldName: string, toType?: string) {
    if (
      this.triggerForm.get(fieldName).valid &&
      this.trigger.id != "" &&
      this.aid &&
      this.crudAction != Crud.Delete
    ) {
      let newValue = this.triggerForm.get(fieldName).value;
      this.triggerService.fieldUpdate(
        this.aid,
        this.trigger.id,
        fieldName,
        newValue
      );
    }
  }

  ngOnDestroy() {
    if (this.triggerSubscription$$) this.triggerSubscription$$.unsubscribe();
  }
}
