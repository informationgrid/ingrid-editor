import {Component, OnInit, Inject} from '@angular/core';
import {FormToolbarService} from '../../form/toolbar/form-toolbar.service';
import {FormularService} from '../../services/formular/formular.service';

@Component( {
  template: require( './demo.component.html' )
} )
export class DemoComponent implements OnInit {
  constructor(@Inject( FormToolbarService ) private formToolbarService: FormToolbarService, private formularService: FormularService) {
  }

  ngOnInit() {
  }

  addToolbarButton() {
    this.formToolbarService.addButton( {
      tooltip: 'Demo: Alert Me', cssClasses: 'glyphicon glyphicon-apple', eventId: 'DEMO_ALERT'
    } );

    this.formToolbarService.getEventObserver().subscribe( eventId => {
      console.log( 'demoAlert-handler' );
      if (eventId === 'DEMO_ALERT') {
        alert( 'This is a demo alert.' );
      }
    } );
  }

  addBeforeSaveSubscriber() {
    this.formularService.beforeSave.asObservable().subscribe( data => {
      console.log( 'received data:', data );
      data.errors.push( {error: 'I DID IT!', id: 'someId'} );
    } );
  }
}