import {Component, Input, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {TreeStore} from '../../store/tree/tree.store';
import {BehaviorSubject, Subject} from 'rxjs';
import {ShortTreeNode, TreeAction} from './tree/tree.component';
import {UntilDestroy} from '@ngneat/until-destroy';
import {AddressTreeStore} from '../../store/address-tree/address-tree.store';

@UntilDestroy()
@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() address = false;
  @Input() activeId: Subject<string>;

  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new BehaviorSubject<string>(null);
  treeStore: AddressTreeStore | TreeStore;

  constructor(private router: Router,
              private addressTreeStore: AddressTreeStore,
              private docTreeStore: TreeStore) {

  }

  ngOnInit() {

    if (this.address) {
      this.treeStore = this.addressTreeStore;
    } else {
      this.treeStore = this.docTreeStore;
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

  handleLoad(selectedDocIds: string[]) { // id: string, profile?: string, forceLoad?: boolean) {

    // when multiple nodes were selected then do not show any form
    if (selectedDocIds.length !== 1) {
      return;
    }

    const path = this.address ? '/address' : '/form';
    this.router.navigate([path, {id: selectedDocIds[0]}]);

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
