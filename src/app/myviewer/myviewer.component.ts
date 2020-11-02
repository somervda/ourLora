import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, Subscription } from "rxjs";
import { Event } from "../models/event.model";
import { View, ViewType } from "../models/view.model";
import { DeviceService } from "../services/device.service";
import { EventService } from "../services/event.service";
import { HelperService } from "../services/helper.service";

@Component({
  selector: "app-myviewer",
  templateUrl: "./myviewer.component.html",
  styleUrls: ["./myviewer.component.scss"],
})
export class MyviewerComponent implements OnInit, OnDestroy {
  view: View;
  devices: { id: string; name: string }[] = [];
  ViewType = ViewType;
  displayedColumns: string[] = ["timestamp", "value"];
  events$: Observable<Event[]>;
  events$$: Subscription;
  aid: string;
  devices$$: Subscription;

  chartData: { name: string; series: { value: number; name: Date }[] }[] = [];
  showChart = false;
  // chart options
  legend: boolean = true;
  showLabels: boolean = true;
  animations: boolean = true;
  xAxis: boolean = true;
  yAxis: boolean = true;

  showYAxisLabel: boolean = true;
  showXAxisLabel: boolean = true;
  xAxisLabel: string = "X axis";
  yAxisLabel: string = "y axis";
  timeline: boolean = false;
  autoScale: boolean = false;

  colorScheme = {
    domain: ["#5AA454", "#E44D25", "#CFC0BB", "#7aa3e5", "#a8385d", "#aae3f5"],
  };

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private helper: HelperService,
    private deviceService: DeviceService
  ) {}

  async ngOnInit() {
    this.view = this.route.snapshot.data["view"];
    this.aid = this.route.snapshot.paramMap.get("aid");

    // Get the event data for the chart

    this.events$ = this.eventService.findByApplicationSensor(
      this.helper.docRef(`applications/${this.aid}`),
      this.view.sensorRef,
      20
    );

    // Load up the devices array  devices associated with the application
    this.devices$$ = await this.deviceService.findAll(100).subscribe((ds) => {
      ds.forEach((d) => this.devices.push({ id: d.id, name: d.name }));
    });

    if (this.view.viewType == ViewType.line) {
      this.events$$ = await this.events$.subscribe(async (es) => {
        await es.map(async (e) => {
          const deviceName = this.devices.find((d) => d.id == e.deviceRef.id)
            ?.name;
          this.updateChartData(
            <firebase.firestore.Timestamp>e.timestamp,
            e.value,
            deviceName
          );
        });
        this.showChart = true;
      });
    }
  }

  updateChartData(
    timestamp: firebase.firestore.Timestamp,
    value: number,
    deviceName: string
  ) {
    const chartDataSeries = this.chartData.find((cd) => cd.name === deviceName);
    if (!chartDataSeries) {
      this.chartData.push({
        name: deviceName,
        series: [{ value: value, name: timestamp.toDate() }],
      });
    } else {
      // Series exists
      chartDataSeries.series.push({
        value: value,
        name: timestamp.toDate(),
      });
    }
  }

  ngOnDestroy() {
    if (this.events$$) {
      this.events$$.unsubscribe();
    }
  }
}
