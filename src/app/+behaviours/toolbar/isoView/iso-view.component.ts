import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormularService} from '../../../services/formular/formular.service';
import {ApiService} from '../../../services/ApiService';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component( {
  templateUrl: './iso-view.component.html'
} )
export class IsoViewComponent implements OnInit {

  @ViewChild( 'isoViewModal' ) isoViewModal: TemplateRef<any>;

  profile: any[] = null;

  doc: any = null;
  private isoViewModalRef: BsModalRef;

  constructor(private modalService: BsModalService, private formService: FormularService, private apiService: ApiService) {
  }

  ngOnInit() {

    this.isoViewModalRef = this.modalService.show(this.isoViewModal, {class: 'modal-lg'});

    // get current document
    let currentForm = this.formService.requestFormValues();

    // get profile model of current document
    this.profile = currentForm.fields;

    this.getIso(currentForm.value);

  }

  getIso(doc: any) {
    this.apiService.getIsoDocument( doc._id )
      .subscribe( result => this.doc = result );
  }

}
