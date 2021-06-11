import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { TreeStore } from "../../store/tree/tree.store";
import { BehaviorSubject, Subject } from "rxjs";
import { UntilDestroy } from "@ngneat/until-destroy";
import { AddressTreeStore } from "../../store/address-tree/address-tree.store";
import { FormUtils } from "../form.utils";
import { MatDialog } from "@angular/material/dialog";
import { DocumentService } from "../../services/document/document.service";
import { TreeService } from "./tree/tree.service";
import { ShortTreeNode, TreeAction } from "./tree/tree.types";
import { FormStateService } from "../form-state.service";

@UntilDestroy()
@Component({
  selector: "ige-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit {
  @Input() address = false;
  @Input() activeId: Subject<string>;

  @Output() dropped = new EventEmitter();

  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new BehaviorSubject<string>(null);

  treeStore: AddressTreeStore | TreeStore;
  private path: "/form" | "/address";
  private formType: "document" | "address";

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private documentService: DocumentService,
    private formStateService: FormStateService,
    private addressTreeStore: AddressTreeStore,
    private treeService: TreeService,
    private docTreeStore: TreeStore
  ) {}

  ngOnInit() {
    if (this.address) {
      this.treeStore = this.addressTreeStore;
      this.path = "/address";
      this.formType = "address";
    } else {
      this.treeStore = this.docTreeStore;
      this.path = "/form";
      this.formType = "document";
    }

    // TODO: sure? Improve performance by keeping store! Make it more intelligent
    //       to avoid node creation from dashboard conflict
    this.clearTreeStore();

    this.activeId?.subscribe((id) => {
      this.activeTreeNode.next(id);

      if (id === null) {
        this.storePathTitles([]);
      }
    });
  }

  async handleLoad(selectedDocIds: string[]) {
    // id: string, profile?: string, forceLoad?: boolean) {

    // when multiple nodes were selected then do not show any form
    if (selectedDocIds.length !== 1) {
      return;
    }

    const currentId = this.formStateService.getForm()?.value?._id;

    // do not load same node again
    if (
      currentId === selectedDocIds[0] &&
      this.router.url.indexOf(currentId) !== -1
    ) {
      return;
    }

    // reset scroll position when loading a new document
    this.treeStore.update({ scrollPosition: 0 });

    const handled = await FormUtils.handleDirtyForm(
      this.formStateService.getForm(),
      this.documentService,
      this.dialog,
      this.address
    );

    if (handled) {
      this.router.navigate([this.path, { id: selectedDocIds[0] }]);
    } else {
      this.treeService.selectTreeNode(this.address, currentId);
    }
  }

  handleSelection(selectedDocsId: string[]) {
    this.treeStore.setActive(selectedDocsId);
  }

  storePathTitles(path: ShortTreeNode[]) {
    this.treeStore.update({
      activePathTitles: path,
    });
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
}
