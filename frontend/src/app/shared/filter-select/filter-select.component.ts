/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { combineLatest, Observable } from "rxjs";
import { filter, map, startWith } from "rxjs/operators";
import { SelectOptionUi } from "../../services/codelist/codelist.service";

@Component({
  selector: "ige-filter-select",
  templateUrl: "./filter-select.component.html",
  styleUrls: ["./filter-select.component.scss"],
})
export class FilterSelectComponent implements OnInit {
  @Input() options: Observable<SelectOptionUi[]>;
  @Input() labelFormat: (value: SelectOptionUi) => string = (value) =>
    value.label;
  @Input() placeholder: string;
  @Input() hintText: string;

  @Output() optionSelect = new EventEmitter<SelectOptionUi>();
  @Output() reset = new EventEmitter<string>();

  @ViewChild("filter") filter: ElementRef;

  control = new UntypedFormControl();

  filteredOptions: Observable<SelectOptionUi[]>;
  private selectedValue: SelectOptionUi;

  constructor() {}

  ngOnInit(): void {
    this.filteredOptions = combineLatest([
      this.control.valueChanges.pipe(startWith("")),
      this.options,
    ]).pipe(
      // only filter input strings and selections
      filter((value) => !(value[0] instanceof Object)),
      map((value) => this._filter(value[0], value[1])),
    );
  }

  private _filter(
    value: string,
    allCodelists: SelectOptionUi[],
  ): SelectOptionUi[] {
    const filterValue = value.toLowerCase();

    return allCodelists.filter((option) =>
      this.labelFormat(option).toLowerCase().includes(filterValue),
    );
  }

  resetInput() {
    this.control.reset("");
    this.reset.emit();
    setTimeout(() => this.filter.nativeElement.blur());
  }

  updateSelection(value: SelectOptionUi) {
    this.control.setValue(this.labelFormat(value));
    // TODO: blur control html element for easier selection?
    this.selectedValue = value;
    this.optionSelect.emit(value);
  }

  getSelectedValue() {
    return this.selectedValue;
  }
}
