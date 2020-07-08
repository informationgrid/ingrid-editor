import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {CatalogManagerComponent} from './catalog-manager/catalog-manager.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class BehavioursChangedGuard implements CanDeactivate<CatalogManagerComponent> {

  constructor(private dialog: MatDialog) {
  }

  canDeactivate(component: CatalogManagerComponent, route: ActivatedRouteSnapshot,
                state: RouterStateSnapshot): Observable<boolean> | boolean {

    const behavioursHaveChanged = component.behaviourComponent?.hasDirtyForm();

    if (behavioursHaveChanged) {
      return this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Änderungen verwerfen?',
          message: 'Wollen Sie die Änderungen an den Verhalten verwerfen?',
          acceptButtonText: 'Verwerfen'
        } as ConfirmDialogData
      }).afterClosed();
    }
    return true;

  }
}
