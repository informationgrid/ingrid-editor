import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from "@angular/core";
import { MatFormField, MatInput, MatSuffix } from "@angular/material/input";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatIcon } from "@angular/material/icon";
import { ReactiveFormsModule } from "@angular/forms";
import { SelectOptionUi } from "../../../services/codelist/codelist.service";
import { FieldType } from "@ngx-formly/material/form-field";
import { FieldTypeConfig, FormlyFieldProps } from "@ngx-formly/core";
import { AsyncPipe } from "@angular/common";
import { Observable } from "rxjs";
import { startWith, take } from "rxjs/operators";
import { BackendOption } from "../../../store/codelist/codelist.model";

interface UnitInput extends FormlyFieldProps {
  unitOptions: Observable<SelectOptionUi[]>;
}

@Component({
  selector: "ige-unit-input",
  standalone: true,
  imports: [
    MatInput,
    MatSuffix,
    MatFormField,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatIcon,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: "./unit-input.component.html",
  styleUrl: "./unit-input.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitInputComponent
  extends FieldType<FieldTypeConfig<UnitInput>>
  implements OnInit
{
  $unit = signal<string>("");

  ngOnInit(): void {
    this.props.unitOptions.pipe(take(1)).subscribe((options) => {
      const unitValue = this.field.fieldGroup[1].formControl.value;

      this.field.fieldGroup[1].formControl.valueChanges
        .pipe(startWith(unitValue))
        .subscribe((value: BackendOption) => {
          this.updateUnit(
            options.find((option) => option.value === value?.key) ?? options[0],
            false,
          );
        });
    });
  }

  updateUnit(item: SelectOptionUi, shouldEmitEvent: boolean = true) {
    this.$unit.set(item.label);
    this.field.fieldGroup[1].formControl.setValue(item.forBackend(), {
      emitEvent: shouldEmitEvent,
    });
  }
}
