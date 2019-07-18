import { Component, forwardRef, Input, OnInit, TemplateRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

export const LINK_DATASET_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => LinkDatasetComponent),
  multi: true
};

@Component({
  selector: 'link-dataset',
  templateUrl: './link-dataset.component.html',
  providers: [LINK_DATASET_CONTROL_VALUE_ACCESSOR]
})
export class LinkDatasetComponent implements OnInit, ControlValueAccessor {

  @Input() filter: any;

  linkedDataset: any = {};
  private selection: any = {};

  private _onChangeCallback: (x: any) => void;

  constructor(private dialog: MatDialog) {
  }

  ngOnInit() {
  }

  openDialog(ref: TemplateRef<any>) {
    // TODO: this.chooseDatasetModalRef = this.modalService.show( ref );
  }

  selectDataset() {
    this.linkedDataset = this.mapToLinkedDataset( this.selection );
    this._onChangeCallback(this.linkedDataset);
  }

  onSelected(val: any) {
    this.selection = val;
  }

  writeValue(obj: any): void {
    if (obj) {
      this.linkedDataset = obj;
    } else {
      this.linkedDataset = null;
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }

  private mapToLinkedDataset(selection: any) {
    return {
      _id: selection.id,
      title: selection.title
    };
  }
}
