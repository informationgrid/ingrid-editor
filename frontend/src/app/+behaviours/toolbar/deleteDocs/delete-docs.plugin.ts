import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {Plugin} from '../../plugin';
import {DeleteDialogComponent} from './delete-dialog.component';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';

@Injectable({
  providedIn: 'root'
})
export class DeleteDocsPlugin extends Plugin {
  id = 'plugin.deleteDocs';
  _name = 'Delete Docs Plugin';
  subscriptions: Subscription[] = [];

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private dialog: MatDialog) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.formToolbarService.addButton(
      {id: 'toolBtnRemove', tooltip: 'Remove', matIconVariable: 'delete', eventId: 'DELETE', pos: 100, active: false}
    );

    this.subscriptions.push(
      this.formToolbarService.toolbarEvent$.subscribe(eventId => {
        if (eventId === 'DELETE') {
          this.deleteDoc();
        }
      }),

      this.treeQuery.selectActiveId().subscribe(data => {
        this.formToolbarService.setButtonState(
          'toolBtnRemove',
          data && data.length > 0);
      })
    );
  }

  deleteDoc() {
    const docs = this.treeQuery.getActive();

    this.dialog.open(DeleteDialogComponent, {
      data: docs
    });
  }

  unregister() {
    super.unregister();

    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
    }

    this.formToolbarService.removeButton('toolBtnRemove');
  }

}
