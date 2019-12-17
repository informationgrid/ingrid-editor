import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../toolbar/form-toolbar.service';
import {Plugin} from '../../../+behaviours/plugin';
import {Subscription} from 'rxjs';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {ConfirmDialogComponent} from '../../../dialogs/confirm/confirm-dialog.component';
import {DocumentService} from '../../../services/document/document.service';
import {Router} from '@angular/router';

@Injectable()
export class DeleteDocsPlugin extends Plugin {
  id = 'plugin.deleteDocs';
  _name = 'Delete Docs Plugin';
  subscriptions: Subscription[] = [];

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private storageService: DocumentService,
              private router: Router,
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
          this.showDeleteDialog();
        }
      }),

      this.treeQuery.selectActiveId().subscribe(data => {
        this.formToolbarService.setButtonState(
          'toolBtnRemove',
          data && data.length > 0);
      })
    );
  }

  showDeleteDialog() {
    const docs = this.treeQuery.getActive();

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        message: 'Möchten Sie wirklich diese Datensätze löschen:',
        title: 'Löschen',
        list: docs.map(doc => doc.title)
      }
    }).afterClosed().subscribe(doDelete => {
      if (doDelete) {
        this.deleteDocs(docs.map(doc => <string>doc.id));
      }
    });
  }

  deleteDocs(docIdsToDelete: string[]) {
    try {
      this.storageService.delete(docIdsToDelete);

      this.router.navigate(['/form']);
    } catch (ex) {
      console.error('Could not delete', ex);
    }
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
