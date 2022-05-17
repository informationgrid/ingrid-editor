import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ChangeDetectorRef,
} from "@angular/core";
import { Observable, Subject } from "rxjs";
import { DynamicDatabase } from "../dynamic.database";
import { catchError, debounceTime, finalize, map } from "rxjs/operators";
import { TreeNode } from "../../../../store/tree/tree-node.model";
import { FormControl } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: "ige-tree-header",
  templateUrl: "./tree-header.component.html",
  styleUrls: ["./tree-header.component.scss"],
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
  @Output() isSearching = false;
  searchResult = new Subject<TreeNode[]>();
  query = new FormControl("");
  treeSubscribe;
  constructor(private db: DynamicDatabase, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // TODO: refactor search function into service to be also used by quick-search-component
    this.query.valueChanges
      .pipe(untilDestroyed(this), debounceTime(300))
      .subscribe((query) => this.search(query));
  }

  reloadTree() {
    this.reload.emit();
  }

  private isLoading() {
    this.isSearching = true;
    this.cdr.detectChanges();
  }

  search(value: string) {
    if (!value || value.length === 0) {
      this.searchResult.next(this.emptySearchResults ?? []);
      return;
    }
    this.isLoading();

    this.treeSubscribe = this.db
      .search(value, this.isAddress)
      .pipe(
        map((result) => this.db.mapDocumentsToTreeNodes(result.hits, 0)),
        finalize(() => {
          this.isSearching = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe((result) => {
        this.searchResult.next(this.filterResult(result));
      });
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

  resetForm() {
    this.query.reset("");
    this.treeSubscribe.unsubscribe();
  }
  deactivateMultiSelection() {
    this.multiSelectionModeEnabled = false;
    this.edit.next(false);
  }
}
