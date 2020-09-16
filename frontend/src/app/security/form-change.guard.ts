import {ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {FormComponent} from '../+form/form/form.component';
import {AddressComponent} from '../+address/address/address.component';
import {NgFormsManager} from '@ngneat/forms-manager';
import {TreeService} from '../+form/sidebars/tree/tree.service';

@Injectable({
  providedIn: 'root'
})
export class FormChangeDeactivateGuard implements CanDeactivate<FormComponent> {

  constructor(private dialog: MatDialog, private formsManager: NgFormsManager,
              private treeService: TreeService) {
  }

  canDeactivate(target: FormComponent | AddressComponent, currentRoute: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState?: RouterStateSnapshot): Observable<boolean> {

    // do not check when we navigate within the current page (loading another document)
    // only check if we actually leave the page
    if (FormChangeDeactivateGuard.pageIsNotLeft(currentState.url, nextState.url)) {
      return of(true);
    }

    const type = target instanceof FormComponent ? 'document' : 'address';
    const formHasChanged = this.formsManager.getControl(type)?.dirty;

    if (formHasChanged) {
      const currentId = this.formsManager.getControl(type).value._id;
      return this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Änderungen sichern?',
          message: 'Möchten Sie auf der Seite bleiben und Ihre Eingaben speichern?\nWenn Sie die Seite jetzt verlassen, werden die Änderungen verworfen.',
          buttons: [
            {text: 'Seite verlassen'},
            {text: 'Auf Seite bleiben', emphasize: true, alignRight: true, id: 'stay'}
          ]
        } as ConfirmDialogData
      }).afterClosed()
        .pipe(
          map(response => response !== 'stay'),
          tap(leavePage => leavePage ? null : this.treeService.selectTreeNode(type === 'address', currentId))
        );
    }
    return of(true);

  }

  private static pageIsNotLeft(currentUrl: string, nextUrl: string) {
    let currentPrefix = currentUrl.substring(0, 5);

    return nextUrl.indexOf(currentPrefix) === 0;
  }
}
