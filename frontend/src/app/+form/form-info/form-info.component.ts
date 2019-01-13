import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'ige-form-info',
  templateUrl: './form-info.component.html',
  styleUrls: ['./form-info.component.css']
})
export class FormInfoComponent implements OnInit {

  @Input() doc;

  constructor() { }

  ngOnInit() {
  }

}
