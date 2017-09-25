import {Component, OnInit, forwardRef, ViewChild, Input, TemplateRef} from '@angular/core';
import {NG_VALUE_ACCESSOR, ControlValueAccessor} from "@angular/forms";
import {BsModalRef, BsModalService} from 'ngx-bootstrap';

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

  @ViewChild('chooseDatasetModal') chooseDatasetModal: TemplateRef<any>;
  private chooseDatasetModalRef: BsModalRef;


  constructor(private modalService: BsModalService) {
  }

  ngOnInit() {
  }

  selectDataset() {
    this.linkedDataset = this.selection;
    this.chooseDatasetModalRef.hide();
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
