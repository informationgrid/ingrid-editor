import {
  Component,
  ElementRef,
  Inject,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CodelistEntry } from "../../../store/codelist/codelist.model";
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
} from "@angular/forms";

@Component({
  selector: "ige-update-codelist",
  templateUrl: "./update-codelist.component.html",
  styleUrls: ["./update-codelist.component.scss"],
})
export class UpdateCodelistComponent implements OnInit {
  @ViewChild("contextCodeListContainer") container: ElementRef;
  fields: any[];
  isNew = true;

  formGroup: UntypedFormGroup;
  private existingIds: string[];

  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { entry: CodelistEntry; ids: string[] },
    private dialogRef: MatDialogRef<UpdateCodelistComponent>,
    private fb: UntypedFormBuilder
  ) {
    this.isNew = data.entry.id === undefined;
    this.fields = Object.keys(data.entry.fields).map((key) => ({
      key: key,
      value: data.entry.fields[key],
    }));
    this.existingIds = data.ids;
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({
      id: this.fb.control(
        {
          value: this.data.entry.id,
          disabled: this.data.entry.id !== undefined,
        },
        this.checkForExistingId()
      ),
      description: this.fb.control(this.data.entry.description),
      data: this.fb.control(this.data.entry.data),
      fields: this.fb.array(
        Object.keys(this.data.entry.fields).map((key) =>
          this.fb.group({
            key: [key],
            value: [this.data.entry.fields[key]],
          })
        )
      ),
    });
  }

  addEntry() {
    this.fields.push({});
    (<UntypedFormArray>this.formGroup.controls.fields).push(
      this.fb.group({ key: [""], value: [""] })
    );
  }

  closeWithResult() {
    const result = this.formGroup.getRawValue();
    result.fields = result.fields.reduce((previousValue, currentValue) => {
      previousValue[currentValue.key] = currentValue.value;
      return previousValue;
    }, {});
    this.dialogRef.close(result);
  }

  removeEntry(index: number) {
    this.fields.splice(index, 1);
    (<UntypedFormArray>this.formGroup.controls.fields).removeAt(index);
  }

  private checkForExistingId(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const alreadyExists = this.existingIds.indexOf(control.value) !== -1;
      return alreadyExists ? { duplicate: { value: control.value } } : null;
    };
  }
}
