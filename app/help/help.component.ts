import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'help-panel',
  template: require('./help.component.html'),
  styles: [require('./help.component.css')]
})
export class HelpComponent implements OnInit {

  showHelp: boolean = false;
  expanded: boolean = false;

  constructor() {
  }

  ngOnInit() {
  }

}