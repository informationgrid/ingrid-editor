import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {TreeStore} from '../../store/tree/tree.store';
import {DocumentService} from '../../services/document/document.service';
import {Subject} from 'rxjs';
import {ShortTreeNode, TreeAction} from './tree/tree.component';
import {filter, map, switchMap, take} from 'rxjs/operators';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {

  initialExpandNodes = new Subject<string[]>();
  updateTree = new Subject<TreeAction[]>();
  activeTreeNode = new Subject<string>();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private treeStore: TreeStore,
              private docService: DocumentService) {

  }

  ngOnInit() {

    // setup tree according to initial parameters when switching to the page
    this.route.params
      .pipe(
        take(1),
        filter(params => params['id']),
        map(params => params['id']),
        switchMap(id => this.docService.getPath(id))
      )
      .subscribe(path => {
        this.activeTreeNode.next(path.pop());
        this.initialExpandNodes.next(path);
      });

    // only react on initial page when clicking on menu button
    // to reset tree selection
    this.route.params.pipe(
      untilDestroyed(this),
      filter(params => params['id'] === undefined)
    ).subscribe(params => {
      this.activeTreeNode.next(null);
      this.storePathTitles([]);
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
    this.router.navigate(['/form', {id: selectedDocIds[0]}]);
  }

  handleSelection(selectedDocsId: string[]) {

    this.treeStore.setActive(selectedDocsId);

  }

  storePathTitles(path: ShortTreeNode[]) {
    this.treeStore.update({
      activePathTitles: path.map(node => node.title)
    })
  }

}
