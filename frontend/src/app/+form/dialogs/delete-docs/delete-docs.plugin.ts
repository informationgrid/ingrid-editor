import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {
  ConfirmDialogButton,
  ConfirmDialogComponent,
  ConfirmDialogData
} from '../../../dialogs/confirm/confirm-dialog.component';
import {DocumentService} from '../../../services/document/document.service';
import {Router} from '@angular/router';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {EventService, IgeEvent} from '../../../services/event/event.service';
import {filter, take} from 'rxjs/operators';

@Injectable()
export class DeleteDocsPlugin extends Plugin {
  id = 'plugin.deleteDocs';
  _name = 'Delete Docs Plugin';

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private documentService: DocumentService,
              private router: Router,
              private eventService: EventService,
              private dialog: MatDialog) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    this.formToolbarService.addButton(
      {id: 'toolBtnRemove', tooltip: 'Löschen', matSvgVariable: 'outline-delete-24px', eventId: 'DELETE', pos: 100, active: false}
    );

    this.subscriptions.push(
      this.formToolbarService.toolbarEvent$.subscribe(eventId => {
        if (eventId === 'DELETE') {
          this.eventService.sendEventAndContinueOnSuccess(IgeEvent.DELETE)
            .subscribe( () => this.showDeleteDialog());
        }
      }),

      this.treeQuery.selectActiveId().subscribe(data => {
        this.formToolbarService.setButtonState(
          'toolBtnRemove',
          data && data.length > 0);
      }),

      this.addressTreeQuery.selectActiveId().subscribe(data => {
        this.formToolbarService.setButtonState(
          'toolBtnRemove',
          data && data.length > 0);
      })
    );
  }

  showDeleteDialog() {
    const query = this.forAddress ? this.addressTreeQuery : this.treeQuery;

    // TODO: this strategy is used in several toolbar plugins to prevent too early execution
    //       when opening page and hitting a toolbar button
    query.selectActive()
      .pipe(
        filter(entity => entity !== undefined),
        take(1)
      )
      .subscribe(docs => {
        this.dialog.open(ConfirmDialogComponent, {
          data: <ConfirmDialogData>{
            message: 'Möchten Sie wirklich diese Datensätze löschen:',
            title: 'Löschen',
            list: docs.map(doc => doc.title),
            buttons: [
              {text: 'Abbrechen'},
              {text: 'Löschen', alignRight: true, id: 'confirm', emphasize: true}
            ]
          }
        }).afterClosed().subscribe(response => {
          if (response === 'confirm') {
            this.deleteDocs(docs.map(doc => <string>doc.id));
          }
        });
      });
  }

  deleteDocs(docIdsToDelete: string[]) {
    try {

      // const parents = this.treeQuery.getAll()
      //   .filter(doc => docIdsToDelete.indexOf(doc.id.toString()) !== -1)
      //   .map(doc => doc._parent);

      this.documentService.delete(docIdsToDelete, this.forAddress);

      this.documentService.updateOpenedDocumentInTreestore(null, this.forAddress);

      // find all parents in store who now have no children anymore
      // parents
      //   .filter(id => this.treeQuery.getCount(item => item._parent === id) === 0)
      //   .forEach( id => this.documentService.updateChildrenInfo(id, false));

      const route = this.forAddress ? '/address' : '/form';
      this.router.navigate([route]);
    } catch (ex) {
      console.error('Could not delete', ex);
    }
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnRemove');
  }

}
