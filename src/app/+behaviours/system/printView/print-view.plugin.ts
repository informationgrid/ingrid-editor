import {ComponentFactoryResolver, Injectable, ReflectiveInjector} from '@angular/core';
import {Plugin} from '../../plugin';
import {PrintViewComponent} from './print-view.component';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {ModalService} from '../../../services/modal/modal.service';

@Injectable()
export class PrintViewPlugin extends Plugin {
  id = 'plugin.printView';
  _name = 'Print View Plugin';
  defaultActive = true;

  constructor(private formToolbarService: FormToolbarService,
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
      id: 'toolBtnPrint', tooltip: 'Print', cssClasses: 'glyphicon glyphicon-print', eventId: 'PRINT', active: true
    }, 6);

    // react on event when button is clicked
    this.formToolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'PRINT') {
        console.log('print');
        this.showPrintDialog();
      }
    });
  };

  private showPrintDialog() {
    // show dialog where to copy the dataset(s)
    let factory = this._cr.resolveComponentFactory(PrintViewComponent);

    let providers = ReflectiveInjector.resolve([]);
    const popInjector = ReflectiveInjector.fromResolvedProviders(providers, this.modalService.containerRef.parentInjector);
    this.modalService.containerRef.createComponent(factory, null, popInjector);
  }

  unregister() {
    super.unregister();
  }
}
