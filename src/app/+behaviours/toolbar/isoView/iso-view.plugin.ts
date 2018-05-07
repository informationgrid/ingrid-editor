import { Injectable } from '@angular/core';
import { Plugin } from '../../plugin';
import { FormToolbarService } from '../../../+form/toolbar/form-toolbar.service';
import { IsoViewComponent } from './iso-view.component';
import { FormularService } from '../../../services/formular/formular.service';
import { MatDialog } from '@angular/material';

@Injectable()
export class IsoViewPlugin extends Plugin {
  id = 'plugin.isoView';
  _name = 'Iso View Plugin';
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
      id: 'toolBtnIso', tooltip: 'ISO Ansicht', cssClasses: 'remove_red_eye', eventId: 'ISO', active: false
    }, 7);

    // react on event when button is clicked
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'ISO') {
        this.showISODialog();
      }
    });

    this.formService.selectedDocuments$.subscribe( data => {
      this.formToolbarService.setButtonState(
        'toolBtnIso',
        data.length === 1 && data[0].profile.startsWith('ISO') );
    } );
  };

  private showISODialog() {
    // show dialog where to copy the dataset(s)
    this.dialog.open(IsoViewComponent);
  }

  unregister() {
    super.unregister();
  }
}
