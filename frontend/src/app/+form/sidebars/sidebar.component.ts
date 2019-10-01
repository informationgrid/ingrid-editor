import {Component, OnInit} from '@angular/core';
import {FormularService} from '../../services/formular/formular.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TreeQuery} from '../../store/tree/tree.query';
import {TreeStore} from '../../store/tree/tree.store';
import {DocumentService} from '../../services/document/document.service';
import {tap} from 'rxjs/operators';
import {TreeNode} from '../../store/tree/tree-node.model';
import {DocumentAbstract} from '../../store/document/document.model';
import {forkJoin} from 'rxjs';

@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  sideTab;
  load;

  treeData = this.treeQuery.selectAll();
  expandedNodes = this.treeQuery.expandedNodes$;
  selectedIds = this.treeQuery.selectActiveId();
  private initialExpandNodes: any = {};

  constructor(private formularService: FormularService, private router: Router,
              private route: ActivatedRoute,
              private treeQuery: TreeQuery, private treeStore: TreeStore, private docService: DocumentService) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id === undefined) {

        this.docService.getChildren(null).subscribe();

      } else {

        this.docService.getPath(params['id']).subscribe(path => {
          const lastDocId = path.pop();
          this.initialExpandNodes = path.reduce((obj, item) => {
            obj[item] = true;
            return obj
          }, {});
          this.reloadTreeWithChildren([null, ...path])
            .subscribe( () => {
              this.treeStore.setActive([lastDocId]);
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

  private getChildrenDocs(id: string): Promise<void> {
    return new Promise(resolve => {
      this.docService.getChildren(id).pipe(
        tap(docs => {
          this.treeStore.add(docs);
          resolve();
        })
      ).subscribe();
    });
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
    // TODO: Refactor this to the parent component so that the parent can decide
    //       which store to update
    if (selectedDocsId.length === 1) {
      // FIXME: OK? ID cannot be found if it's a children!
      const selectedDocuments = this.treeQuery.getEntity(selectedDocsId[0]);
      this.treeStore.setOpenedDocument(selectedDocuments[0]);
    }
    this.treeStore.setActive(selectedDocsId);

    // this.documentStore.setSelected(selectedDocs);

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
      const children = this.treeQuery.getAll({filterBy: entity => entity._parent === data.parentId});
      if (children.length > 0) {
        this.addExpandedNode(data.parentId);

      } else {

        // TODO: CHECK IF SUBSCRIPTIONS CREATE MEMORY LEAK!
        // get nodes from server
        this.docService.getChildren(data.parentId).pipe(
          tap(docs => {
            this.treeStore.add(docs);
            this.addExpandedNode(data.parentId);
          })
        ).subscribe();

      }
    } else {

      const previouseExpandState = this.treeQuery.getValue().expandedNodes
        .filter(nodeId => nodeId !== data.parentId);
      this.treeStore.setExpandedNodes([...previouseExpandState]);
    }
  }

  private addExpandedNode(nodeId) {
    const previouseExpandState = this.treeQuery.getValue().expandedNodes;
    this.treeStore.setExpandedNodes([...previouseExpandState, nodeId]);
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
    const id = this.treeQuery.getActive();
    this.treeStore.setActive([]);
    this.reloadTreeWithChildren([null, ...this.treeQuery.expandedNodes])
      .subscribe( () => {
        this.treeStore.setActive([id]);
      });
  }

}
