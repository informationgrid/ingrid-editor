import { Injectable } from '@angular/core';
import { Plugin } from '../../plugin';
import { FormToolbarService } from '../../../+form/toolbar/form-toolbar.service';
import { FormularService } from '../../../services/formular/formular.service';
import { PrintViewDialogComponent } from '../../../dialogs/print-view/print-view-dialog.component';
import { MatDialog } from '@angular/material';

@Injectable()
export class PrintViewPlugin extends Plugin {
  id = 'plugin.printView';
  _name = 'Print View Plugin';
  defaultActive = true;

  constructor(private formToolbarService: FormToolbarService,
              private formService: FormularService,
              private dialog: MatDialog) {
    super();
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    // add button to toolbar
    this.formToolbarService.addButton({
      id: 'toolBtnPrint', tooltip: 'Print', cssClasses: 'print', eventId: 'PRINT', active: false
    }, 6);

    // react on event when button is clicked
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'PRINT') {
        console.log('print');
        this.showPrintDialog();
      }
    });

    this.formService.selectedDocuments$.subscribe( data => {
      this.formToolbarService.setButtonState(
        'toolBtnPrint',
        data.length === 1);
    } );
  };

  private showPrintDialog() {
    this.dialog.open(PrintViewDialogComponent);
  }

  unregister() {
    super.unregister();
  }
}
