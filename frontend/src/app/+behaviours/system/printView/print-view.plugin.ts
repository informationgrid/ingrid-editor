import {Injectable} from '@angular/core';
import {Plugin} from '../../plugin';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {FormularService} from '../../../services/formular/formular.service';
import {PrintViewDialogComponent} from '../../../+form/dialogs/print-view/print-view-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class PrintViewPlugin extends Plugin {
  id = 'plugin.printView';
  _name = 'Print View Plugin';
  defaultActive = true;

  constructor(private toolbarService: FormToolbarService,
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
    const buttons = [
      { id: 'toolBtnCopyCutSeparator', pos: 60, isSeparator: true },
      { id: 'toolBtnPrint', tooltip: 'Print', cssClasses: 'print', eventId: 'PRINT', pos: 70, active: false }
    ];
    buttons.forEach((button, index) => this.toolbarService.addButton(button));

    // react on event when button is clicked
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'PRINT') {
        console.log('print');
        this.showPrintDialog();
      }
    });

    this.formService.selectedDocuments$.subscribe( data => {
      this.toolbarService.setButtonState(
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
