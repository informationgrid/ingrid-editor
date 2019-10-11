import {Component, OnInit} from '@angular/core';
import {FormularService} from '../../services/formular/formular.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TreeQuery} from '../../store/tree/tree.query';
import {TreeStore} from '../../store/tree/tree.store';
import {DocumentService} from '../../services/document/document.service';
import {map, tap} from 'rxjs/operators';
import {TreeNode} from '../../store/tree/tree-node.model';
import {DocumentAbstract} from '../../store/document/document.model';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  treeData = this.treeQuery.selectAll().pipe(map(docs => docs.map(SidebarComponent.mapDocToTreeNode)));
  selectedIds = this.treeQuery.selectActiveId();
  private initialExpandNodes: any = {};
  private initialActiveNodeId: string;

  constructor(private formularService: FormularService, private router: Router,
              private route: ActivatedRoute,
              private treeQuery: TreeQuery, private treeStore: TreeStore, private docService: DocumentService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      console.log('SidebarComponent: RouteParams-subscription');

      const id = params['id'];
      if (id === undefined) {

        this.docService.getChildren(null).subscribe( docs => {
          this.treeStore.set(docs);
        });

      } else {

        this.docService.getPath(params['id']).subscribe(path => {
          this.initialActiveNodeId = path.pop();
          this.initialExpandNodes = path.reduce((obj, item) => {
            obj[item] = true;
            return obj
          }, {});
          this.reloadTreeWithChildren([null, ...path])
            .subscribe( () => {
              this.treeStore.setExpandedNodes(path);
            });
        });

      }
    }).unsubscribe();
  }

  transform(data: DocumentAbstract[], level: number, parent: string, expandState: any, initialState?: any): TreeNode[] {
    const finalArray = [];

    const parents = data
      .filter(d => d._parent === parent)
      .map(d => {
        return {
          _id: d.id,
          title: d.title,
          level: level,
          profile: d._profile,
          hasChildren: d._hasChildren,
          isExpanded: expandState[d.id] || initialState[d.id]
        } as TreeNode;
      });

    parents.forEach(p => {
      finalArray.push(p);
      if (p.hasChildren) {
        const children = this.transform(data, level + 1, p._id, expandState, initialState);
        if (children.length > 0) {
          finalArray.push(...children);
        }
      }
    });

    return finalArray;
  }

  handleLoad(selectedDocIds: string[]) { // id: string, profile?: string, forceLoad?: boolean) {
    // when multiple nodes were selected then do not show any form
    if (selectedDocIds.length !== 1) {
      return;
    }


    const doc = this.treeQuery.getEntity(selectedDocIds[0]);

    // if a folder was selected then normally do not show the form
    // show folder form only if the edit button was clicked which adds the forceLoad option
    if (doc._profile === 'FOLDER') { // && !doc.editable) {
      return;
    }

    // this.documentStore.setOpenedDocument(doc);
    this.router.navigate(['/form', {id: doc.id}]);
  }

  handleSelection(selectedDocsId: string[]) {

    this.treeStore.setActive(selectedDocsId);

    // when multiple nodes were selected then do not show any form
    // TODO: update ui store for form
    /*if (this.form) {
      if (selectedDocs.length !== 1 && this.form.enabled) {
        this.form.disable();
      } else if (this.form.disabled) {
        this.form.enable();
      }
    }*/
  }

  handleToggle(data: { parentId: string, expand: boolean }) {
    if (data.expand) {
      // check if nodes have been loaded already
      const childrenLength = this.treeQuery.getCount(entity => entity._parent === data.parentId);
      if (childrenLength > 0) {
        this.docService.addExpandedNode(data.parentId);

      } else {

        // TODO: CHECK IF SUBSCRIPTIONS CREATE MEMORY LEAK!
        // get nodes from server
        this.docService.getChildren(data.parentId).pipe(
          tap(docs => {
            console.log('HandleToggle');
            this.treeStore.add(docs);
            this.docService.addExpandedNode(data.parentId);
          })
        ).subscribe();

      }
    } else {

      this.docService.removeExpandedNode(data.parentId);

    }
  }

  /**
   *
   */
  private reloadTreeWithChildren(expandedNodes: string[]) {

    return forkJoin(expandedNodes.map(nodeId => this.docService.getChildren(nodeId)))
      .pipe(
        tap(docs => {
          const docsReduced = docs.reduce((acc, val) => acc.concat(val), []);
          console.log('Setting tree nodes after reload:', docsReduced);
          this.treeStore.set(docsReduced);
        })
      );

  }

  reloadTree() {
    const activeDoc = this.treeQuery.getActive();
    this.treeStore.setActive([]);
    this.reloadTreeWithChildren([null, ...this.treeQuery.expandedNodes])
      .subscribe( () => {
        this.treeStore.setActive([activeDoc[0].id]);
      });
  }

  public static mapDocToTreeNode(doc: DocumentAbstract): TreeNode {
    return {
      _id: doc.id as string,
      title: doc.title,
      hasChildren: doc._hasChildren,
      parent: doc._parent,
      profile: doc._profile,
      state: doc._state
    };
  }
}
