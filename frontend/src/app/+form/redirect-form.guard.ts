import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { TreeQuery } from "../store/tree/tree.query";
import { AddressTreeQuery } from "../store/address-tree/address-tree.query";
import { DocumentService } from "../services/document/document.service";
import { BehaviourService } from "../services/behavior/behaviour.service";
import { ConfigService } from "../services/config/config.service";

@Injectable({
  providedIn: "root",
})
export class RedirectFormGuard {
  constructor(
    private router: Router,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    private documentService: DocumentService,
    private behaviourService: BehaviourService
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    if (state.url.indexOf(`/${ConfigService.catalogId}/form`) === 0) {
      // in case we come from a different page
      if (this.router.url.indexOf(`/${ConfigService.catalogId}/form`) !== 0) {
        this.behaviourService.registerState$.next({
          register: true,
          address: false,
        });
        if (route.params.id) {
          this.reloadDataset(route.params.id, false);
        } else {
          const previousOpenedDocId = this.getOpenedDocumentId(false);
          return await this.handleNavigation(route, previousOpenedDocId, false);
        }
      }
    } else if (state.url.indexOf(`/${ConfigService.catalogId}/address`) === 0) {
      // in case we come from a different page
      if (
        this.router.url.indexOf(`/${ConfigService.catalogId}/address`) !== 0
      ) {
        this.behaviourService.registerState$.next({
          register: true,
          address: true,
        });
        if (route.params.id) {
          this.reloadDataset(route.params.id, true);
        } else {
          const previousOpenedDocId = this.getOpenedDocumentId(true);
          return await this.handleNavigation(route, previousOpenedDocId, true);
        }
      }
    }

    return true;
  }

  private getOpenedDocumentId(forAddress: boolean): string {
    const query = forAddress ? this.addressTreeQuery : this.treeQuery;
    return query.getValue().openedDocument?._uuid;
  }

  private async handleNavigation(
    route: ActivatedRouteSnapshot,
    uuid: string,
    forAddress: boolean
  ): Promise<boolean> {
    if (uuid && route.params.id !== uuid) {
      await this.router.navigate([
        forAddress
          ? `/${ConfigService.catalogId}/address`
          : `/${ConfigService.catalogId}/form`,
        { id: uuid },
      ]);
      return false;
    }
  }

  private reloadDataset(uuid: string, forAddress: boolean) {
    this.documentService.reload$.next({
      uuid: uuid,
      forAddress: forAddress,
    });
  }
}
