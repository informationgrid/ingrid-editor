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
import {DocumentService} from '../services/document/document.service';

@Injectable({
  providedIn: 'root'
})
export class FormChangeDeactivateGuard implements CanDeactivate<FormComponent> {

  constructor(private dialog: MatDialog, private formsManager: NgFormsManager,
              private documentService: DocumentService,
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
        disableClose: true,
        data: {
          title: 'Änderungen speichern?',
          message: 'Möchten Sie die Änderungen speichern bevor Sie die Seite verlassen?\nSie können die Änderungen auch verwerfen oder auf der Seite bleiben.',
          buttons: [
            {text: 'Auf Seite bleiben', id: 'stay'},
            {text: 'Seite verlassen', id: 'leave', alignRight: true},
            {text: 'Speichern und verlassen', id: 'save', emphasize: true, alignRight: true}
          ]
        } as ConfirmDialogData
      }).afterClosed()
        .pipe(
          tap(response => response ? this.handleAction(response, type, currentId) : null),
          map(response => response === 'leave' || response === 'save')
        );
    }
    return of(true);

  }

  private async handleAction(action: undefined | 'save' | 'stay', type: 'document' | 'address', currentId) {
    const isAddress = type === 'address';

    if (action === 'save') {
      const form = this.formsManager.getControl(type)?.value;
      await this.documentService.save(form, false, isAddress);
    } else if (action === 'stay') {
      this.treeService.selectTreeNode(isAddress, currentId);
    }
  }

  private static pageIsNotLeft(currentUrl: string, nextUrl: string) {
    let currentPrefix = currentUrl.substring(0, 5);

    return nextUrl.indexOf(currentPrefix) === 0;
  }
}
