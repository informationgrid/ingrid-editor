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
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  ChipDialogComponent,
  ChipDialogData,
} from "./chip-dialog/chip-dialog.component";
import { ReactiveFormsModule, UntypedFormControl } from "@angular/forms";
import {
  ConfirmDialogComponent,
  ConfirmDialogData,
} from "../../../dialogs/confirm/confirm-dialog.component";
import { BehaviorSubject, Observable, Subscription } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { debounceTime, map, startWith } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CodelistQuery } from "../../../store/codelist/codelist.query";
import {
  CodelistService,
  SelectOption,
  SelectOptionUi,
} from "../../../services/codelist/codelist.service";
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
} from "@angular/cdk/drag-drop";
import { FormErrorComponent } from "../../../+form/form-shared/ige-form-error/form-error.component";
import {
  MatChipListbox,
  MatChipOption,
  MatChipRemove,
} from "@angular/material/chips";
import { MatIcon } from "@angular/material/icon";
import { AddButtonComponent } from "../../../shared/add-button/add-button.component";
import { SearchInputComponent } from "../../../shared/search-input/search-input.component";
import { MatAutocomplete } from "@angular/material/autocomplete";
import { MatOption } from "@angular/material/core";
import {
  MatError,
  MatFormField,
  MatHint,
  MatSuffix,
} from "@angular/material/form-field";
import { TranslocoDirective } from "@ngneat/transloco";
import { MatInput } from "@angular/material/input";
import { MatIconButton } from "@angular/material/button";
import { MatSelect } from "@angular/material/select";
import { AsyncPipe } from "@angular/common";
import { CodelistPipe } from "../../../directives/codelist.pipe";

@UntilDestroy()
@Component({
  selector: "ige-repeat-chip",
  templateUrl: "./repeat-chip.component.html",
  styleUrls: ["./repeat-chip.component.scss"],
  standalone: true,
  imports: [
    FormErrorComponent,
    MatChipListbox,
    CdkDropListGroup,
    CdkDropList,
    MatChipOption,
    CdkDrag,
    MatIcon,
    MatChipRemove,
    AddButtonComponent,
    SearchInputComponent,
    MatAutocomplete,
    MatOption,
    MatFormField,
    TranslocoDirective,
    MatInput,
    ReactiveFormsModule,
    MatIconButton,
    MatSuffix,
    MatHint,
    MatError,
    MatSelect,
    AsyncPipe,
    CodelistPipe,
  ],
})
export class RepeatChipComponent extends FieldArrayType implements OnInit {
  inputControl = new UntypedFormControl();

  type: "simple" | "codelist" | "object" = "simple";

  searchSub: Subscription;
  searchResult = new BehaviorSubject<any[]>([]);
  codelistOptions: Observable<SelectOptionUi[]>;
  filteredOptions: Observable<SelectOptionUi[]>;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private snack: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private codelistQuery: CodelistQuery,
  ) {
    super();

    // show error immediately (on publish)
    this.inputControl.setValue("");
    this.inputControl.markAllAsTouched();
  }

  ngOnInit() {
    if (this.props.codelistId) {
      this.type = "codelist";
      this.props.labelField = "label";
      this.codelistOptions = this.codelistQuery
        .selectEntity(this.props.codelistId)
        .pipe(map((codelist) => CodelistService.mapToSelect(codelist)));
    } else if (this.props.restCall) {
      this.type = "object";
      this.inputControl.valueChanges
        .pipe(untilDestroyed(this), startWith(""), debounceTime(300))
        .subscribe((query) => this.search(query));
    }
  }

  search(value) {
    if (!value || value.length === 0) {
      this.searchResult.next([]);
      return;
    }
    this.searchSub?.unsubscribe();
    this.searchSub = this.props
      .restCall(this.http, value)
      .subscribe((result) => {
        this.searchResult.next(result);
      });
    this.cdr.detectChanges();
  }

  openDialog() {
    this.dialog
      .open(ChipDialogComponent, {
        data: <ChipDialogData>{
          options: this.props.options,
          model: this.model,
        },
        hasBackdrop: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.addValuesFromResponse(response);
          this.removeDeselectedValues(response);
          this.cdr.detectChanges();
        }
      });
  }

  private addValuesFromResponse(response) {
    response.forEach((item) =>
      !this.model || this.model.indexOf(item) === -1
        ? this.add(null, item)
        : null,
    );
  }

  /**
   * Remove items not coming from dialog
   * @param response
   */
  private removeDeselectedValues(response) {
    let i = 0;
    while (i < this.model.length) {
      if (response.indexOf(this.model[i]) === -1) {
        this.remove(i);
        // do not increment i, since remove operation manipulates model
      } else {
        i++;
      }
    }
  }

  async addValues(value: string) {
    let duplicates = this.addValueAndDetermineDuplicates(value);

    this.inputControl.setValue("");

    if (duplicates.length > 0) this.handleDuplicates(duplicates);
  }

  addValueObject(value: any) {
    this.inputControl.setValue("");

    const label = value[this.props.labelField];
    const alreadyExists = this.model.some(
      (item) => item[this.props.labelField] == label,
    );
    if (alreadyExists) {
      this.snack.open(`Der Begriff '${label}' existiert bereits`);
      return;
    }

    if (this.type === "codelist") {
      const prepared = new SelectOption(value.value, value.label);
      this.add(null, prepared.forBackend());
    } else {
      this.add(null, value);
    }
  }

  private handleDuplicates(duplicates: any[]) {
    let formattedDuplicates = this.prepareDuplicatesForView(duplicates);
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: "Bitte beachten",
        message:
          "Die Eingabe von " +
          formattedDuplicates +
          " erfolgte mehrfach, wurde aber nur einmal übernommen.",
        buttons: [{ text: "Ok", alignRight: true, emphasize: true }],
      } as ConfirmDialogData,
    });
  }

  private addValueAndDetermineDuplicates(value: string) {
    const duplicates = [];
    value.split(",").forEach((item) => {
      const trimmed = item.trim();
      if (trimmed == "") return;

      if (this.model.indexOf(trimmed) === -1) {
        this.add(null, trimmed);
      } else {
        if (duplicates.indexOf(trimmed) == -1) duplicates.push(trimmed);
      }
    });
    return duplicates;
  }

  private prepareDuplicatesForView(duplicates: any[]) {
    duplicates = duplicates.map((dup) => "'" + dup + "'");
    let formatedDuplicates: string;
    if (duplicates.length == 1) {
      formatedDuplicates = duplicates[0];
    } else {
      formatedDuplicates = duplicates.join(", ").replace(/,([^,]*)$/, " und$1");
    }
    return formatedDuplicates;
  }

  drop(event: CdkDragDrop<any[]>) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }
}
