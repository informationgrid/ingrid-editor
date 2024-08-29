/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
  Component,
  computed,
  ElementRef,
  EventEmitter,
  input,
  Output,
  ViewChild,
} from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SelectOptionUi } from "../../services/codelist/codelist.service";
import { toSignal } from "@angular/core/rxjs-interop";
import { MatFormField, MatHint, MatSuffix } from "@angular/material/form-field";
import { MatInput } from "@angular/material/input";
import {
  MatAutocomplete,
  MatAutocompleteTrigger,
} from "@angular/material/autocomplete";
import { MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatOption } from "@angular/material/core";

@Component({
  selector: "ige-filter-select",
  templateUrl: "./filter-select.component.html",
  styleUrls: ["./filter-select.component.scss"],
  standalone: true,
  imports: [
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatAutocompleteTrigger,
    MatIconButton,
    MatSuffix,
    MatIcon,
    MatAutocomplete,
    MatOption,
    MatHint,
  ],
})
export class FilterSelectComponent {
  options = input.required<SelectOptionUi[]>();
  placeholder = input<string>();
  hintText = input<string>();

  @Output() optionSelect = new EventEmitter<SelectOptionUi>();
  @Output() reset = new EventEmitter<string>();

  @ViewChild("filter") filter: ElementRef;

  control = new FormControl<string>("");
  controlValue = toSignal(this.control.valueChanges, { initialValue: "" });

  filteredOptions = computed(() =>
    this._filter(this.controlValue(), this.options()),
  );

  constructor() {}

  private _filter(
    value: string,
    allCodelists: SelectOptionUi[],
  ): SelectOptionUi[] {
    const filterValue = value.toLowerCase();

    return (
      allCodelists?.filter((option) =>
        option.label.toLowerCase().includes(filterValue),
      ) ?? []
    );
  }

  resetInput() {
    this.control.reset("");
    this.reset.emit();
    setTimeout(() => this.filter.nativeElement.blur());
  }

  updateSelection(value: SelectOptionUi) {
    this.control.setValue(value.label);
    // TODO: blur control html element for easier selection?
    this.optionSelect.emit(value);
  }
}
