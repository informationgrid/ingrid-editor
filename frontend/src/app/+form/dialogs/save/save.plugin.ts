import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {TreeQuery} from '../../../store/tree/tree.query';
import {MessageService} from '../../../services/message.service';
import {IgeDocument} from '../../../models/ige-document';
import {MatDialog} from '@angular/material/dialog';
import {merge} from 'rxjs';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {filter} from 'rxjs/operators';
import {NgFormsManager} from '@ngneat/forms-manager';
import {VersionConflictChoice, VersionConflictDialogComponent} from '../version-conflict-dialog/version-conflict-dialog.component';
import {HttpErrorResponse} from '@angular/common/http';

@UntilDestroy()
@Injectable()
export class SavePlugin extends Plugin {
  id = 'plugin.publish';
  _name = 'Publish Plugin';
  defaultActive = true;

  get name() {
    return this._name;
  }

  constructor(private formToolbarService: FormToolbarService,
              private modalService: ModalService,
              private messageService: MessageService,
              private treeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private dialog: MatDialog,
              private formsManager: NgFormsManager,
              private documentService: DocumentService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    // add button to toolbar for publish action
    this.formToolbarService.addButton({
      id: 'toolBtnSave',
      label: 'Speichern',
      matIconVariable: 'save',
      eventId: 'SAVE',
      pos: 20,
      active: false,
      align: 'right'
    });

    // add event handler for revert
    this.formToolbarService.toolbarEvent$
      .pipe(
        filter(eventId => eventId === 'SAVE')
      )
      .subscribe(() => {
        const form: IgeDocument = this.getForm()?.value;
        if (form) {
          this.save(form);
        }
      });

    // react on document selection
    merge(
      this.treeQuery.openedDocument$,
      this.addressTreeQuery.openedDocument$
    )
      .pipe(untilDestroyed(this))
      .subscribe((openedDoc) => {
        this.formToolbarService.setButtonState(
          'toolBtnSave',
          openedDoc !== null);

        // do not allow to modify form if multiple nodes have been selected in tree
        // openedDoc !== null ? this.form.enable() : this.form.disable();

      });

  }

  private getForm() {
    const formDoc = this.forAddress ? 'address' : 'document';
    return this.formsManager.getControl(formDoc);
  }

  private save(formData: IgeDocument) {
    this.documentService.publishState$.next(false);

    return this.documentService.save(formData, false, this.forAddress)
      .catch(error => this.handleSaveError(error));
  }

  unregister() {
    super.unregister();
  }

  /**
   * Handle version conflict errors during save
   *
   * @param error
   * @private
   */
  private handleSaveError(error: HttpErrorResponse) {
    if (error?.status === 409) {
      this.dialog.open(VersionConflictDialogComponent).afterClosed()
        .subscribe(choice => this.handleAfterConflictChoice(choice, error.error));
    } else {
      throw error;
    }
  }

  private handleAfterConflictChoice(choice: VersionConflictChoice, latestVersion: number) {
    switch (choice) {
      case 'cancel':
        break;
      case 'force':
        const formData = this.getFormDataWithVersionInfo(latestVersion);
        this.save(formData);
        break;
      case 'reload':
        this.documentService.reload$.next(this.getIdFromFormData())
        break;

    }
  }

  private getFormDataWithVersionInfo(version: number) {
    const data = this.getForm()?.value;
    data['_version'] = version;
    return data;
  }

  private getIdFromFormData() {
    return this.getForm()?.value['_id'];
  }
}
