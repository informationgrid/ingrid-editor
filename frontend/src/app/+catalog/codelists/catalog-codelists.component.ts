import {Component, OnInit} from '@angular/core';
import {CodelistService, SelectOption} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {throwError} from 'rxjs';
import {catchError, map} from 'rxjs/operators';
import {CodelistQuery} from '../../store/codelist/codelist.query';
import {MatDialog} from '@angular/material/dialog';
import {UpdateCodelistComponent} from './update-codelist/update-codelist.component';

@Component({
  selector: 'ige-catalog-codelists',
  templateUrl: './catalog-codelists.component.html',
  styleUrls: ['./catalog-codelists.component.scss']
})
export class CatalogCodelistsComponent implements OnInit {

  catalogCodelists = this.codelistQuery.catalogCodelists$;

  codelists = this.codelistQuery.selectAll()
    .pipe(map(codelists => this.codelistService.mapToOptions(codelists)));

  entries: CodelistEntry[];
  selectedCodelist: Codelist[] = [];
  disableSyncButton = false;

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.codelistService.getAll();
    // TODO: should this be called initially on App-Load?
    this.codelistService.getCatalogCodelists();
  }

  updateCodelists() {

    this.disableSyncButton = true;
    this.codelistService.update()
      .pipe(catchError(e => this.handleSyncError(e)))
      .subscribe(codelists => this.disableSyncButton = false);

  }

  /*selectedCodelist(value: string) {
    this.entries = this.codelistQuery.getEntity(value).entries;
  }*/

  private handleSyncError(e: any) {
    console.error(e);
    this.disableSyncButton = false;
    return throwError(e);
  }

  codelistLabelFormat(option: SelectOption) {
    return `${option.value} - ${option.label}`
  }

  addCodelist(selectedValue: SelectOption) {
    const codelist = this.codelistQuery.getEntity(selectedValue.value);
    this.codelistService.addCatalogCodelist(codelist);
  }

  editCodelist(entry: CodelistEntry) {
    this.dialog.open(UpdateCodelistComponent, {
      minWidth: 300,
      data: entry
    }).afterClosed().subscribe(result => {

    })
  }
}
