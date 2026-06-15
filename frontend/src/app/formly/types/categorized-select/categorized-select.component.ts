/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  untracked,
} from "@angular/core";
import { FieldType } from "@ngx-formly/material/form-field";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FieldTypeConfig } from "@ngx-formly/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { CommonModule } from "@angular/common";
import { MatChipsModule } from "@angular/material/chips";
import { MatIconModule } from "@angular/material/icon";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { isObservable, Observable } from "rxjs";
import { MatMenuModule } from "@angular/material/menu";
import { MatOption } from "@angular/material/autocomplete";
import { MatSelectSearchComponent } from "ngx-mat-select-search";
import { MatSelect } from "@angular/material/select";
import { debounceTime, startWith } from "rxjs/operators";
import { AriaLabelPipe } from "../../../directives/aria-label.pipe";
import { InputOptions } from "../../../../profiles/form-field-helper";
import { TranslocoDirective } from "@jsverse/transloco";
import {
  SelectCategory,
  SelectOption,
} from "../../../services/codelist/codelist.service";
import { BackendOption } from "../../../store/codelist/codelist.model";
import { ErrorStateMatcher } from "@angular/material/core";
import { MatTooltip } from "@angular/material/tooltip";

class MyErrorStateMatcher implements ErrorStateMatcher {
  constructor(private component: CategorizedSelectComponent) {}

  isErrorState(control: FormControl | null): boolean {
    if (this.component.showError && control?.invalid) return control.invalid;
    else return false;
  }
}

export interface CategorizedSelectProps extends InputOptions {
  showHeader?: boolean;
  categories: SelectCategory[] | Observable<SelectCategory[]>;
  codelistId: string;
}

@Component({
  selector: "ige-categorized-select",
  templateUrl: "./categorized-select.component.html",
  styleUrls: ["./categorized-select.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCheckboxModule,
    MatButtonModule,
    MatMenuModule,
    MatOption,
    MatSelectSearchComponent,
    MatSelect,
    FormsModule,
    AriaLabelPipe,
    TranslocoDirective,
    MatTooltip,
  ],
})
export class CategorizedSelectComponent
  extends FieldType<FieldTypeConfig<CategorizedSelectProps>>
  implements OnInit
{
  private destroyRef = inject(DestroyRef);

  selectedOptions = signal<SelectOption[]>([]);
  selectedCounts = computed(() => {
    return this.filteredCategories().reduce(
      (pre, cur) => {
        pre[cur.title] = this.getSelectedCount(cur);
        return pre;
      },
      {} as Record<string, number>,
    );
  });

  filterCtrl = new FormControl("");
  filterQuery = signal<string>("");

  categories = signal<SelectCategory[]>([]);
  selectedCategory = signal<SelectCategory>(null);

  filteredCategories = computed(() => {
    const query = this.filterQuery().toLowerCase();
    if (!query) return this.categories();

    // Filter only by the value of options.
    return this.categories()
      .map((cat) => ({
        ...cat,
        options: cat.options.filter((opt) =>
          opt.label.toLowerCase().includes(query),
        ),
      }))
      .filter((cat) => cat.options.length > 0);
  });

  matcher = new MyErrorStateMatcher(this);

  constructor() {
    super();
    // Change the selected category when filtered categories change
    effect(() => {
      if (this.filteredCategories().length > 0) {
        untracked(() =>
          this.selectedCategory.set(this.filteredCategories()[0]),
        );
      } else {
        untracked(() => this.selectedCategory.set(null));
      }
    });
  }

  ngOnInit() {
    // Initialize categories from props.
    const categories = this.props.categories;
    if (isObservable(categories)) {
      categories.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
        this.categories.set(data);
        if (data.length > 0) this.selectedCategory.set(data[0]);
      });
    } else if (categories) {
      this.categories.set(categories);
      if (categories.length > 0) this.selectedCategory.set(categories[0]);
    }

    // Initialize selected options from form control value.
    this.formControl.valueChanges
      .pipe(
        startWith(this.formControl.value),
        debounceTime(0),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.selectedOptions.set(
          data?.map((o: BackendOption) => SelectOption.fromBackend(o)) ?? [],
        );
      });

    // Add filter query listener.
    this.filterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        this.filterQuery.set(val ?? "");
      });
  }

  onCategorySelected(cat: SelectCategory) {
    this.selectedCategory.set(cat);
  }

  onOptionToggled(option: SelectOption) {
    if (this.isSelected(option)) {
      this.onOptionRemoved(option);
    } else {
      this.onOptionAdded(option);
    }
  }

  onOptionAdded(option: SelectOption) {
    this.selectedOptions.update((prev) => {
      return [...prev, option];
    });
    this.updateFormControl();
  }

  onOptionRemoved(option: SelectOption) {
    this.selectedOptions.update((prev) => {
      return prev.filter((o) => o.value !== option.value);
    });
    this.updateFormControl();
  }

  isSelected(option: SelectOption): boolean {
    const values = new Set(this.selectedOptions().map((o) => o.value));
    return values.has(option.value);
  }

  private getSelectedCount(category: SelectCategory) {
    const values = new Set(this.selectedOptions().map((o) => o.value));
    return category.options.filter((o) => values.has(o.value)).length;
  }

  private updateFormControl() {
    this.formControl.setValue(
      this.selectedOptions().map((o) => o.forBackend(this.props.codelistId)),
    );
    this.formControl.markAsDirty();
    this.formControl.markAsTouched();
  }
}
