import {Component, OnInit, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import { FormToolbarService, ToolbarItem, Separator } from './form-toolbar.service';

@Component( {
  selector: 'form-toolbar',
  templateUrl: './form-toolbar.component.html',
  styles: [`
    .mat-toolbar {
      min-height: 38px;
    }
    .mat-toolbar-row, .mat-toolbar-single-row {
      height: 38px;
    }
        .btn { background-color: transparent; }
        .btn.fa { font-size: 16px; }
        .btn:hover { border: #d8d8d8 1px solid; border-radius: 4px; }
        .btn:focus { outline-color: transparent; }
        .btn:disabled:hover { border: transparent 1px solid; color: #777; }
        .btn-toolbar { margin-left: 0; }
        .separator {
          border-left: 1px solid #bbbbbb;
          padding-right: 5px;
          margin-left: 3px;
          height: 14px;
          display: inline-block;
        }
  `]
} )
export class FormToolbarComponent implements OnInit {

  buttons: Array<ToolbarItem|Separator> = [];

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
