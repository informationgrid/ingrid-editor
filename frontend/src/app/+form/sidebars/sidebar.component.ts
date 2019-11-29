import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TreeQuery} from '../../store/tree/tree.query';
import {TreeStore} from '../../store/tree/tree.store';
import {DocumentService} from '../../services/document/document.service';
import {Subject} from 'rxjs';
import {TreeAction} from './tree/tree.component';

@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  selectedIds = this.treeQuery.selectActiveId();
  private initialExpandNodes = new Subject<string[]>();
  private initialActiveNodeId: string;
  updateTree = new Subject<TreeAction[]>();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private treeQuery: TreeQuery, private treeStore: TreeStore, private docService: DocumentService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {

      const id = params['id'];
      if (id !== undefined) {

        this.docService.getPath(params['id']).subscribe(path => {
          this.initialActiveNodeId = path.pop();
          this.initialExpandNodes.next(path);
        });

      }
    }).unsubscribe();
/*
    setTimeout(() => {
      console.log('Updating tree');
      // this.updateTree.next([{id: '36766968-7fb8-4e43-8447-93f2b21995e2', type: TreeActionType.DELETE}]);
      // this.treeStore.remove('36766968-7fb8-4e43-8447-93f2b21995e2');
      // @ts-ignore
      this.docService.datasetsChanged.next({type: UpdateType.Delete, data: [{id: '36766968-7fb8-4e43-8447-93f2b21995e2'}]});
      // @ts-ignore
      this.docService.datasetsChanged.next({type: UpdateType.New, data: [{id: '12345', title: 'New node', _profile: 'ADDRESS'}], parent: null});
      // @ts-ignore
      this.docService.datasetsChanged.next({type: UpdateType.Update, data: [{id: '4cc6fbeb-e562-47f0-a24d-e6b624387f89', title: 'Updated Folder :)', _profile: 'FOLDER'}]});
    }, 3000);*/
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

}
