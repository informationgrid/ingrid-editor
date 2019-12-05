import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../services/ApiService';

@Component( {
  templateUrl: './iso-view.component.html'
} )
export class IsoViewComponent implements OnInit {

  doc: any;

  constructor(private apiService: ApiService) {
  }

  ngOnInit() {
    // get current document
    /*const currentForm = this.formService.requestFormValues();

    this.getIso(currentForm.value);*/
    this.getIso({_id: 1});
  }

  getIso(doc: any) {
    this.apiService.getIsoDocument( doc._id )
      .subscribe( result => this.doc = result );
  }

}
