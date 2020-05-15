import {Injectable} from '@angular/core';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {DocumentService} from '../../../services/document/document.service';
import {Plugin} from '../../../+behaviours/plugin';
import {TreeQuery} from '../../../store/tree/tree.query';
import {AkitaNgFormsManager} from '@datorama/akita-ng-forms-manager';
import {MessageService} from '../../../services/message.service';
import {IgeDocument} from '../../../models/ige-document';
import {MatDialog} from '@angular/material/dialog';
import {merge} from 'rxjs';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {filter} from 'rxjs/operators';

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
              private formsManager: AkitaNgFormsManager,
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
        const form: IgeDocument = this.getForm().value;
        this.save(form);
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
    return this.formsManager.getForm(formDoc);
  }

  save(formData: IgeDocument) {
    this.documentService.publishState$.next(false);

    return this.documentService.save(formData, false, this.forAddress);
  }

  unregister() {
    super.unregister();
  }

}
