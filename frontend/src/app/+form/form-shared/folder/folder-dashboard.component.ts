/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { Component, Input } from "@angular/core";
import { TreeQuery } from "../../../store/tree/tree.query";
import { BehaviorSubject } from "rxjs";
import { DocumentAbstract } from "../../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { AddressTreeQuery } from "../../../store/address-tree/address-tree.query";
import { ConfigService } from "../../../services/config/config.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DocEventsService } from "../../../services/event/doc-events.service";

@UntilDestroy()
@Component({
  selector: "ige-folder-dashboard",
  templateUrl: "./folder-dashboard.component.html",
  styleUrls: ["./folder-dashboard.component.scss"],
})
export class FolderDashboardComponent {
  query: TreeQuery | AddressTreeQuery;

  @Input() set isAddress(value: boolean) {
    this.query = value ? this.addressTreeQuery : this.treeQuery;
    this.query.openedDocument$.pipe(untilDestroyed(this)).subscribe((doc) => {
      if (doc) this.updateChildren(doc);
    });
    this._isAddress = value;
  }

  get isAddress() {
    return this._isAddress;
  }

  private _isAddress: boolean;
  canCreateAddress: boolean;
  canCreateDataset: boolean;
  childDocs$ = new BehaviorSubject<DocumentAbstract[]>([]);
  numChildren: number;

  constructor(
    private treeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
    configService: ConfigService,
    private docEvents: DocEventsService,
    private router: Router,
    private docService: DocumentService,
  ) {
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canCreateDataset = configService.hasPermission("can_create_dataset");
  }

  updateChildren(model: DocumentAbstract) {
    const query = this.isAddress ? this.addressTreeQuery : this.treeQuery;
    // TODO switch to user specific query

    // wait for store changes to get children of node
    query
      .selectAll()
      .pipe(untilDestroyed(this))
      .subscribe(() => {
        const childrenFromStore = query.getChildren(model.id as number);
        if (childrenFromStore.length === 0 && model._hasChildren) {
          // load children, as they are not in store yet
          this.docService
            .getChildren(model.id as number, this.isAddress)
            .subscribe();
        }
        this.numChildren = childrenFromStore.length;
        const latestChildren = childrenFromStore
          .sort(
            (c1, c2) =>
              new Date(c2._contentModified).getTime() -
              new Date(c1._contentModified).getTime(),
          )
          .slice(0, 5);
        this.childDocs$.next(latestChildren);
      });
  }

  createNewFolder() {
    this.docEvents.sendEvent({ type: "CREATE_FOLDER" });
  }

  createNewDataset() {
    this.docEvents.sendEvent({ type: "NEW_DOC" });
  }

  async openDocument(uuid: string) {
    await this.router.navigate([
      ConfigService.catalogId + (this.isAddress ? "/address" : "/form"),
      { id: uuid },
    ]);
  }
}
