import {Component, OnInit} from '@angular/core';
import {FormToolbarService, Separator, ToolbarItem} from './form-toolbar.service';

@Component({
  selector: 'form-toolbar',
  templateUrl: './form-toolbar.component.html',
  styleUrls: ['./form-toolbar.component.scss']
})
export class FormToolbarComponent implements OnInit {

  buttons_left: Array<ToolbarItem | Separator> = [];
  buttons_right: Array<ToolbarItem | Separator> = [];

  menu = {};

  constructor(private formToolbarService: FormToolbarService) {
    formToolbarService.toolbar$.subscribe(() => {
      this.buttons_left = this.formToolbarService.buttons.filter(b => b.align !== 'right');
      this.buttons_right = this.formToolbarService.buttons.filter(b => b.align === 'right');
    });
  }

  ngOnInit() {
    console.log('init toolbar');
    this.buttons_left = this.formToolbarService.buttons.filter(b => b.align !== 'right');
    this.buttons_right = this.formToolbarService.buttons.filter(b => b.align === 'right');
  }

  sendEvent(id: string) {
    this.formToolbarService.sendEvent(id);
  }

}
