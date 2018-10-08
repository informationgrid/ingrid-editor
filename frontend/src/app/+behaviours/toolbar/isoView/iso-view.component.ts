import { Component, OnInit } from '@angular/core';
import { FormularService } from '../../../services/formular/formular.service';
import { ApiService } from '../../../services/ApiService';

@Component( {
  templateUrl: './iso-view.component.html'
} )
export class IsoViewComponent implements OnInit {

  doc: any;

  constructor(private formService: FormularService, private apiService: ApiService) {
  }

  ngOnInit() {
    // get current document
    const currentForm = this.formService.requestFormValues();

    this.getIso(currentForm.value);
  }

  getIso(doc: any) {
    this.apiService.getIsoDocument( doc._id )
      .subscribe( result => this.doc = result );
  }

}
