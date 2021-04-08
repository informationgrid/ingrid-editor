import {Component, OnInit} from '@angular/core';
import {CodelistService, SelectOption} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {delay, map, tap} from 'rxjs/operators';
import {CodelistQuery} from '../../store/codelist/codelist.query';
import {MatDialog} from '@angular/material/dialog';
import {UpdateCodelistComponent} from './update-codelist/update-codelist.component';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../dialogs/confirm/confirm-dialog.component';

@Component({
  selector: 'ige-catalog-codelists',
  templateUrl: './catalog-codelists.component.html',
  styleUrls: ['./catalog-codelists.component.scss']
})
export class CatalogCodelistsComponent implements OnInit {

  hasCatalogCodelists = this.codelistQuery.hasCatalogCodelists$;
  catalogCodelists = this.codelistQuery.catalogCodelists$
    .pipe(
      map(codelists => this.codelistService.mapToOptions(codelists)),
      delay(0), // set initial value in next rendering cycle!
      tap(options => this.setInitialValue(options))
    );

  private setInitialValue(options: SelectOption[]) {
    if (options?.length > 0) {
      this.initialValue = options[0];
      this.selectCodelist(this.initialValue);
    }
  }

  selectedCodelist: Codelist;
  initialValue: SelectOption;

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  codelistLabelFormat(option: SelectOption) {
    return `${option.value} - ${option.label}`;
  }

  editCodelist(entry: CodelistEntry) {
    const oldId = entry.id;
    this.dialog.open(UpdateCodelistComponent, {
      minWidth: 400,
      data: entry
    }).afterClosed().subscribe(result => {
      if (!result) return;
      const index = this.selectedCodelist.entries
        .findIndex(e => e.id === oldId);
      const other = JSON.parse(JSON.stringify(this.selectedCodelist));
      other.entries.splice(index, 1, result);
      this.codelistService.updateCodelist(other)
        .pipe(
          tap(() => this.selectCodelist({value: this.selectedCodelist.id, label: ''}))
        ).subscribe();
    });
  }

  removeCodelist(entry: CodelistEntry) {
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        message: `Möchten Sie den Codelist-Eintrag "${entry.value}" wirklich löschen:`,
        title: 'Löschen',
        buttons: [
          {text: 'Abbrechen'},
          {text: 'Löschen', alignRight: true, id: 'confirm', emphasize: true}
        ]
      }
    }).afterClosed().subscribe(result => {
      if (!result) return;
      const oldId = entry.id;
      const index = this.selectedCodelist.entries
        .findIndex(e => e.id === oldId);
      const other = JSON.parse(JSON.stringify(this.selectedCodelist));
      other.entries.splice(index, 1);
      this.codelistService.updateCodelist(other)
        .pipe(
          tap(() => this.selectCodelist({value: this.selectedCodelist.id, label: ''}))
        ).subscribe();
    });
  }

  selectCodelist(option: SelectOption) {
    this.selectedCodelist = this.codelistQuery.getCatalogCodelist(option.value);
  }
}
