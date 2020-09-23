import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BehavioursChangedGuard implements CanDeactivate<CatalogManagerComponent> {

  constructor(private dialog: MatDialog) {
  }

  canDeactivate(component: CatalogManagerComponent): Observable<boolean> | boolean {

    const behavioursHaveChanged = component.behaviourComponent?.hasDirtyForm();

    if (behavioursHaveChanged) {
      return this.dialog.open(ConfirmDialogComponent, {
        data: <ConfirmDialogData>{
          title: 'Änderungen verwerfen?',
          message: 'Wollen Sie die Änderungen an den Verhalten verwerfen?',
          buttons: [
            {text: 'Abbrechen'},
            {text: 'Verwerfen', id: 'discard', alignRight: true, emphasize: true}
          ]
        } as ConfirmDialogData
      }).afterClosed()
        .pipe(map(response => response === 'discard'));
    }
    return true;

  }
}
