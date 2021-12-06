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
import { DocumentService } from "../services/document/document.service";

@Injectable({
  providedIn: "root",
})
export class RedirectFormGuard implements CanActivate {
  constructor(
    private router: Router,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private documentService: DocumentService
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
      const previousOpenedDocId = this.getOpenedDocumentId(false);
      return this.handleNavigation(route, previousOpenedDocId, false);
    } else if (state.url === "/address") {
      const previousOpenedDocId = this.getOpenedDocumentId(true);
      return this.handleNavigation(route, previousOpenedDocId, true);
    }

    return true;
  }

  private getOpenedDocumentId(forAddress: boolean): string {
    const query = forAddress ? this.addressTreeQuery : this.treeQuery;
    return query.getValue().openedDocument?._uuid;
  }

  private handleNavigation(
    route: ActivatedRouteSnapshot,
    uuid: string,
    forAddress: boolean
  ): boolean {
    if (route.params.id !== uuid) {
      this.router.navigate([forAddress ? "/address" : "/form", { id: uuid }]);
      this.documentService.reload$.next({
        id: uuid,
        forAddress: forAddress,
      });
      return false;
    }
  }
}
