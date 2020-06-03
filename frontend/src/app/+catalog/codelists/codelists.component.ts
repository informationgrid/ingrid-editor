import {Component, OnInit} from '@angular/core';
import {CodelistService} from '../../services/codelist/codelist.service';
import {CodelistQuery} from '../../store/codelist/codelist.query';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'ige-codelists',
  templateUrl: './codelists.component.html',
  styleUrls: ['./codelists.component.scss']
})
export class CodelistsComponent implements OnInit {
  codelists = this.codelistService.getAll();
  entries: CodelistEntry[];
  selectedCodelist: Codelist;
  disableSyncButton = false;

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery) {
  }

  ngOnInit(): void {


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
}
