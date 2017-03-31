import {Component, OnInit, Inject} from '@angular/core';
import {FormToolbarService} from '../../../+form/toolbar/form-toolbar.service';
import {StorageService} from '../../../services/storage/storage.service';

@Component( {
  template: require( './demo.component.html' )
} )
export class DemoComponent implements OnInit {
  constructor(@Inject( FormToolbarService ) private formToolbarService: FormToolbarService, private storageService: StorageService) {
  }

  ngOnInit() {
  }

  addToolbarButton() {
    this.formToolbarService.addButton( {
      id: 'toolBtnDemo', tooltip: 'Demo: Alert Me', cssClasses: 'glyphicon glyphicon-apple', eventId: 'DEMO_ALERT'
    } );

    this.formToolbarService.getEventObserver().subscribe( eventId => {
      console.log( 'demoAlert-handler' );
      if (eventId === 'DEMO_ALERT') {
        alert( 'This is a demo alert.' );
      }
    } );
  }

  addBeforeSaveSubscriber() {
    this.storageService.beforeSave.asObservable().subscribe( data => {
      console.log( 'received data:', data );
      data.errors.push( {error: 'I DID IT!', id: 'someId'} );
    } );
  }
}