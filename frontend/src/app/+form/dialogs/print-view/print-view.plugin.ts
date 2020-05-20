import {Injectable} from '@angular/core';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../form-shared/toolbar/form-toolbar.service';
import {PrintViewDialogComponent} from './print-view-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {TreeQuery} from '../../../store/tree/tree.query';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {AddressTreeQuery} from '../../../store/address-tree/address-tree.query';

@UntilDestroy()
@Injectable()
export class PrintViewPlugin extends Plugin {
  id = 'plugin.printView';
  _name = 'Print View Plugin';
  defaultActive = true;
  private treeQuery: TreeQuery | AddressTreeQuery;

  constructor(private toolbarService: FormToolbarService,
              private docTreeQuery: TreeQuery,
              private addressTreeQuery: AddressTreeQuery,
              private dialog: MatDialog) {
    super();
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    // add button to toolbar
    const buttons: Array<ToolbarItem | Separator> = [
      // { id: 'toolBtnCopyCutSeparator', pos: 60, isSeparator: true },
      {id: 'toolBtnPrint', tooltip: 'Vorschau', matSvgVariable: 'Vorschau-Druckansicht', eventId: 'PRINT', pos: 20, active: false}
    ];
    buttons.forEach((button, index) => this.toolbarService.addButton(button));

    this.treeQuery = this.forAddress ? this.addressTreeQuery : this.docTreeQuery;

    // react on event when button is clicked
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'PRINT') {
        console.log('print');
        this.showPrintDialog();
      }
    });

    this.treeQuery.openedDocument$
      .pipe(untilDestroyed(this))
      .subscribe((openedDoc) => {
        this.toolbarService.setButtonState(
          'toolBtnPrint', openedDoc !== null
        );
      });

  };

  private showPrintDialog() {
    this.dialog.open(PrintViewDialogComponent);
  }

  unregister() {
    super.unregister();
  }
}
