import {Component, OnInit, ViewChild} from '@angular/core';
import {Modal} from 'ngx-modal';
import {FormularService} from '../../../services/formular/formular.service';
import {ApiService} from '../../../services/ApiService';

@Component( {
  templateUrl: './iso-view.component.html'
} )
export class IsoViewComponent implements OnInit {

  @ViewChild( 'isoViewModal' ) isoViewModal: Modal;

  profile: any[] = null;

  doc: any = null;

  constructor(private formService: FormularService, private apiService: ApiService) {
  }

  ngOnInit() {

    this.isoViewModal.open();

    // get current document
    let currentForm = this.formService.requestFormValues();
    this.doc = currentForm.value;

    // get profile model of current document
    this.profile = currentForm.fields;

    this.getIso();

  }

  getIso() {
    this.apiService.getIsoDocument( this.doc._id )
      .subscribe( result => this.doc = result );
  }

}
