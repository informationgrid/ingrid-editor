import {Component, OnInit} from '@angular/core';
import {FormularService} from '../services/formular/formular.service';

@Component({
  template: require('./fields.component.html')
})
export class FieldsComponent implements OnInit {

  fields: any;

  constructor(private formularService: FormularService) {
  }

  ngOnInit() {
    this.fields = this.formularService.getFields('UVP');
  }

}