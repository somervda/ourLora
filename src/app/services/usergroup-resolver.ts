import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from "@angular/router";
import { UsergroupService } from "./usergroup.service";
import { Usergroup } from "../models/usergroup.model";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class UsergroupResolver implements Resolve<Usergroup> {
  constructor(private usergroupservice: UsergroupService) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Usergroup> {
    const id = route.paramMap.get("id");
    return this.usergroupservice.findById(id).pipe(first());
  }
}
