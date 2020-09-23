import {Injectable} from '@angular/core';
import {Plugin} from '../../../+catalog/+behaviours/plugin';
import {FormToolbarService} from '../../form-shared/toolbar/form-toolbar.service';
import {IsoViewComponent} from './iso-view.component';
import {MatDialog} from '@angular/material/dialog';

@Injectable()
export class IsoViewPlugin extends Plugin {
  id = 'plugin.isoView';
  _name = 'Iso View Plugin';
  defaultActive = true;

  constructor(private formToolbarService: FormToolbarService,
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
      id: 'toolBtnIso', tooltip: 'ISO Ansicht', matIconVariable: 'remove_red_eye', eventId: 'ISO', pos: 80, active: false
    });

    // react on event when button is clicked
    const toolbarEventSubscription = this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'ISO') {
        this.showISODialog();
      }
    });

/*
    this.formService.selectedDocuments$.subscribe( data => {
      this.formToolbarService.setButtonState(
        'toolBtnIso',
        data.length === 1 && data[0]._type.startsWith('ISO') );
    } );
*/

    this.subscriptions.push(toolbarEventSubscription);
  };

  private showISODialog() {
    // show dialog where to copy the dataset(s)
    this.dialog.open(IsoViewComponent);
  }

  unregister() {
    super.unregister();

    this.formToolbarService.removeButton('toolBtnIso');
  }
}
