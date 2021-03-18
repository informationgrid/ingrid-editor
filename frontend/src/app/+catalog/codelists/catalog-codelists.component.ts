import {Component, OnInit} from '@angular/core';
import {CodelistService} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';

@Component({
  selector: 'ige-catalog-codelists',
  templateUrl: './catalog-codelists.component.html',
  styleUrls: ['./catalog-codelists.component.scss']
})
export class CatalogCodelistsComponent implements OnInit {

  codelists = this.codelistService.getAll();
  entries: CodelistEntry[];
  selectedCodelist: Codelist;
  disableSyncButton = false;

  constructor(private codelistService: CodelistService) {
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
