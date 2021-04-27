import {Component, OnInit} from '@angular/core';
import {CodelistService, SelectOption} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {delay, map, tap} from 'rxjs/operators';
import {CodelistQuery} from '../../store/codelist/codelist.query';
import {MatDialog} from '@angular/material/dialog';
import {UpdateCodelistComponent} from './update-codelist/update-codelist.component';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../dialogs/confirm/confirm-dialog.component';
import {FormControl} from '@angular/forms';
import {MatSnackBar} from '@angular/material/snack-bar';

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

  selectedCodelist: Codelist;
  initialValue: SelectOption;
  descriptionCtrl = new FormControl();

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery,
              private _snackBar: MatSnackBar,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  editCodelist(entry?: CodelistEntry) {
    const oldId = entry?.id;
    const editEntry = entry ? entry : {
      fields: {}
    };
    this.dialog.open(UpdateCodelistComponent, {
      minWidth: 400,
      disableClose: true,
      data: editEntry
    }).afterClosed().subscribe(result => {
      if (!result) return;
      const other = JSON.parse(JSON.stringify(this.selectedCodelist));

      if (entry) {
        const index = this.selectedCodelist.entries
          .findIndex(e => e.id === oldId);
        other.entries.splice(index, 1, result);
      } else {
        other.entries.push(result);
      }

      this.selectedCodelist = other;
    });
  }

  removeCodelist(entry: CodelistEntry) {
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        message: `Möchten Sie den Codelist-Eintrag "${entry.fields['de']}" wirklich löschen:`,
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
      this.selectedCodelist = other;
    });
  }

  selectCodelist(option: SelectOption) {
    this.selectedCodelist = this.codelistQuery.getCatalogCodelist(option.value);
    this.selectedCodelist.entries.sort((a,b) => a.id.localeCompare(b.id));
    this.descriptionCtrl.setValue(this.selectedCodelist.description, {emitEvent: false});
  }

  resetCodelist() {
    this.dialog.open(ConfirmDialogComponent, {
      data: <ConfirmDialogData>{
        message: `Möchten Sie die Codeliste wirklich zurücksetzen?`,
        title: 'Zurücksetzen',
        buttons: [
          {text: 'Abbrechen'},
          {text: 'Zurücksetzen', alignRight: true, id: 'confirm', emphasize: true}
        ]
      }
    }).afterClosed().subscribe(result => {
      if (result) {
        this.codelistService.resetCodelist(this.selectedCodelist?.id ?? null).subscribe();
      }
    });
  }

  save() {
    const patchValue = <Codelist>{
      ...this.selectedCodelist,
      description: this.descriptionCtrl.value
    };

    this.codelistService.updateCodelist(patchValue)
      .pipe(
        tap(() => this._snackBar.open('Codeliste gespeichert'))
      ).subscribe();
  }

  addCodelist() {
    this.editCodelist();
  }

  setAsDefault(entry: CodelistEntry) {
    const other = JSON.parse(JSON.stringify(this.selectedCodelist));
    other.default = entry.id;
    this.selectedCodelist = other;
  }

  removeDefault() {
    const other = JSON.parse(JSON.stringify(this.selectedCodelist));
    other.default = null;
    this.selectedCodelist = other;
  }

  private setInitialValue(options: SelectOption[]) {
    if (options?.length > 0) {
      if (this.selectedCodelist) {
        this.initialValue = options.find(option => option.value === this.selectedCodelist.id);
      } else {
        this.initialValue = options[0];
      }
      this.selectCodelist(this.initialValue);
    }
  }
}
