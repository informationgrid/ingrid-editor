import {Component, forwardRef, Input, ViewChild, Output, EventEmitter} from "@angular/core";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {FieldBase} from "../controls";
import {Modal} from "ng2-modal";
import {FormControlService} from "../../services/form-control.service";

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PartialGenerator),
  multi: true
};


// more info here: http://almerosteyn.com/2016/04/linkup-custom-control-to-ngcontrol-ngmodel
@Component({
  selector: 'partial-generator',
  template: require('./partial-generator.component.html'),
  providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class PartialGenerator implements ControlValueAccessor {

  @Input() form: any;
  @Input() field: FieldBase<string>[];

  @Output() onAddSection = new EventEmitter<any>();

  @ViewChild('addPartial') addPartialModal: Modal;

  types: any[] = [];
  choiceType: string = 'approvalDecisions';

  private _value: any[] = [{}];

  // Placeholders for the callbacks
  private _onTouchedCallback: () => void;

  private _onChangeCallback: (x: any) => void;

  constructor(private qcs: FormControlService) {
  }

  ngAfterViewInit(): any {
    this.field.partials.forEach( part => {
      this.types.push({ label: part.label, id: part.key });
      // this.choiceType = part.useGroupKey;
    });
  }

  // get accessor
  get value(): any {
    return this._value;
  }

  showPartialChoice() {
    this.addPartialModal.open();
  }

  addPartialToForm() {
    // debugger;
    // let partial = this.field.partials.filter( part => part.useGroupKey === this.choiceType );
    //
    // // let clonedPartial: any = Object.assign({}, partial[0]);
    // let additionalFormGroup = this.qcs.toFormGroup(partial);
    // this.form.controls[this.field.key].controls.push(additionalFormGroup);
    this.onAddSection.emit({key: this.field.key, section: this.choiceType});
    this.addPartialModal.close();

  }

  handleChange() {
    this._onChangeCallback(this._value);
  }

  // Set touched on blur
  // noinspection JSUnusedGlobalSymbols
  onTouched() {
    this._onTouchedCallback();
  }

  // From ControlValueAccessor interface
  writeValue(value: any) {
    // if (value instanceof Array) {
    //   this._value = value;
    // } else {
    //   this._value = [{}];
    // }
    if (value instanceof Array) {
      this._value = value;
    } else {
      this._value = [];
    }
  }

  // From ControlValueAccessor interface
  registerOnChange(fn: any) {
    this._onChangeCallback = fn;
  }

  // From ControlValueAccessor interface
  registerOnTouched(fn: any) {
    this._onTouchedCallback = fn;
  }

}