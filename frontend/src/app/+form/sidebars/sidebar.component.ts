import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Router} from '@angular/router';
import {TreeStore} from '../../store/tree/tree.store';
import {BehaviorSubject, Subject} from 'rxjs';
import {ShortTreeNode, TreeAction} from './tree/tree.component';
import {UntilDestroy} from '@ngneat/until-destroy';
import {AddressTreeStore} from '../../store/address-tree/address-tree.store';
import {NgFormsManager} from "@ngneat/forms-manager";
import {FormUtils} from "../form.utils";
import {MatDialog} from "@angular/material/dialog";
import {DocumentService} from "../../services/document/document.service";

@UntilDestroy()
@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() address = false;
  @Input() activeId: Subject<string>;

  @Output() dropped = new EventEmitter();

  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new BehaviorSubject<string>(null);

  treeStore: AddressTreeStore | TreeStore;
  private path: '/form' | '/address';
  private formType: 'document' | 'address';

  constructor(private router: Router,
              private dialog: MatDialog,
              private documentService: DocumentService,
              private formsManager: NgFormsManager,
              private addressTreeStore: AddressTreeStore,
              private docTreeStore: TreeStore) {

  }

  ngOnInit() {

    if (this.address) {
      this.treeStore = this.addressTreeStore;
      this.path = '/address';
      this.formType = 'address';
    } else {
      this.treeStore = this.docTreeStore;
      this.path = '/form';
      this.formType = 'document';
    }

    // TODO: sure? Improve performance by keeping store! Make it more intelligent
    //       to avoid node creation from dashboard conflict
    this.clearTreeStore();

    this.activeId?.subscribe(id => {
      this.activeTreeNode.next(id);

      if (id === null) {
        this.storePathTitles([]);
      }
    });

  }

  async handleLoad(selectedDocIds: string[]) { // id: string, profile?: string, forceLoad?: boolean) {

    // when multiple nodes were selected then do not show any form
    if (selectedDocIds.length !== 1) {
      return;
    }

    const currentId = this.formsManager.getControl(this.formType).value._id;

    // do not load same node again
    if (currentId === selectedDocIds[0]) {
      return;
    }

    const handled = await FormUtils.handleDirtyForm(this.formsManager, this.documentService, this.dialog, this.address);

    if (handled) {
      this.router.navigate([this.path, {id: selectedDocIds[0]}]);
    } else {
      this.revertTreeNodeChange(currentId);
    }

  }

  /**
   * Send two updates here since active node won't be set in tree because it seems that it already is
   * due to the Subject being used.
   * @param id
   */
  private revertTreeNodeChange(id: string) {

    this.treeStore.update({
      explicitActiveNode: new ShortTreeNode(id, '?')
    });

  }

  handleSelection(selectedDocsId: string[]) {

    this.treeStore.setActive(selectedDocsId);

  }

  storePathTitles(path: ShortTreeNode[]) {

    this.treeStore.update({
      activePathTitles: path
    });

  }

  // make sure to reload tree instead of using cached nodes
  // otherwise adding new node from dashboard would lead to an error
  private clearTreeStore() {

    this.treeStore.set([]);

  }
}
