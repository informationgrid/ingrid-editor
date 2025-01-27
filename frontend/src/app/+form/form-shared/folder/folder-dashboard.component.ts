/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
import { Component, effect, inject, input } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { DocumentAbstract } from "../../../store/document/document.model";
import { Router } from "@angular/router";
import { DocumentService } from "../../../services/document/document.service";
import { ConfigService } from "../../../services/config/config.service";
import { UntilDestroy } from "@ngneat/until-destroy";
import { DocEventsService } from "../../../services/event/doc-events.service";
import { TranslocoDirective } from "@ngneat/transloco";
import { ActionButtonComponent } from "../../../shared/action-button/action-button.component";
import { CardBoxComponent } from "../../../shared/card-box/card-box.component";
import { DocumentListItemComponent } from "../../../shared/document-list-item/document-list-item.component";
import { MatIcon } from "@angular/material/icon";
import { GeneralStore } from "../../../store/general.store";
import { TreeStore } from "../../../store/tree/tree.store";
import { AddressTreeStore } from "../../../store/address-tree/address-tree.store";

@UntilDestroy()
@Component({
  selector: "ige-folder-dashboard",
  templateUrl: "./folder-dashboard.component.html",
  styleUrls: ["./folder-dashboard.component.scss"],
  imports: [
    TranslocoDirective,
    ActionButtonComponent,
    CardBoxComponent,
    DocumentListItemComponent,
    MatIcon,
  ],
})
export class FolderDashboardComponent {
  private generalStore = inject(GeneralStore);
  private documentTreeStore = inject(TreeStore);
  private addressTreeStore = inject(AddressTreeStore);

  isAddress = input<boolean>();

  canCreateAddress: boolean;
  canCreateDataset: boolean;
  childDocs$ = new BehaviorSubject<DocumentAbstract[]>([]);
  numChildren: number;

  constructor(
    configService: ConfigService,
    private docEvents: DocEventsService,
    private router: Router,
    private docService: DocumentService,
  ) {
    this.canCreateAddress = configService.hasPermission("can_create_address");
    this.canCreateDataset = configService.hasPermission("can_create_dataset");

    effect(() => {
      const doc = this.generalStore.getOpenedDocument(this.isAddress());
      if (doc) this.updateChildren(doc);
    });
  }

  updateChildren(model: DocumentAbstract) {
    const store = this.isAddress()
      ? this.addressTreeStore
      : this.documentTreeStore;
    // TODO switch to user specific query

    // wait for store changes to get children of node
    const childrenFromStore = store.getChildren(model.id as number);
    if (childrenFromStore.length === 0 && model._hasChildren) {
      // load children, as they are not in store yet
      this.docService
        .getChildren(model.id as number, this.isAddress())
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
  }

  createNewFolder() {
    this.docEvents.sendEvent({ type: "CREATE_FOLDER" });
  }

  createNewDataset() {
    this.docEvents.sendEvent({ type: "NEW_DOC" });
  }

  async openDocument(uuid: string) {
    await this.router.navigate([
      ConfigService.catalogId + (this.isAddress() ? "/address" : "/form"),
      { id: uuid },
    ]);
  }
}
