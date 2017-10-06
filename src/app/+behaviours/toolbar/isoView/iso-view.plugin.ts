import {ComponentFactoryResolver, Injectable, ReflectiveInjector} from '@angular/core';
import {Plugin} from '../../plugin';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';
import {IsoViewComponent} from './iso-view.component';
import {FormularService} from '../../../services/formular/formular.service';

@Injectable()
export class IsoViewPlugin extends Plugin {
  id = 'plugin.isoView';
  _name = 'Iso View Plugin';
  defaultActive = true;

  constructor(private formToolbarService: FormToolbarService,
              private formService: FormularService,
              private modalService: ModalService,
              private _cr: ComponentFactoryResolver) {
    super();
  }

  get name() {
    return this._name;
  }

  register() {
    super.register();

    // add button to toolbar
    this.formToolbarService.addButton({
      id: 'toolBtnIso', tooltip: 'ISO Ansicht', cssClasses: 'fa fa-eye', eventId: 'ISO', active: false
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
        data.length === 1 && data[0].profile === 'ISO' );
    } );
  };

  private showISODialog() {
    // show dialog where to copy the dataset(s)
    const factory = this._cr.resolveComponentFactory(IsoViewComponent);

    const providers = ReflectiveInjector.resolve([]);
    const popInjector = ReflectiveInjector.fromResolvedProviders(providers, this.modalService.containerRef.parentInjector);
    this.modalService.containerRef.createComponent(factory, null, popInjector);
  }

  unregister() {
    super.unregister();
  }
}
