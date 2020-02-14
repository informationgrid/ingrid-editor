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
import {HttpErrorResponse} from '@angular/common/http';

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
      tooltip: 'Save',
      label: 'Speichern',
      matIconVariable: 'save',
      eventId: 'SAVE',
      pos: 20,
      active: false,
      align: 'right'
    });

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'SAVE') {
        this.save(this.formsManager.getForm('document').value);
      }
    });

  }

  save(formData: IgeDocument) {
    this.documentService.publishState$.next(false);

    this.documentService.save(formData)
      .then(() => {
      })
      .catch((err: HttpErrorResponse) => {
        throw err;
      });
  }

  unregister() {
    super.unregister();
  }

}
