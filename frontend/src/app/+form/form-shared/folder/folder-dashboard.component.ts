import {Component, Input, OnChanges} from '@angular/core';
import {TreeQuery} from '../../../store/tree/tree.query';
import {Observable} from 'rxjs';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {DocumentAbstract} from '../../../store/document/document.model';
import {Router} from "@angular/router";
import {DocumentService} from "../../../services/document/document.service";
import {SessionQuery} from "../../../store/session.query";
import {map} from "rxjs/operators";

@Component({
  selector: 'ige-folder-dashboard',
  templateUrl: './folder-dashboard.component.html',
  styleUrls: ['./folder-dashboard.component.scss']
})
export class FolderDashboardComponent implements OnChanges {

  @Input() isAddress = false;
  @Input() parentId: string;
  childDocs$: Observable<DocumentAbstract[]>;

  constructor(private treeQuery: TreeQuery,
              private formToolbarService: FormToolbarService,
              private router: Router,
              private docService: DocumentService,
              private sessionQuery: SessionQuery) {
  }

  ngOnChanges() {
    // TODO switch to user specific query
    this.childDocs$ = this.docService.getChildren(this.parentId, this.isAddress)
      .pipe(
        map(children => children
          .sort((c1, c2) => new Date(c2._modified).getTime() - new Date(c1._modified).getTime())
          .slice(0, 5)
        )
      );
  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next('CREATE_FOLDER');
  }

  createNewDataset() {
    this.formToolbarService.toolbarEvent$.next('NEW_DOC');
  }

  openDocument(id: number | string) {
    if (this.isAddress) {
      this.router.navigate(['/address', {id: id}]);
    } else {

      this.router.navigate(['/form', {id: id}]);
    }
  }

}
