import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable } from "rxjs";
import { Event } from "../models/event.model";
import { View, ViewType } from "../models/view.model";
import { EventService } from "../services/event.service";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-myviewer",
  templateUrl: "./myviewer.component.html",
  styleUrls: ["./myviewer.component.scss"],
})
export class MyviewerComponent implements OnInit {
  view: View;
  ViewType = ViewType;
  displayedColumns: string[] = ["timestamp", "value"];
  events$: Observable<Event[]>;
  aid: string;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private helper: HelperService
  ) {}

  ngOnInit(): void {
    this.view = this.route.snapshot.data["view"];
    this.aid = this.route.snapshot.paramMap.get("aid");

    // Get thee event data for the chart

    this.events$ = this.eventService.findByApplicationSensor(
      this.helper.docRef(`applications/${this.aid}`),
      this.view.sensorRef,
      20
    );
  }
}
