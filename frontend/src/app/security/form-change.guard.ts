import {CanDeactivate} from '@angular/router';
import {DynamicFormComponent} from '../+form/form-shared/form/dynamic-form.component';
import {Injectable} from '@angular/core';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FormChangeDeactivateGuard implements CanDeactivate<DynamicFormComponent> {


  constructor(private dialog: MatDialog) {
  }

  canDeactivate(target: DynamicFormComponent): Observable<boolean> {
    if (target.form && target.form.dirty) {
      return this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Änderungen verwerfen?',
          message: 'Wollen Sie die Änderungen am Datensatz wirklich verwerfen?'
        } as ConfirmDialogData
      }).afterClosed()
        .pipe(
          map(confirmed => confirmed)
        );
    }
    return of(true);
  }
}
