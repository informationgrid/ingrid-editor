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
  constructor(private router: Router, private sessionQuery: SessionQuery) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const tabIdentifier = route.data.tabIdentifier;
    const tab = this.sessionQuery.getValue().ui.currentTab[tabIdentifier];
    if (tab !== null && tab !== 0) {
      const mainPath = route.pathFromRoot.find(
        (item) => item.routeConfig !== null
      ).routeConfig.path;
      const tabs = this.getRoutePaths(route);
      this.router.navigate([`/${mainPath}/${tabs[tab]}`], {});
    }
    return true;
  }

  private getRoutePaths(route: ActivatedRouteSnapshot) {
    return route.parent.routeConfig.children
      .filter((item) => item.path)
      .map((item) => item.path);
  }
}
