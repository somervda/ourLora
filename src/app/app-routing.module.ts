import { DevicetypeResolver } from "./services/devicetype-resolver";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { HomeComponent } from "./home/home.component";
import { NotfoundComponent } from "./notfound/notfound.component";
import { AboutComponent } from "./about/about.component";
import { LoginComponent } from "./login/login.component";
import { UsersComponent } from "./users/users.component";
import { UserComponent } from "./user/user.component";
import { UserResolver } from "./services/user-resolver";
import { NotauthorizedComponent } from "./notauthorized/notauthorized.component";
import { UsergroupsComponent } from "./usergroups/usergroups.component";
import { permissionGuard } from "./guards/permission.guard";
import { UsergroupComponent } from "./usergroup/usergroup.component";
import { UsergroupResolver } from "./services/usergroup-resolver";
import { DevicetypesComponent } from "./devicetypes/devicetypes.component";
import { DevicetypeComponent } from "./devicetype/devicetype.component";

const routes: Routes = [
  { path: "", component: HomeComponent },
  { path: "about", component: AboutComponent },
  { path: "login", component: LoginComponent },
  { path: "notAuthorized", component: NotauthorizedComponent },
  //  Devicetypes
  {
    path: "devicetypes",
    component: DevicetypesComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "devicetype/create",
    component: DevicetypeComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "devicetype/delete/:id",
    component: DevicetypeComponent,
    resolve: { devicetype: DevicetypeResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "devicetype/:id",
    component: DevicetypeComponent,
    resolve: { devicetype: DevicetypeResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  //  Users
  {
    path: "users",
    component: UsersComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "user/:uid",
    component: UserComponent,
    resolve: { user: UserResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "myprofile/:uid",
    component: UserComponent,
    resolve: { user: UserResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isActivated"] },
    runGuardsAndResolvers: "always",
  },
  //  Usersgroups
  {
    path: "usergroups",
    component: UsergroupsComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "usergroup/create",
    component: UsergroupComponent,
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
  },
  {
    path: "usergroup/delete/:id",
    component: UsergroupComponent,
    resolve: { usergroup: UsergroupResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  {
    path: "usergroup/:id",
    component: UsergroupComponent,
    resolve: { usergroup: UsergroupResolver },
    canActivate: [permissionGuard],
    data: { permissions: ["isAdmin"] },
    runGuardsAndResolvers: "always",
  },
  //  Other
  { path: "notfound", component: NotfoundComponent },
  { path: "**", component: NotfoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: "reload" })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
