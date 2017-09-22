import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormularService} from '../../../services/formular/formular.service';
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

@Component({
  templateUrl: './print-view.component.html'
})
export class PrintViewComponent implements OnInit {

  @ViewChild('printViewModal') printViewModal: TemplateRef<any>;

  private printViewModalRef: BsModalRef;

  profile: any[] = null;

  doc: any = null;

  constructor(private modalService: BsModalService, private formService: FormularService) {
  }

  ngOnInit() {

    setTimeout( () => this.printViewModalRef = this.modalService.show(this.printViewModal) );

    // get current document
    let currentForm = this.formService.requestFormValues();
    this.doc = currentForm.value;

    // get profile model of current document
    this.profile = currentForm.fields;

  }

}
