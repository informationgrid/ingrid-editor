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
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TreeStore } from "../../store/tree/tree.store";
import { BehaviorSubject, Subject } from "rxjs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { TreeAction } from "./tree/tree.types";
import { FormStateService } from "../form-state.service";
import { TreeQuery } from "../../store/tree/tree.query";
import { AddressTreeQuery } from "../../store/address-tree/address-tree.query";
import { filter, take } from "rxjs/operators";
import { ConfigService } from "../../services/config/config.service";

@UntilDestroy()
@Component({
  selector: "ige-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  @Input() address = false;

  @Output() dropped = new EventEmitter();

  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new BehaviorSubject<number>(null);

  private treeStore: AddressTreeStore | TreeStore;
  private treeQuery: AddressTreeQuery | TreeQuery;
  private path: "/form" | "/address";

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formStateService: FormStateService,
    private addressTreeStore: AddressTreeStore,
    private docTreeStore: TreeStore,
    private docTreeQuery: TreeQuery,
    private addressTreeQuery: AddressTreeQuery,
  ) {}

  ngOnInit() {
    if (this.address) {
      this.treeStore = this.addressTreeStore;
      this.treeQuery = this.addressTreeQuery;
      this.path = "/address";
    } else {
      this.treeStore = this.docTreeStore;
      this.treeQuery = this.docTreeQuery;
      this.path = "/form";
    }

    this.setInitialTreeNode();

    this.handleExplicitlySetNodes();

    // TODO: sure? Improve performance by keeping store! Make it more intelligent
    //       to avoid node creation from dashboard conflict
    this.clearTreeStore();
  }

  private setInitialTreeNode() {
    const id = this.route.snapshot.params.id;

    // since we need to set with id instead of uuid, we need to wait for the document to be loaded,
    // before the tree can be expanded
    if (id) {
      this.treeQuery.openedDocument$
        .pipe(
          filter((doc) => doc !== null),
          take(1),
        )
        .subscribe((doc) => this.activeTreeNode.next(<number>doc.id));
    }
  }

  async handleLoad(selectedDocUuids: string[]) {
    // id: string, profile?: string, forceLoad?: boolean) {

    // when multiple nodes were selected then do not show any form
    if (selectedDocUuids.length !== 1) {
      return;
    }

    let form = this.formStateService.getForm()?.value;
    const currentId = form?._id;
    const currentUuid = form?._uuid;

    // do not load same node again
    if (
      currentUuid === selectedDocUuids[0] &&
      this.router.url.indexOf(currentUuid) !== -1
    ) {
      return;
    }

    // reset scroll position when loading a new document
    this.treeStore.update({ scrollPosition: 0 });

    const navigated = await this.router.navigate([
      ConfigService.catalogId + this.path,
      { id: selectedDocUuids[0] },
    ]);
    if (!navigated) this.activeTreeNode.next(currentId);
  }

  handleSelection(selectedDocsId: string[]) {
    this.treeStore.setActive(selectedDocsId);
  }

  updateTreeMode(multiSelect: boolean) {
    this.treeStore.update({
      multiSelectMode: multiSelect,
    });
  }

  // make sure to reload tree instead of using cached nodes
  // otherwise adding new node from dashboard would lead to an error
  private clearTreeStore() {
    this.treeStore.set([]);
  }

  private handleExplicitlySetNodes() {
    this.treeQuery.explicitActiveNode$.subscribe((node) => {
      this.activeTreeNode.next(node?.id ?? null);
    });
  }
}
