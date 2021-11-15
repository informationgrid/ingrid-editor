import { Component, OnChanges } from "@angular/core";
import { Observable } from "rxjs";
import { FormToolbarService } from "../../+form/form-shared/toolbar/form-toolbar.service";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import { Router } from "@angular/router";
import { DocumentService } from "../../services/document/document.service";
import { DocumentAbstract } from "../../store/document/document.model";
import { ConfigService } from "../../services/config/config.service";

@Component({
  selector: "ige-address-dashboard",
  templateUrl: "./address-dashboard.component.html",
  styleUrls: ["./address-dashboard.component.scss"],
})
export class AddressDashboardComponent implements OnChanges {
  childDocs$: Observable<DocumentAbstract[]>;
  canCreateAddress: boolean;
  canImport: boolean;

  constructor(
    configService: ConfigService,
    private treeQuery: AddressTreeQuery,
    private formToolbarService: FormToolbarService,
    private router: Router,
    private docService: DocumentService
  ) {
    this.childDocs$ = this.docService.findRecentAddresses();
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canImport = configService.hasPermission("can_import");
  }

  ngOnChanges() {
    // TODO switch to user specific query
    this.childDocs$.subscribe().unsubscribe();
  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next("CREATE_FOLDER");
  }

  createNewAddress() {
    this.formToolbarService.toolbarEvent$.next("NEW_DOC");
  }

  openDocument(id: number | string) {
    this.router.navigate(["/address", { id: id }]);
  }
}
