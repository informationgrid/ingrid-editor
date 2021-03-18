import {Component, OnInit, ViewChild} from '@angular/core';
import {CodelistService} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'ige-codelists',
  templateUrl: './codelists.component.html',
  styleUrls: ['./codelists.component.scss']
})
export class CodelistsComponent implements OnInit {

  @ViewChild(MatSort) sort: MatSort;
  codelistDatasource = new MatTableDataSource([]);
  displayedColumns = ['id', 'value', 'data'];

  codelists = this.codelistService.getAll();
  entries: CodelistEntry[];
  selectedCodelist: Codelist;
  disableSyncButton = false;


  constructor(private codelistService: CodelistService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.codelistDatasource.sort = this.sort;
  }

  updateCodelists() {

    this.disableSyncButton = true;
    this.codelistService.update()
      .pipe(catchError(e => this.handleSyncError(e)))
      .subscribe(codelists => this.disableSyncButton = false);

  }


  private handleSyncError(e: any) {
    console.error(e);
    this.disableSyncButton = false;
    return throwError(e);
  }

  updateCodelistTable(value: any) {
    // this.selectedCodelist = value;
    this.codelistDatasource.data = value.entries;
  }
}
