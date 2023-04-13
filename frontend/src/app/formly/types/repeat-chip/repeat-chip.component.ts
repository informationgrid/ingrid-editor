import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { FieldArrayType } from "@ngx-formly/core";
import { MatDialog } from "@angular/material/dialog";
import {
  ChipDialogComponent,
  ChipDialogData,
} from "./chip-dialog/chip-dialog.component";
import { UntypedFormControl } from "@angular/forms";
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

@UntilDestroy()
@Component({
  selector: "ige-repeat-chip",
  templateUrl: "./repeat-chip.component.html",
  styleUrls: ["./repeat-chip.component.scss"],
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
    private codelistQuery: CodelistQuery
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
        restoreFocus: true,
        hasBackdrop: true,
      })
      .afterClosed()
      .subscribe((response) => {
        if (response) {
          this.addValuesFromResponse(response);
          this.removeDeselectedValues(response);
        }
      });
  }

  private addValuesFromResponse(response) {
    response.forEach((item) =>
      !this.model || this.model.indexOf(item) === -1
        ? this.add(null, item)
        : null
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
    if (this.props.preprocessValues) {
      value = await this.props.preprocessValues(
        this.http,
        this.options.formState.mainModel,
        value
      );
      console.log("after preprocess");
      this.options.formState.updateModel();
    }

    let duplicates = this.addValueAndDetermineDuplicates(value);

    this.inputControl.setValue("");

    if (duplicates.length > 0) this.handleDuplicates(duplicates);
  }

  addValueObject(value: any) {
    this.inputControl.setValue("");

    const label = value[this.props.labelField];
    const alreadyExists = this.model.some(
      (item) => item[this.props.labelField] == label
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

  drop(event: { previousIndex: number; currentIndex: number }) {
    const item = this.model[event.previousIndex];
    this.remove(event.previousIndex);
    this.add(event.currentIndex, item);
  }
}
