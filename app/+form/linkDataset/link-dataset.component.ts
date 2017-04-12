import {Component, OnInit, forwardRef, ViewChild, Input} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {Modal} from "ngx-modal";

export const LINK_DATASET_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => LinkDatasetComponent),
  multi: true
};

@Component({
  selector: 'link-dataset',
  template: require('./link-dataset.component.html'),
  providers: [LINK_DATASET_CONTROL_VALUE_ACCESSOR]
})
export class LinkDatasetComponent implements OnInit, ControlValueAccessor {

  @Input() filter: any;

  private linkedDataset: any = {};
  private selection: any = {};

  private _onChangeCallback: (x: any) => void;

  @ViewChild('chooseDatasetModal') chooseDatasetModal: Modal;


  constructor() {
  }

  ngOnInit() {
  }

  selectDataset() {
    this.linkedDataset = this.selection;
    this.chooseDatasetModal.close();
    this._onChangeCallback(this.linkedDataset);
  }

  onSelected(val: any) {
    this.selection = val;
  }

  writeValue(obj: any): void {
    if (obj) {
      this.linkedDataset = obj;
    }
  }

  registerOnChange(fn: any): void {
    this._onChangeCallback = fn;
  }

  registerOnTouched(fn: any): void {
  }
}
