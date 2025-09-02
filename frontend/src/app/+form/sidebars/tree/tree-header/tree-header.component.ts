/**
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
  Input,
  OnInit,
  input,
  output,
} from "@angular/core";
import { BehaviorSubject, of, Subscription } from "rxjs";
import { DynamicDatabase } from "../dynamic.database";
import { catchError, debounceTime, map, startWith } from "rxjs/operators";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { UntypedFormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatCheckbox } from "@angular/material/checkbox";
import { MatTooltip } from "@angular/material/tooltip";
import { MatIconButton } from "@angular/material/button";
import { MatSuffix } from "@angular/material/form-field";
import { MatIcon } from "@angular/material/icon";
import { SearchInputComponent } from "../../../../shared/search-input/search-input.component";
import { MatAutocomplete } from "@angular/material/autocomplete";
import { MatOption } from "@angular/material/core";
import { DocumentListItemComponent } from "../../../../shared/document-list-item/document-list-item.component";
import { AsyncPipe } from "@angular/common";
import { MatSlideToggle } from "@angular/material/slide-toggle";

@UntilDestroy()
@Component({
  selector: "ige-tree-header",
  templateUrl: "./tree-header.component.html",
  styleUrls: ["./tree-header.component.scss"],
  imports: [
    MatCheckbox,
    MatTooltip,
    MatIconButton,
    MatSuffix,
    MatIcon,
    SearchInputComponent,
    MatAutocomplete,
    MatOption,
    DocumentListItemComponent,
    AsyncPipe,
    MatSlideToggle,
  ],
})
export class TreeHeaderComponent implements OnInit {
  readonly showReloadButton = input(false);
  readonly showWriteAccessToggle = input(false);
  readonly isAddress = input(false);
  readonly showOptions = input(true);
  readonly showOnlyFolders = input(false);
  readonly showMultiSelectButton = input(true);
  @Input() multiSelectionModeEnabled = false;
  readonly showSearch = input(true);
  readonly emptySearchResults = input<TreeNode[]>(undefined);

  readonly checkToggleAll = input(false);
  readonly indeterminateToggleAll = input(false);

  readonly reload = output();
  readonly open = output<number>();
  readonly edit = output<boolean>();
  readonly toggleAllSelection = output<boolean>();
  readonly toggleWriteAccess = output<boolean>();
  searchResult = new BehaviorSubject<TreeNode[]>([]);
  query = new UntypedFormControl("");
  searchSub: Subscription;

  constructor(
    private db: DynamicDatabase,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    // TODO: refactor search function into service to be also used by quick-search-component
    this.query.valueChanges
      .pipe(untilDestroyed(this), startWith(""), debounceTime(300))
      .subscribe((query) => this.search(query));
  }

  reloadTree() {
    this.reload.emit();
  }

  search(value: string) {
    if (!value || value.length === 0) {
      this.searchResult.next(this.emptySearchResults() ?? []);
      return;
    }
    this.searchSub?.unsubscribe();
    this.searchSub = this.db
      .search(value, this.isAddress())
      .pipe(
        map((result) => this.db.mapDocumentsToTreeNodes(result.hits, 0)),
        catchError(() => of([])),
      )
      .subscribe((result) => {
        this.searchResult.next(this.filterResult(result));
      });
    this.cdr.detectChanges();
  }

  loadResultDocument(doc: TreeNode) {
    this.open.emit(doc._id);
  }

  private filterResult(result: TreeNode[]) {
    return this.showOnlyFolders()
      ? result.filter((node) => node.type === "FOLDER")
      : result;
  }

  activateMultiSelection() {
    this.multiSelectionModeEnabled = true;
    this.edit.emit(true);
  }

  deactivateMultiSelection() {
    this.multiSelectionModeEnabled = false;
    this.edit.emit(false);
  }
}
