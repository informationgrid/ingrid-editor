import {Component, OnInit} from '@angular/core';
import {FormularService} from "../../services/formular/formular.service";
import {ActivatedRoute, Router} from "@angular/router";
import {DocumentAbstract} from "../../store/document/document.model";
import {TreeQuery} from "../../store/tree/tree.query";
import {TreeStore} from "../../store/tree/tree.store";
import {DocumentService} from "../../services/document/document.service";
import {tap} from "rxjs/operators";

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

  constructor(private formularService: FormularService, private router: Router,
              private route: ActivatedRoute,
              private treeQuery: TreeQuery, private treeStore: TreeStore, private docService: DocumentService) { }

  ngOnInit() {
    this.route.params.subscribe( params => {
      this.docService.getChildren(null)
        .pipe(
          tap(docs => {
            this.treeStore.set(docs);

            const id = params['id'];
            if (id !== undefined) {
              this.docService.getPath(params['id']).subscribe(path => {
                let lastDocId = path.pop();
                let promises = [];
                for (let id of path) {
                  promises.push(this.getChildrenDocs(id));
                }

                Promise.all(promises).then(() => {
                  this.treeStore.setActive([lastDocId]);
                  this.treeStore.setExpandedNodes(path);
                });
              });
            }
          })
        ).subscribe();
    }).unsubscribe();
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
    this.router.navigate( ['/form', {id: doc.id}] );
  }

  handleSelection(selectedDocsId: string[]) {
    // TODO: Refactor this to the parent component so that the parent can decide
    //       which store to update
    if (selectedDocsId.length === 1) {
      // FIXME: OK? ID cannot be found if it's a children!
      let selectedDocuments = this.treeQuery.getEntity(selectedDocsId[0]);
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

  handleToggle(data: {parentId: string, expand: boolean}) {
    if (data.expand) {
      // check if nodes have been loaded already
      let children = this.treeQuery.getAll({filterBy: entity => entity._parent === data.parentId});
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

      let previouseExpandState = this.treeQuery.getValue().expandedNodes
        .filter( nodeId => nodeId !== data.parentId);
      this.treeStore.setExpandedNodes([...previouseExpandState]);
    }
  }

  private addExpandedNode(nodeId) {
    let previouseExpandState = this.treeQuery.getValue().expandedNodes;
    this.treeStore.setExpandedNodes([...previouseExpandState, nodeId]);
  }

  reloadTree() {
    this.docService.getChildren(null)
      .pipe(
        tap(docs => this.treeStore.set(docs))
      ).subscribe();
  }

}
