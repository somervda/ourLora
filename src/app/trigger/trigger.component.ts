import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { DocumentReference } from "@google-cloud/firestore";
import { Device } from "functions/src/models/device.model";
import { Devicetype } from "functions/src/models/devicetype.model";
import { Sensor } from "functions/src/models/sensor.model";
import { Observable, Subscription } from "rxjs";
import { Application } from "../models/application.model";
import { Crud } from "../models/helper.model";
import { Trigger, TriggerActionInfo } from "../models/trigger.model";
import { ApplicationService } from "../services/application.service";
import { DeviceService } from "../services/device.service";
import { DevicetypeService } from "../services/devicetype.service";
import { HelperService } from "../services/helper.service";
import { SensorService } from "../services/sensor.service";
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
  TriggerActionInfo = TriggerActionInfo;

  // sensors processing
  application$$: Subscription;
  devices$: Observable<Device[]>;
  devices$$: Subscription;
  devicetypes$: Observable<Devicetype[]>;
  sensors$$: Subscription;
  sensors: Sensor[];

  constructor(
    private triggerService: TriggerService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private helper: HelperService,
    private applicationService: ApplicationService,
    private deviceService: DeviceService,
    private devicetypeService: DevicetypeService,
    private sensorService: SensorService
  ) {}

  ngOnInit() {
    console.log(
      "trigger init :",
      this.route.snapshot.paramMap.get("aid"),
      this.route.snapshot.paramMap.get("tid")
    );
    this.sensors = [];
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

    this.getSensors();

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
      triggerAction: [this.trigger.triggerAction, [Validators.required]],
      active: [this.trigger.active],
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
      if (toType && toType == "Toggle") {
        newValue = !newValue;
      }

      console.log("update:", fieldName, newValue);
      this.triggerService.fieldUpdate(
        this.aid,
        this.trigger.id,
        fieldName,
        newValue
      );
    }
  }

  getSensors() {
    // Get all the unique sensorRefs for the application
    console.log("getSensors - aid:", this.aid);
    this.application$$ = this.application$.subscribe((a) => {
      let deviceRefs = a.deviceRefs;
      deviceRefs.forEach((dr) => {
        console.log("deviceRefs:", dr);
        dr.get()
          .then((d) => {
            console.log("device:", d.data());
            // get devicetype
            if (d.exists) {
              const devicetypeRef = <DocumentReference>d.data()?.deviceTypeRef;
              devicetypeRef
                .get()
                .then((dt) => {
                  // Resolved devicetype
                  console.log("devicetype:", dt.data());
                })
                .catch();
              // Get sensors
              this.sensors$$ = this.sensorService
                .findAll(devicetypeRef.id, 100)
                .subscribe((s) => {
                  console.log("s:", s);
                  s.forEach((sensor) => this.sensors.push(sensor));
                });
            }
          })
          .catch();
      });
    });
  }

  ngOnDestroy() {
    if (this.triggerSubscription$$) this.triggerSubscription$$.unsubscribe();
  }
}
