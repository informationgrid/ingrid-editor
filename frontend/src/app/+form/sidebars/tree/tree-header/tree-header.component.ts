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
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
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

@UntilDestroy()
@Component({
  selector: "ige-tree-header",
  templateUrl: "./tree-header.component.html",
  styleUrls: ["./tree-header.component.scss"],
  standalone: true,
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
  ],
})
export class TreeHeaderComponent implements OnInit {
  @Input() showReloadButton = false;
  @Input() isAddress = false;
  @Input() showOptions = true;
  @Input() showOnlyFolders = false;
  @Input() showMultiSelectButton = true;
  @Input() multiSelectionModeEnabled = false;
  @Input() showSearch = true;
  @Input() emptySearchResults: TreeNode[];

  @Input() checkToggleAll = false;
  @Input() indeterminateToggleAll = false;

  @Output() reload = new EventEmitter();
  @Output() open = new EventEmitter();
  @Output() edit = new EventEmitter<boolean>();
  @Output() toggleAllSelection = new EventEmitter<boolean>();
  @Output() toggleView = new EventEmitter<boolean>();
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
      this.searchResult.next(this.emptySearchResults ?? []);
      return;
    }
    this.searchSub?.unsubscribe();
    this.searchSub = this.db
      .search(value, this.isAddress)
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
    this.open.next(doc._id);
  }

  private filterResult(result: TreeNode[]) {
    return this.showOnlyFolders
      ? result.filter((node) => node.type === "FOLDER")
      : result;
  }

  activateMultiSelection() {
    this.multiSelectionModeEnabled = true;
    this.edit.next(true);
  }

  deactivateMultiSelection() {
    this.multiSelectionModeEnabled = false;
    this.edit.next(false);
  }
}
