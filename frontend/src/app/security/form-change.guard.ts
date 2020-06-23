import {CanDeactivate} from '@angular/router';
import {Injectable} from '@angular/core';
import {ConfirmDialogComponent, ConfirmDialogData} from '../dialogs/confirm/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {Observable, of} from 'rxjs';
import {tap} from 'rxjs/operators';
import {FormComponent} from '../+form/form/form.component';
import {TreeStore} from '../store/tree/tree.store';
import {AddressTreeStore} from '../store/address-tree/address-tree.store';
import {AddressComponent} from '../+address/address/address.component';
import {ShortTreeNode} from '../+form/sidebars/tree/tree.component';
import {NgFormsManager} from '@ngneat/forms-manager';

@Injectable({
  providedIn: 'root'
})
export class FormChangeDeactivateGuard implements CanDeactivate<FormComponent> {

  constructor(private dialog: MatDialog, private formsManager: NgFormsManager,
              private treeStore: TreeStore, private addressTreeStore: AddressTreeStore) {
  }

  canDeactivate(target: FormComponent | AddressComponent): Observable<boolean> {

    const type = target instanceof FormComponent ? 'document' : 'address';
    const formHasChanged = this.formsManager.getControl(type)?.dirty;

    if (formHasChanged) {
      const currentId = this.formsManager.getControl(type).value._id;
      return this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Änderungen verwerfen?',
          message: 'Wollen Sie die Änderungen am Datensatz wirklich verwerfen?'
        } as ConfirmDialogData
      }).afterClosed()
        .pipe(
          tap(confirmed => confirmed ? null : this.revertTreeNodeChange(type, currentId))
        );
    }
    return of(true);

  }

  /**
   * Send two updates here since active node won't be set in tree because it seems that it already is
   * due to the Subject being used.
   * @param type
   * @param id
   */
  private revertTreeNodeChange(type: 'address'|'document', id: string) {

    const store = type === 'document' ? this.treeStore : this.addressTreeStore;

    store.update({
      explicitActiveNode: new ShortTreeNode(id, '?')
    });
  }

}
