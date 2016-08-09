import {Component, OnInit, Inject} from '@angular/core';
import {FormToolbarService} from '../../form/toolbar/form-toolbar.service';

@Component( {
  template: require( './demo.component.html' )
} )
export class DemoComponent implements OnInit {
  constructor(@Inject( FormToolbarService ) private formToolbarService: FormToolbarService) {
  }

  ngOnInit() {
  }

  addToolbarButton() {
    this.formToolbarService.addButton( {
      tooltip: 'Demo: Alert Me', cssClasses: 'glyphicon glyphicon-apple', eventId: 'DEMO_ALERT'
    } );

    this.formToolbarService.toolbarEvent$.subscribe( eventId => {
      if (eventId === 'DEMO_ALERT') {
        alert( 'This is a demo alert.' );
      }
    } );
  }
}