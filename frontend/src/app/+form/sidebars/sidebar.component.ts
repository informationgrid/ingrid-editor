import {Component, Input, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TreeStore} from '../../store/tree/tree.store';
import {BehaviorSubject, Subject} from 'rxjs';
import {ShortTreeNode, TreeAction} from './tree/tree.component';
import {filter, map, take} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {TreeQuery} from '../../store/tree/tree.query';
import {AddressTreeStore} from '../../store/address-tree/address-tree.store';
import {AddressTreeQuery} from '../../store/address-tree/address-tree.query';

@UntilDestroy()
@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  @Input() address = false;
  @Input() parentContainer: HTMLElement;

  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new BehaviorSubject<string>(null);
  treeStore: AddressTreeStore | TreeStore;
  treeQuery: AddressTreeQuery | TreeQuery;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private addressTreeStore: AddressTreeStore,
              private addressTreeQuery: AddressTreeQuery,
              private docTreeQuery: TreeQuery,
              private docTreeStore: TreeStore) {

  }

  ngOnInit() {

    if (this.address) {
      this.treeQuery = this.addressTreeQuery;
      this.treeStore = this.addressTreeStore;
    } else {
      this.treeQuery = this.docTreeQuery;
      this.treeStore = this.docTreeStore;
    }

    this.clearTreeStore();

    // setup tree according to initial parameters when switching to the page
    this.route.params
      .pipe(
        take(1),
        filter(params => params['id']),
        map(params => params['id'])
      ).subscribe(id => {
      this.treeStore.update({
        explicitActiveNode: new ShortTreeNode(id, '?')
      });
    });

    this.treeQuery.explicitActiveNode$
      .pipe(
        untilDestroyed(this),
        filter(node => node !== undefined && node !== null)
      )
      .subscribe(node => {
        // do not show loading indicator when going to dashboard
        if (node.id) {
          this.treeStore.update({isDocLoading: true});
        }
        this.activeTreeNode.next(node.id);
      });

    // only react on initial page when clicking on menu button
    // to reset tree selection
    this.route.params.pipe(
      untilDestroyed(this),
      filter(params => params['id'] === undefined)
    ).subscribe(params => {
      const previousOpenedDoc = this.treeQuery.getValue().openedDocument;
      if (previousOpenedDoc) {
        this.treeStore.update({isDocLoading: true});
        console.log('Opening previous selected node', previousOpenedDoc.id);
        this.activeTreeNode.next(previousOpenedDoc.id.toString());
        setTimeout( () => this.parentContainer.scrollTop = this.treeQuery.getValue().scrollPosition, 1000);
      } else {
        this.activeTreeNode.next(null);
        this.storePathTitles([]);
      }
    });
  }

  handleLoad(selectedDocIds: string[]) { // id: string, profile?: string, forceLoad?: boolean) {
    // when multiple nodes were selected then do not show any form
    if (selectedDocIds.length !== 1) {
      return;
    }


    // const doc = this.treeQuery.getEntity(selectedDocIds[0]);

    // if a folder was selected then normally do not show the form
    // show folder form only if the edit button was clicked which adds the forceLoad option
    /*if (doc._profile === 'FOLDER') { // && !doc.editable) {
      return;
    }*/

    // this.documentStore.setOpenedDocument(doc);
    const path = this.address ? '/address' : '/form';
    this.router.navigate([path, {id: selectedDocIds[0]}]);
  }

  handleSelection(selectedDocsId: string[]) {

    this.treeStore.setActive(selectedDocsId);

  }

  storePathTitles(path: ShortTreeNode[]) {
    this.treeStore.update({
      activePathTitles: path
    })
  }

  // make sure to reload tree instead of using cached nodes
  // otherwise adding new node from dashboard would lead to an error
  private clearTreeStore() {
    this.treeStore.set([]);
  }
}
