import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { ModalService } from "../services/modal/modal.service";
import { ConfigService } from "../services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private modalService: ModalService,
    private configService: ConfigService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const user = this.configService.$userInfo.getValue();
    const path = state.url;

    if (
      user.assignedCatalogs.length === 0 &&
      state.url.indexOf("/catalogs/manage") === -1
    ) {
      this.router.navigate(["/settings/catalog"]);
      return false;
    }

    let neededPermission = route.data.permission;
    return this.configService.hasPermission(neededPermission);
  }

  private containsValidPage(validPages: string[], page: string) {
    return (
      validPages.length === 0 ||
      validPages.some((validPage) => validPage.indexOf(page) !== -1)
    );
  }
}
