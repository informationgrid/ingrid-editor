import { Component, Input, OnInit } from "@angular/core";
import { Observable } from "rxjs";
import { FormToolbarService } from "../form-shared/toolbar/form-toolbar.service";
import { DocumentAbstract } from "../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../services/document/document.service";
import { SessionQuery } from "../../store/session.query";
import { ConfigService } from "../../services/config/config.service";
import { TreeQuery } from "../../store/tree/tree.query";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { filter } from "rxjs/operators";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";

@UntilDestroy()
@Component({
  selector: "ige-form-dashboard",
  templateUrl: "./form-dashboard.component.html",
  styleUrls: ["./form-dashboard.component.scss"],
})
export class FormDashboardComponent implements OnInit {
  @Input() address = false;

  childDocs$: Observable<DocumentAbstract[]>;
  canCreateDatasets: boolean;
  canCreateAddress: boolean;
  canImport: boolean;

  constructor(
    configService: ConfigService,
    private formToolbarService: FormToolbarService,
    private router: Router,
    private sessionQuery: SessionQuery,
    private docService: DocumentService,
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
  ) {
    // TODO switch to user specific query
    this.canCreateDatasets = configService.hasPermission("can_create_dataset");
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canImport = configService.hasPermission("can_import");
  }

  ngOnInit(): void {
    const query = this.address ? this.addressTreeQuery : this.treeQuery;
    this.childDocs$ = this.address
      ? this.sessionQuery.latestAddresses$
      : this.sessionQuery.latestDocuments$;

    query.openedDocument$
      .pipe(
        untilDestroyed(this),
        filter((doc) => doc === null),
      )
      .subscribe(() => {
        this.address
          ? this.docService.findRecentAddresses()
          : this.docService.findRecent();
      });
  }

  openDocument(uuid: string) {
    const target =
      ConfigService.catalogId + (this.address ? "/address" : "/form");
    this.router.navigate([target, { id: uuid }]);
  }
}
