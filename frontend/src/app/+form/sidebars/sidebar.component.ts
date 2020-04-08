import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
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

  initialExpandNodes = new Subject<string[]>();
  initialActiveNodeId: string;
  updateTree = new Subject<TreeAction[]>();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private treeStore: TreeStore,
              private docService: DocumentService) {

  }

  ngOnInit() {
    this.route.params.subscribe(params => {

      const id = params['id'];
      if (id !== undefined) {

        this.docService.getPath(id).subscribe(path => {
          this.initialActiveNodeId = path.pop();
          this.initialExpandNodes.next(path);
        });

      }
    }).unsubscribe();
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
    this.router.navigate(['/form', {id: selectedDocIds[0]}]);
  }

  handleSelection(selectedDocsId: string[]) {

    this.treeStore.setActive(selectedDocsId);

  }

  storePath(path: string[]) {
    this.treeStore.update({
      activePathTitles: path
    })
  }
}
