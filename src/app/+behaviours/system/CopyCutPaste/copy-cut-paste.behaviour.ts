import { ComponentFactoryResolver, Injectable, ReflectiveInjector } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { FormularService } from '../../../services/formular/formular.service';
import { StorageService } from '../../../services/storage/storage.service';
import { Plugin } from '../../plugin';
import { FormToolbarService, Separator, ToolbarItem } from '../../../+form/toolbar/form-toolbar.service';
import { UpdateType } from '../../../models/update-type.enum';
import { ModalService } from '../../../services/modal/modal.service';
import { PasteDialogComponent } from './paste-dialog.component';
import { CopyMoveEnum, MoveMode, PasteCallback } from './enums';

@Injectable()
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

  constructor(private formService: FormularService,
              // private messageService: MessageService,
              private toolbarService: FormToolbarService,
              private storageService: StorageService,
              private modalService: ModalService,
              private _cr: ComponentFactoryResolver) {
    super();
  }

  register() {
    super.register();

    const buttons: Array<ToolbarItem | Separator> = [
      {id: 'toolBtnCopy', tooltip: 'Copy', cssClasses: 'content_copy', eventId: 'COPY', active: false},
      {id: 'toolBtnCut', tooltip: 'Cut', cssClasses: 'content_cut', eventId: 'CUT', active: false},
      {id: 'toolBtnCopyCutSeparator', isSeparator: true}
    ];
    buttons.forEach((button, index) => this.toolbarService.addButton(button, index + 3));

    this.subscription = this.storageService.afterLoadAndSet$.subscribe((data) => {

      if (data === null) {
        return;
      }

      this.toolbarService.setButtonState('toolBtnCopy', true);
      this.toolbarService.setButtonState('toolBtnCut', true);
    });

    // add event handler for revert
    this.toolbarService.toolbarEvent$.subscribe(eventId => {
      if (eventId === 'COPY') {
        this.handleEvent(UpdateType.Copy);
        this.copy();
      } else if (eventId === 'CUT') {
        this.cut();
      }
    });

    // set button state according to selected documents
    this.formService.selectedDocuments$.subscribe(data => {
      if (data.length === 0) {
        // handleButtonState( data[0] );
        this.toolbarService.setButtonState('toolBtnCopy', false);
        this.toolbarService.setButtonState('toolBtnCut', false);
      } else {
        this.toolbarService.setButtonState('toolBtnCopy', true);
        this.toolbarService.setButtonState('toolBtnCut', true);
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
    this.copiedDatasets = this.formService.getSelectedDocuments().map(doc => doc.id);

    // show dialog where to copy the dataset(s)
    const factory = this._cr.resolveComponentFactory(PasteDialogComponent);

    const providers = ReflectiveInjector.resolve([
      {provide: MoveMode, useValue: {mode: CopyMoveEnum.COPY}},
      {provide: PasteCallback, useValue: this.paste.bind(this)}
    ]);
    const popInjector = ReflectiveInjector.fromResolvedProviders(providers, this.modalService.containerRef.parentInjector);
    this.modalService.containerRef.createComponent(factory, null, popInjector);
  }

  cut() {
    // remove last remembered copied documents
    this.cutDatasets = this.formService.getSelectedDocuments().map(doc => doc.id);

    // show dialog where to copy the dataset(s)
    const factory = this._cr.resolveComponentFactory(PasteDialogComponent);

    const providers = ReflectiveInjector.resolve([
      {provide: MoveMode, useValue: {mode: CopyMoveEnum.MOVE}},
      {provide: PasteCallback, useValue: this.paste.bind(this)}
    ]);
    const popInjector = ReflectiveInjector.fromResolvedProviders(providers, this.modalService.containerRef.parentInjector);
    this.modalService.containerRef.createComponent(factory, null, popInjector);
  }

  paste(targetNode: any, mode: CopyMoveEnum) {
    console.log('is paste');
    // TODO: add subtree pasting
    const dest = targetNode[0].id;
    const includeTree = false;

    let result = null;
    if (mode === CopyMoveEnum.COPY) {
      result = this.storageService.copyDocuments(this.copiedDatasets, dest, includeTree);
    } else {
      result = this.storageService.moveDocuments(this.cutDatasets, dest, includeTree);

    }

    result.subscribe(
      () => this.handleAfterPaste(),
      (err) => this.modalService.showError(err)
    );
  }

  private handleAfterPaste() {
    // TODO: this.messageService.add({severity: 'success', summary: 'Datensatz eingefügt'});
  }

  unregister() {
    super.unregister();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // remove from same index since buttons take the neighbor place after deletion
    this.toolbarService.removeButton('toolBtnCopy');
    this.toolbarService.removeButton('toolBtnCut');
    this.toolbarService.removeButton('toolBtnCopyCutSeparator');
  }
}
