import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from "@angular/router";
import { TreeQuery } from "../store/tree/tree.query";
import { AddressTreeQuery } from "../store/address-tree/address-tree.query";

@Injectable({
  providedIn: "root",
})
export class RedirectFormGuard implements CanActivate {
  constructor(
    private router: Router,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (state.url === "/form") {
      const previousOpenedDoc = this.treeQuery.getValue().openedDocument;
      if (previousOpenedDoc && route.params.id !== previousOpenedDoc.id) {
        this.router.navigate([
          "/form",
          { id: previousOpenedDoc.id.toString() },
        ]);
        return false;
      }
    } else if (state.url === "/address") {
      const previousOpenedDoc = this.addressTreeQuery.getValue().openedDocument;
      if (previousOpenedDoc && route.params.id !== previousOpenedDoc.id) {
        this.router.navigate([
          "/address",
          { id: previousOpenedDoc.id.toString() },
        ]);
        return false;
      }
    }

    return true;
  }
}
