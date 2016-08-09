import {Component, OnInit} from '@angular/core';
import {FormToolbarService, ToolbarItem} from './form-toolbar.service';

@Component( {
  moduleId: module.id,
  selector: 'form-toolbar',
  template: require( './form-toolbar.component.html' )
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