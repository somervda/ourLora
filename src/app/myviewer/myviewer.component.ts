import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subscription } from "rxjs";
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

  // Google charts definition
  gctype = "";
  // gcdata = [
  //   [8, 12],
  //   [4, 5.5],
  //   [11, 14],
  //   [4, 5],
  //   [3, 3.5],
  //   [6.5, 7],
  // ];
  gccolumns: string[] = [];
  gcoptions = {};
  gcData = [];

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

    // Build chart data
    let rawData: { timestamp: Date; deviceName: string; value: number }[] = [];
    let series: string[] = [];
    this.events$$ = await this.events$.subscribe(async (es) => {
      await es.map(async (e) => {
        console.log("1");
        const deviceName = this.devices.find((d) => d.id == e.deviceRef.id)
          ?.name;
        if (!series.includes(deviceName)) {
          series.push(deviceName);
        }
        switch (this.view.viewType) {
          case ViewType.scatter: {
            this.gctype = "ScatterChart";
            break;
          }

          case ViewType.line: {
            this.gctype = "LineChart";
            break;
          }
          case ViewType.table: {
            this.gctype = "Table";

            break;
          }
        }
        rawData.push({
          timestamp: (<firebase.firestore.Timestamp>e.timestamp).toDate(),
          deviceName: deviceName,
          value: e.value,
        });
      });
      this.buildChartData(series, rawData);

      console.log("2");
      this.showChart = true;
    });
  }

  buildChartData(
    series: string[],
    rawData: { timestamp: Date; deviceName: string; value: number }[]
  ) {
    console.log("*** buildChartData series:", series, " rawData:", rawData);
    rawData.sort((a, b) => a.deviceName.localeCompare(b.deviceName));
    // Create the chartColumns and chartData arrays
    this.gccolumns.push("Date");
    series.forEach((s) => {
      // For each series add a column name and any data for the series
      // missing column data is represented by a null
      this.gccolumns.push(s);
    });
    rawData.forEach((d) => {
      console.log("Next Row");
      let row: any[] = [];
      row.push(d.timestamp);
      series.forEach((s1) => {
        console.log("s1:", s1, " d.deviceName:", d.deviceName);
        if (s1 == d.deviceName) {
          row.push(d.value);
        } else {
          row.push(null);
        }
      });
      console.log("row:", row);
      this.gcData.push(row);
    });
    console.log("buildChartData:", this.gcData, " gccolumns:", this.gccolumns);
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
