import {Component, OnInit} from '@angular/core';
import {CodelistService, SelectOption} from '../../services/codelist/codelist.service';
import {Codelist, CodelistEntry} from '../../store/codelist/codelist.model';
import {debounceTime, delay, map, tap} from 'rxjs/operators';
import {CodelistQuery} from '../../store/codelist/codelist.query';
import {MatDialog} from '@angular/material/dialog';
import {UpdateCodelistComponent} from './update-codelist/update-codelist.component';
import {ConfirmDialogComponent, ConfirmDialogData} from '../../dialogs/confirm/confirm-dialog.component';
import {FormControl} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
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
      if (this.selectedCodelist) {
        this.initialValue = options.find(option => option.value === this.selectedCodelist.id);
      } else {
        this.initialValue = options[0];
      }
      this.selectCodelist(this.initialValue);
    }
  }

  selectedCodelist: Codelist;
  initialValue: SelectOption;
  descriptionCtrl = new FormControl();
  showSavedState = false;

  constructor(private codelistService: CodelistService,
              private codelistQuery: CodelistQuery,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.descriptionCtrl.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(1000)
      ).subscribe(text => this.save());
  }

  editCodelist(entry?: CodelistEntry) {
    const oldId = entry?.id;
    const editEntry = entry ? entry : {
      fields: {}
    }
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

      this.save(other);
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
      this.save(other);
    });
  }

  selectCodelist(option: SelectOption) {
    this.selectedCodelist = this.codelistQuery.getCatalogCodelist(option.value);
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

  save(codelist?: Codelist) {
    const patchValue = codelist || <Codelist>{
      ...this.selectedCodelist,
      description: this.descriptionCtrl.value
    };

    this.codelistService.updateCodelist(patchValue).subscribe();
    this.showSavedState = true;
    setTimeout(() => this.showSavedState = false, 3000);
  }

  addCodelist() {
    this.editCodelist();
  }
}
