import {Component, OnInit, ViewChild} from '@angular/core';
import {Modal} from 'ngx-modal';
import {FormularService} from '../../../services/formular/formular.service';

@Component({
  template: require('./print-view.component.html')
})
export class PrintViewComponent implements OnInit {

  @ViewChild('printViewModal') printViewModal: Modal;

  profile: any[] = null;

  doc: any = null;

  constructor(private formService: FormularService) {
  }

  ngOnInit() {

    this.printViewModal.open();

    // get current document
    let currentForm = this.formService.requestFormValues();
    this.doc = currentForm.value;

    // get profile model of current document
    this.profile = currentForm.fields;

  }

}