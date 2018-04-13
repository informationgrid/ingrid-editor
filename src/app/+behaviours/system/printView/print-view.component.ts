import {Component, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {FormularService} from '../../../services/formular/formular.service';
import { MatDialog } from '@angular/material';

@Component({
  templateUrl: './print-view.component.html'
})
export class PrintViewComponent implements OnInit {

  @ViewChild('printViewModal') printViewModal: TemplateRef<any>;

  profile: any[] = null;

  doc: any = null;

  constructor(private dialog: MatDialog, private formService: FormularService) {
  }

  ngOnInit() {

    // get current document
    const currentForm = this.formService.requestFormValues();
    this.doc = currentForm.value;

    // get profile model of current document
    this.profile = currentForm.fields;

  }

}
