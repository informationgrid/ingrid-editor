import {Component, OnChanges} from '@angular/core';
import {Observable} from 'rxjs';
import {FormToolbarService} from '../form-shared/toolbar/form-toolbar.service';
import {DocumentAbstract} from "../../store/document/document.model";
import {AddressTreeQuery} from "../../store/address-tree/address-tree.query";
import {Router} from "@angular/router";
import {DocumentService} from "../../services/document/document.service";
import {SessionQuery} from "../../store/session.query";

@Component({
  selector: 'ige-form-dashboard',
  templateUrl: './form-dashboard.component.html',
  styleUrls: ['./form-dashboard.component.scss']
})
export class FormDashboardComponent implements OnChanges {

  treeDocs: Observable<number> = this.treeQuery.selectCount();
  childDocs$: Observable<DocumentAbstract[]>;

  constructor(private treeQuery: AddressTreeQuery,
              private formToolbarService: FormToolbarService,
              private router: Router,
              private sessionQuery: SessionQuery,
              private docService: DocumentService) {

    // TODO switch to user specific query
    this.childDocs$ = this.sessionQuery.latestDocuments$;
    this.docService.findRecent();
  }

  ngOnChanges() {
    this.docService.findRecent();
  }

  createNewFolder() {
    this.formToolbarService.toolbarEvent$.next('CREATE_FOLDER');
  }

  createNewDataset() {
    this.formToolbarService.toolbarEvent$.next('NEW_DOC');
  }

  importDataset() {
  }

  openDocument(id: number | string) {
    this.router.navigate(['/form', {id: id}]);
  }
}
