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
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DocumentTreeStore } from "../../store/tree/document-tree.store";
import { BehaviorSubject, Subject } from "rxjs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { TreeAction } from "./tree/tree.types";
import { FormStateService } from "../form-state.service";
import { ConfigService } from "../../services/config/config.service";
import { TreeComponent } from "./tree/tree.component";
import { GeneralStore } from "../../store/general.store";
import { DocumentAbstract } from "../../store/document/document.model";
import { UiStore } from "../../store/ui.store";

@UntilDestroy()
@Component({
  selector: "ige-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
  imports: [TreeComponent],
})
export class SidebarComponent implements OnInit {
  @Input() address = false;

  @Output() dropped = new EventEmitter();

  documentTreeStore = inject(DocumentTreeStore);
  addressTreeStore = inject(AddressTreeStore);
  private generalStore = inject(GeneralStore);
  private uiStore = inject(UiStore);

  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new BehaviorSubject<number>(null);

  private path: "/form" | "/address";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formStateService: FormStateService,
  ) {
    effect(() => {
      const active = this.address
        ? this.generalStore.explicitActiveNodeAddress()
        : this.generalStore.explicitActiveNode();
      this.activeTreeNode.next(active?.id ?? null);
    });
  }

  ngOnInit() {
    if (this.address) {
      this.path = "/address";
    } else {
      this.path = "/form";
    }

    this.setInitialTreeNode();

    // TODO: sure? Improve performance by keeping store! Make it more intelligent
    //       to avoid node creation from dashboard conflict
    this.clearTreeStore();
  }

  private setInitialTreeNode() {
    const id = this.route.snapshot.params.id;

    // since we need to set with id instead of uuid, we need to wait for the document to be loaded,
    // before the tree can be expanded
    if (id) {
      const doc = this.getOpenedDocument();
      if (doc !== null) {
        this.activeTreeNode.next(<number>doc.id);
      }
    }
  }

  async handleLoad(selectedDocUuids: string[]) {
    // id: string, profile?: string, forceLoad?: boolean) {

    // when multiple nodes were selected then do not show any form
    if (selectedDocUuids.length !== 1) {
      return;
    }

    let metadata = this.formStateService.metadata();
    const currentId = metadata?.wrapperId;
    const currentUuid = metadata?.uuid;

    // do not load same node again
    if (
      currentUuid === selectedDocUuids[0] &&
      this.router.url.indexOf(currentUuid) !== -1
    ) {
      return;
    }

    // reset scroll position when loading a new document
    this.uiStore.setScrollPosition(0);

    const navigated = await this.router.navigate([
      ConfigService.catalogId + this.path,
      { id: selectedDocUuids[0] },
    ]);
    if (!navigated) {
      // active node state is only updated when value has changed
      // that's why we need to set two values delayed
      this.activeTreeNode.next(null);
      setTimeout(() => this.activeTreeNode.next(currentId), 100);
    }
  }

  handleSelection(selectedDocsId: number[]) {
    this.generalStore.setActiveTreeNodes(selectedDocsId, this.address);
  }

  updateTreeMode(multiSelect: boolean) {
    this.uiStore.setTreeMultiSelectMode(multiSelect);
  }

  // make sure to reload tree instead of using cached nodes
  // otherwise adding new node from dashboard would lead to an error
  private clearTreeStore() {
    this.getTreeStore().set([]);
  }

  private getTreeStore() {
    return this.address ? this.addressTreeStore : this.documentTreeStore;
  }

  private getOpenedDocument(): DocumentAbstract {
    return this.address
      ? this.generalStore.openedAddress()
      : this.generalStore.openedDocument();
  }
}
