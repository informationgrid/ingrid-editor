import { Component, OnInit } from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'ige-address',
  templateUrl: './address.component.html',
  styleUrls: ['./address.component.scss']
})
export class AddressComponent implements OnInit {
  sidebarWidth = 20;
  form = new FormGroup({});
  fields: any;
  model: any;
  formOptions: any;

  constructor() { }

  ngOnInit() {
  }

  rememberSizebarWidth($event: any) {

  }
}
