import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { SessionQuery } from "../store/session.query";

@Injectable({
  providedIn: "root",
})
export class TabGuard implements CanActivate {
  tabs = ["user", "group"];

  constructor(private router: Router, private sessionQuery: SessionQuery) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const tab = this.sessionQuery.getValue().ui.currentTab.manage;
    if (tab !== null && tab !== 0) {
      this.router.navigate(["/manage/" + this.tabs[tab]], {});
    }
    return true;
  }
}
