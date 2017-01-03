import {Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FormToolbarService, ToolbarItem} from './form-toolbar.service';

@Component( {
  selector: 'form-toolbar',
  template: require( './form-toolbar.component.html' ),
  styles: [`
        .btn { background-color: transparent; }
        .btn:hover { border: #d8d8d8 1px solid; border-radius: 4px; }
        .btn-toolbar { margin-left: 0; }
        .separator { border-left: 1px solid #bbbbbb; padding-right: 5px; margin-left: 5px; height: 35px; }
  `]
} )
export class FormToolbarComponent implements OnInit {

  buttons: ToolbarItem[] = [];

  constructor(private formToolbarService: FormToolbarService) {
    formToolbarService.toolbar$.subscribe(() => {
      this.buttons = this.formToolbarService.buttons;
    });
  }

  ngOnInit() {
    this.buttons = this.formToolbarService.buttons;
  }

  sendEvent(id: string) {
    this.formToolbarService.sendEvent(id);
  }

}