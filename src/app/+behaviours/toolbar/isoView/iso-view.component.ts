import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormularService } from '../../../services/formular/formular.service';
import { ApiService } from '../../../services/ApiService';
import { MatDialog } from '@angular/material';

@Component( {
  templateUrl: './iso-view.component.html'
} )
export class IsoViewComponent implements OnInit {

  @ViewChild( 'isoViewModal' ) isoViewModal: TemplateRef<any>;

  doc: any;

  constructor(private dialog: MatDialog, private formService: FormularService, private apiService: ApiService) {
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
