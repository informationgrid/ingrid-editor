import {Component, OnInit} from '@angular/core';
import {FormularService} from '../+form/formular.service';

@Component({
  templateUrl: './fields.component.html'
})
export class FieldsComponent implements OnInit {

  fields: any;

  constructor(private formularService: FormularService) {
  }

  ngOnInit() {
    this.fields = this.formularService.getFields('UVP');
  }

}
