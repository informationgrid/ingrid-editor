import {Component, OnInit} from '@angular/core';
import {ConfigService, Configuration} from '../services/config/config.service';
import {DocumentService} from '../services/document/document.service';
import {DocumentAbstract} from '../store/document/document.model';
import {Observable} from 'rxjs';
import {SessionQuery} from '../store/session.query';
import {Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {CreateFolderComponent} from "../+form/dialogs/folder/create-folder.component";
import {CreateDocOptions, NewDocumentComponent} from "../+form/dialogs/new-document/new-document.component";

@Component({
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  datasets;

  private configuration: Configuration;
  recentDocs$: Observable<DocumentAbstract[]>;

  constructor(configService: ConfigService,
              private router: Router,
              private dialog: MatDialog,
              private docService: DocumentService,
              private sessionQuery: SessionQuery) {
    this.configuration = configService.getConfiguration();

  }

  ngOnInit() {
    // this.allDocuments$ = this.docQuery.selectAll();
    this.recentDocs$ = this.sessionQuery.latestDocuments$;
    this.fetchStatistic();
    this.fetchData();
  }

  fetchStatistic() {

  }

  fetchData(query?: string) {

    this.docService.findRecent();

  }

  createNewDocument() {
    const dlg = this.dialog.open(NewDocumentComponent, {
      minWidth: 500,
      minHeight: 400,
      disableClose: true,
      data:
        {
          rootOption: true,
          parent: null,
          choice: null,
          forAddress: false
        }
    });
    dlg.afterClosed().subscribe((result: CreateDocOptions) => {
      if (result) {
        this.router.navigate(['/form', {id: result}]);
      }
    })
  }

  createNewAddress() {
    const dlg = this.dialog.open(NewDocumentComponent, {
      minWidth: 500,
      minHeight: 400,
      disableClose: true,
      data:
        {
          rootOption: true,
          parent: null,
          choice: null,
          forAddress: true
        }
    });
    dlg.afterClosed().subscribe((result: CreateDocOptions) => {
      if (result) {
        this.router.navigate(['/address', {id: result}]);
      }
    })
  }

  createNewUser() {

  }

  openDocument(id: number | string) {
    this.router.navigate(['/form', {id: id}]);
  }

  openAddress(id: number | string) {
    this.router.navigate(['/address', {id: id}]);
  }

  createNewFolder() {
    this.dialog.open(CreateFolderComponent, {
      minWidth: 500,
      minHeight: 400,
      disableClose: true,
      data: {}
    }).afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['/form', {id: result}]);
      }
    });
  }
}
