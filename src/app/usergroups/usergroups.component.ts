import { Component, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { Usergroup } from "../models/usergroup.model";
import { AuthService } from "../services/auth.service";
import { UsergroupService } from "../services/usergroup.service";

@Component({
  selector: "app-usergroups",
  templateUrl: "./usergroups.component.html",
  styleUrls: ["./usergroups.component.scss"],
})
export class UsergroupsComponent implements OnInit {
  usergroups$: Observable<Usergroup[]>;
  displayedColumns: string[] = ["name", "description", "id"];

  constructor(
    private usergroupService: UsergroupService,
    private auth: AuthService
  ) {}
  ngOnInit() {
    this.usergroups$ = this.usergroupService.findAll(100);
  }
}
