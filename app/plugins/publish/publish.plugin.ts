import { Plugin } from '../plugin';
import {FormToolbarService} from "../../+form/toolbar/form-toolbar.service";
import {Inject} from "@angular/core";
import {StorageService} from "../../services/storage/storage.service";

export class PublishPlugin extends Plugin {
  id = 'plugin.publish';
  _name = 'Publish Plugin';

  get name() {
    return this._name;
  }

  constructor(@Inject( FormToolbarService ) private formToolbarService: FormToolbarService,
              @Inject( StorageService ) private storageService: StorageService) {
    super();
    this.isActive = true;
  }

  register() {
    super.register();

    console.log( 'register publish plugin' );
    // add button to toolbar for publish action
    this.formToolbarService.addButton( {
      tooltip: 'Publish', cssClasses: 'glyphicon glyphicon-check', eventId: 'PUBLISH'
    } );

    // add event handler when publishing
    // TODO: register to form/storage service to request current form data
    //       how?
    this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === 'PUBLISH') {
        this.publish();
      }
    } );

    // add button to toolbar for revert action
    this.formToolbarService.addButton( {
      tooltip: 'Revert', cssClasses: 'glyphicon glyphicon-step-backward', eventId: 'REVERT'
    } );

    // add event handler for revert
    this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === 'REVERT') {
        this.revert();
      }
    } );

    // add action for button
    // -> add field to document tagging publish state

    // how to display document that it is published or not?
    // -> tree, symbol in formular, which works in all kinds of formulars
    // -> or make view flexible which can be overridden

    // add hook to attach to when action is triggered
  }

  publish() {
    this.storageService.publish();
  }

  revert() {
    this.storageService.revert();
  }

  // presentInDoc() { }

  // presentInTree() { }

}