import {
  ComponentFactoryResolver, Inject, Injector, Provider, ReflectiveInjector
} from '@angular/core';
import {Subscription} from 'rxjs';
import {FormularService} from '../../../services/formular/formular.service';
import {StorageService} from '../../../services/storage/storage.service';
import {Plugin} from '../../plugin';
import {FormToolbarService} from "../../../+form/toolbar/form-toolbar.service";
import {ToastService} from '../../../services/toast.service';
import {UpdateType} from '../../../models/update-type.enum';
import {ModalService} from '../../../services/modal/modal.service';
import {PasteDialogComponent} from './paste-dialog.component';

export class CopyCutPastePlugin extends Plugin {
  id = 'plugin.copy.cut.paste';
  _name = 'Copy Cut Paste';
  defaultActive = false;

  description = `
    Diese Regeln beschreiben das Kopieren, Ausschneiden und Einfügen von Datensätzen.
  `;
  subscription: Subscription;

  copiedDatasets: string[] = [];
  cutDatasets: string[] = [];

  get name() {
    return this._name;
  }

  constructor(@Inject(FormularService) private formService: FormularService,
              @Inject(FormToolbarService) private toolbarService: FormToolbarService,
              @Inject(StorageService) private storageService: StorageService,
              @Inject(ModalService) private modalService: ModalService,
              @Inject(ToastService) private toastService: ToastService,
              @Inject(ComponentFactoryResolver) private _cr: ComponentFactoryResolver) {
    super();
  }

  register() {
    super.register();

    this.subscription = this.storageService.afterLoadAndSet$.subscribe(data => {

      this.toolbarService.setButtonState('COPY', true);
      this.toolbarService.setButtonState('CUT', true);
    });

    // add event handler for revert
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'COPY') {
        this.handleEvent(UpdateType.Copy);
        this.copy();
      } else if (eventId === 'CUT') {
      } else if (eventId === 'PASTE') {
        this.handleEvent(UpdateType.Paste);
        this.paste();
      }
    });
  }

  private handleEvent(type: UpdateType) {
    this.storageService.datasetsChanged.next({
      type: type,
      data: null
    });
  }

  copy() {
    // remove last remembered copied documents
    this.copiedDatasets = this.formService.getSelectedDocuments();
    // this.toolbarService.setButtonState('PASTE', true);

    this.toastService.show('Datensatz kopiert');

    // TODO: show dialog where to copy the dataset(s)
    let factory = this._cr.resolveComponentFactory(PasteDialogComponent);

    let providers = ReflectiveInjector.resolve([
      {provide: 'moveMode', useValue: false }
    ]);
    const popInjector = ReflectiveInjector.fromResolvedProviders(providers, this.modalService.containerRef.parentInjector);
    this.modalService.containerRef.createComponent(factory, null, popInjector); //, null);
  }

  paste() {
    // TODO: add subtree pasting
    let dest = this.formService.getSelectedDocuments()[0];
    let includeTree = false;
    // let dest = null;
    let result = null;
    if (this.copiedDatasets.length > 0) {
      result = this.storageService.copyDocuments(this.copiedDatasets, dest, includeTree);
    } else if (this.cutDatasets.length > 0) {
      result = this.storageService.moveDocuments(this.cutDatasets, dest, includeTree);

    }

    result.subscribe(
      () => this.handleAfterPaste(),
      (err) => this.modalService.showError(err)
    );
  }

  private handleAfterPaste() {
    // this.toolbarService.setButtonState('PASTE', false);
    this.toastService.show('Datensatz eingefügt');
  }

  unregister() {
    super.unregister();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}