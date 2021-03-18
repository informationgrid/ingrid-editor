import {Component, OnInit, ViewChild} from '@angular/core';
import {CodelistService} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {combineLatest, Observable, throwError} from 'rxjs';
import {catchError, filter, map, startWith, tap} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {FormControl} from '@angular/forms';
import {UntilDestroy} from '@ngneat/until-destroy';
import {IgeError} from '../../models/ige-error';
import {HttpErrorResponse} from '@angular/common/http';

@UntilDestroy()
@Component({
  selector: 'ige-codelists',
  templateUrl: './codelists.component.html',
  styleUrls: ['./codelists.component.scss']
})
export class CodelistsComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  codelistDatasource = new MatTableDataSource([]);
  displayedColumns = ['id', 'value', 'data'];

  entries: CodelistEntry[];
  disableSyncButton = false;
  codelistControl = new FormControl();
  filteredCodelists: Observable<Codelist[]>;

  constructor(private codelistService: CodelistService) {
  }

  ngOnInit(): void {

    this.filteredCodelists = combineLatest([
      this.codelistControl.valueChanges.pipe(startWith('')),
      this.codelistService.getAll()
    ]).pipe(
      tap(value => console.log(value)),
      // only filter input strings and selections
      filter(value => !(value[0] instanceof Object)),
      map(value => this._filter(value[0], value[1] as Codelist[]))
    );
  }

  ngAfterViewInit() {
    this.codelistDatasource.sort = this.sort;
  }

  updateCodelists() {

    this.disableSyncButton = true;
    this.codelistService.update()
      .pipe(catchError(e => this.handleSyncError(e)))
      .subscribe(() => this.disableSyncButton = false);

  }

  private _filter(value: string, allCodelists: Codelist[]): Codelist[] {
    const filterValue = value.toLowerCase();

    return allCodelists
      .filter(option => (option.id + option.name).toLowerCase().includes(filterValue));
  }

  private handleSyncError(e: HttpErrorResponse) {
    console.error(e);
    this.disableSyncButton = false;
    if (e.error.errorText === 'Failed to synchronize code lists') {
      return throwError(
        new IgeError({
          message: 'Die Codelisten konnten nicht synchronisiert werden. Überprüfen Sie die Verbindung zum Codelist-Repository.'
        }));
    }
    return throwError(e);
  }

  updateCodelistTable(value: any) {
    if (!value) {
      this.codelistDatasource.data = [];
      return;
    }

    this.codelistControl.setValue(`${value.id} - ${value.name}`);
    this.codelistDatasource.data = value.entries;
  }

  resetInput() {
    this.codelistControl.reset('');
    this.updateCodelistTable(null);
  }
}
