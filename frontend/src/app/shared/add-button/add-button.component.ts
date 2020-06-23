import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'ige-add-button',
  templateUrl: './add-button.component.html',
  styleUrls: ['./add-button.component.scss']
})
export class AddButtonComponent implements OnInit {
  @Input() showRequiredError = false;
  @Output() add = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
  }

}
