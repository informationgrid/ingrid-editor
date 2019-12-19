import {Injectable, OnDestroy} from '@angular/core';
import {Plugin} from '../../../+behaviours/plugin';
import {FormToolbarService, Separator, ToolbarItem} from '../../toolbar/form-toolbar.service';
import {PrintViewDialogComponent} from './print-view-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {untilDestroyed} from 'ngx-take-until-destroy';
import {TreeQuery} from '../../../store/tree/tree.query';

@Injectable()
export class PrintViewPlugin extends Plugin implements OnDestroy{
  id = 'plugin.printView';
  _name = 'Print View Plugin';
  defaultActive = true;

  constructor(private toolbarService: FormToolbarService,
              private treeQuery: TreeQuery,
              private dialog: MatDialog) {
    super();
  }

  ngOnDestroy(): void {
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    // add button to toolbar
    const buttons: Array<ToolbarItem | Separator> = [
      { id: 'toolBtnCopyCutSeparator', pos: 60, isSeparator: true },
      { id: 'toolBtnPrint', tooltip: 'Print', matSvgVariable: 'preview', eventId: 'PRINT', pos: 70, active: false }
    ];
    buttons.forEach((button, index) => this.toolbarService.addButton(button));

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
