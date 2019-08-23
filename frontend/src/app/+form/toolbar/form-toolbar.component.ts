import {Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {FormToolbarService, ToolbarItem, Separator} from './form-toolbar.service';

@Component({
  selector: 'form-toolbar',
  templateUrl: './form-toolbar.component.html',
  styleUrls: ['./form-toolbar.component.scss']
})
export class FormToolbarComponent implements OnInit {

  buttons: Array<ToolbarItem | Separator> = [];

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
