/*
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  signal,
  computed,
} from "@angular/core";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from "@angular/material/dialog";
import { CodelistService } from "../../../services/codelist/codelist.service";
import { FreeEntry } from "../../../store/codelist/codelist.model";
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
  UntypedFormGroup,
} from "@angular/forms";
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { MatOption, MatSelect } from "@angular/material/select";
import { MatIcon } from "@angular/material/icon";
import { MatButton, MatIconButton } from "@angular/material/button";
import { NgxMatSelectSearchModule } from "ngx-mat-select-search";
import { MatSnackBar } from "@angular/material/snack-bar";
import { startWith, take } from "rxjs/operators";
import { FormlyFieldConfig, FormlyForm } from "@ngx-formly/core";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

export interface FreeEntryReplaceDialogData {
  codelistId: string;
  codelistName?: string;
}

@Component({
  selector: "ige-free-entry-replace-dialog",
  templateUrl: "./free-entry-replace-dialog.component.html",
  styles: [
    `
      .row {
        margin-top: 8px;
      }
      .hint {
        color: rgba(0, 0, 0, 0.6);
        margin-top: 8px;
      }
    `,
  ],
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    FormsModule,
    MatIcon,
    MatButton,
    MatIconButton,
    NgxMatSelectSearchModule,
    FormlyForm,
    MatProgressSpinner,
  ],
})
export class FreeEntryReplaceDialogComponent implements OnInit {
  isReplacing = signal(false);
  loadingEntries = signal(false);

  freeEntries = signal<FreeEntry[]>([]);
  filteredFreeEntries: FreeEntry[] = [];

  // mirror form validity into signals to prevent ExpressionChanged errors
  fromInvalid = signal(true);
  toInvalid = signal(true);

  // derived state
  noFreeEntries = computed(() => this.freeEntries().length === 0);
  actionDisabled = computed(
    () =>
      this.fromInvalid() ||
      this.toInvalid() ||
      this.isReplacing() ||
      this.noFreeEntries(),
  );

  fromCtrl = new FormControl<string | null>(null);
  freeFilterCtrl = new FormControl<string>("");

  // Formly configuration for selecting the target keyed entry
  toForm = new UntypedFormGroup({});
  toModel: any = {};
  toFields: FormlyFieldConfig[] = [];

  get selectedFreeEntry(): FreeEntry | undefined {
    const val = this.fromCtrl.value ?? "";
    return this.freeEntries().find((e) => e.value === val);
  }

  constructor(
    private dialogRef: MatDialogRef<FreeEntryReplaceDialogComponent>,
    private codelistService: CodelistService,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: FreeEntryReplaceDialogData,
  ) {}

  ngOnInit(): void {
    // Load free entries with counts
    this.loadingEntries.set(true);
    this.codelistService
      .getFreeEntries(this.data.codelistId)
      .pipe(take(1))
      .subscribe({
        next: (entries) => {
          this.freeEntries.set(entries || []);
          this.applyFreeFilter();
          this.loadingEntries.set(false);
        },
        error: () => {
          this.loadingEntries.set(false);
          this.snackBar.open(
            "Fehler beim Laden der freien Einträge",
            undefined,
            { duration: 4000 },
          );
          this.dialogRef.close();
        },
      });

    this.toFields = [
      {
        key: "toKey",
        type: "ige-select",
        wrappers: ["form-field"],
        className: "width-100",
        props: {
          label: "Ersetzen durch (Codelisteneintrag)",
          externalLabel: "Ersetzen durch (Codelisteneintrag)",
          appearance: "outline",
          options: this.codelistService.observe(this.data.codelistId, "label"),
          showSearch: true,
          allowNoValue: false,
          simple: true,
          required: true,
        },
      },
    ];

    this.freeFilterCtrl.valueChanges.subscribe(() => this.applyFreeFilter());

    // track validity via signals (avoid reading form.invalid directly in template)
    this.fromInvalid.set(this.fromCtrl.invalid);
    this.fromCtrl.statusChanges
      .pipe(startWith(this.fromCtrl.status))
      .subscribe(() =>
        Promise.resolve().then(() =>
          this.fromInvalid.set(this.fromCtrl.invalid),
        ),
      );

    this.toInvalid.set(this.toForm.invalid);
    this.toForm.statusChanges
      .pipe(startWith(this.toForm.status))
      .subscribe(() =>
        Promise.resolve().then(() => this.toInvalid.set(this.toForm.invalid)),
      );
  }

  private applyFreeFilter() {
    const term = (this.freeFilterCtrl.value || "").toLowerCase();
    this.filteredFreeEntries = this.freeEntries().filter((e) =>
      e.value.toLowerCase().includes(term),
    );
  }

  replace() {
    const fromValue = this.fromCtrl.value?.toString().trim();
    const toKey = (this.toModel?.toKey ?? this.toForm.value?.toKey)
      ?.toString()
      .trim();
    if (!fromValue || !toKey) return;

    this.isReplacing.set(true);
    this.codelistService
      .replaceFreeEntry(this.data.codelistId, fromValue, toKey)
      .pipe(take(1))
      .subscribe({
        next: (result) => {
          this.isReplacing.set(false);
          this.snackBar.open(
            `Ersetzt ${result.occurrences} Vorkommen in ${result.documentsUpdated} Dokument(en)`,
            undefined,
            { duration: 4000 },
          );
          this.dialogRef.close(result);
        },
        error: () => {
          this.isReplacing.set(false);
          this.snackBar.open(
            "Fehler beim Ersetzen des freien Eintrags",
            undefined,
            { duration: 4000 },
          );
        },
      });
  }
}
