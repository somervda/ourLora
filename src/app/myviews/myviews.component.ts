import { Component, OnDestroy, OnInit } from "@angular/core";
import { Application } from "../models/application.model";
import { Observable, Subscription } from "rxjs";
import { ApplicationService } from "../services/application.service";
import { AuthService } from "../services/auth.service";
import { ViewService } from "../services/view.service";
import { View } from "../models/view.model";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

@Component({
  selector: "app-myviews",
  templateUrl: "./myviews.component.html",
  styleUrls: ["./myviews.component.scss"],
})
export class MyviewsComponent implements OnInit, OnDestroy {
  applications$: Observable<Application[]>;
  views$$: Subscription;
  appViewTree: {
    appId: string;
    appName: string;
    viewId?: string;
    viewName?: string;
    viewDescription?: string;
  }[] = [];

  constructor(
    private applicationService: ApplicationService,
    private auth: AuthService,
    private viewService: ViewService
  ) {}

  async ngOnInit() {
    // Make sure I have the current user before loading the user's applications
    // The component is likely to be reloaded in browser so
    // need to cover this special case where the user observable
    // can have a delay being reloaded
    const sleep = (m) => new Promise((r) => setTimeout(r, m));
    while (!this.auth.currentUser) {
      await sleep(50);
    }

    this.applications$ = this.applicationService.findByUid(
      this.auth.currentUser.uid,
      100
    );

    this.applications$.subscribe((applications) => {
      applications.map((application) => {
        this.views$$ = this.viewService
          .findAll(application.id, 100)
          .subscribe((views) => {
            if (views.length > 0) {
              this.appViewTree.push({
                appId: application.id,
                appName: application.name,
              });
            }
            views.map((view) => {
              this.appViewTree.push({
                appId: application.id,
                appName: application.name,
                viewId: view.id,
                viewName: view.name,
                viewDescription: view.description,
              });
            });
          });
      });
    });
  }

  getViews(aid: string): Observable<View[]> {
    console.log("getView:", aid);
    return this.viewService.findAll(aid, 100);
  }

  ngOnDestroy() {
    if (this.views$$) this.views$$.unsubscribe();
  }
}