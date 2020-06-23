import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormlyFieldConfig} from '@ngx-formly/core';
import {FormGroup} from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface FormDialogData {
  fields: FormlyFieldConfig[],
  model: any
}

@Component({
  selector: 'ige-form-dialog',
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.scss']
})
export class FormDialogComponent implements OnInit {

  model: any;
  form = new FormGroup({});

  constructor(@Inject(MAT_DIALOG_DATA) public data: FormDialogData) {
  }

  ngOnInit(): void {
  }

}
