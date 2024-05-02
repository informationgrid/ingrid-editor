/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
import {
  SelectOption,
  SelectOptionUi,
} from "../../../services/codelist/codelist.service";
import { FieldType } from "@ngx-formly/material/form-field";
import { FieldTypeConfig, FormlyFieldProps } from "@ngx-formly/core";
import { AsyncPipe } from "@angular/common";
import { Observable, of } from "rxjs";
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
  $options = signal<SelectOptionUi[]>([]);

  ngOnInit(): void {
    let options = this.props.unitOptions;
    if (!(options instanceof Observable)) options = of(options);

    options.pipe(take(1)).subscribe((opts) => {
      const unitValue = this.field.fieldGroup[1].formControl.value;
      this.$options.set(opts);

      this.field.fieldGroup[1].formControl.valueChanges
        .pipe(startWith(unitValue))
        .subscribe((value: BackendOption) => {
          this.updateUnit(
            opts.find((option) => option.value === value?.key) ?? opts[0],
            false,
          );
        });
    });
  }

  updateUnit(item: SelectOptionUi, shouldEmitEvent: boolean = true) {
    this.$unit.set(item.label);
    this.field.fieldGroup[1].formControl.setValue(
      item.forBackend
        ? item.forBackend()
        : new SelectOption(item.value, item.label).forBackend(),
      {
        emitEvent: shouldEmitEvent,
      },
    );
  }
}
