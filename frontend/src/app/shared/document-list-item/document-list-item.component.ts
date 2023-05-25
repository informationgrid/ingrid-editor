import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { Observable, of, Subject } from "rxjs";
import { TreeNode } from "../../store/tree/tree-node.model";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatSelectionList } from "@angular/material/list";

@UntilDestroy()
@Component({
  selector: "ige-document-list-item",
  templateUrl: "./document-list-item.component.html",
  styleUrls: ["./document-list-item.component.scss"],
})
export class DocumentListItemComponent implements OnInit {
  _docs: Observable<DocumentAbstract[] | TreeNode[]>;
  @Input() set docs(
    value: Observable<DocumentAbstract[] | TreeNode[]> | DocumentAbstract[]
  ) {
    this._docs = value instanceof Observable ? value : of(value);
  }
  get docs(): Observable<DocumentAbstract[] | TreeNode[]> {
    return this._docs;
  }
  @Input() doc: DocumentAbstract | TreeNode;
  @Input() denseMode = false;
  @Input() hideDate = true;
  @Input() hideDivider = false;
  @Input() showSelection = false;
  @Input() showIcons = true;
  // this is only needed to prevent expression has changed exception and might be removed later
  @Input() removeSelectionAfter = false;
  @Input() setActiveItem: Subject<Partial<DocumentAbstract>>;
  @Output() select = new EventEmitter<DocumentAbstract>();

  @ViewChild(MatSelectionList) list: MatSelectionList;

  currentSelection: Partial<DocumentAbstract>;

  constructor() {}

  ngOnInit(): void {
    if (this.setActiveItem) {
      this.setActiveItem
        .pipe(untilDestroyed(this))
        .subscribe((doc) => this.updateSelectionFromExternal(doc));
    }
  }

  private updateSelectionFromExternal(doc: Partial<DocumentAbstract>) {
    this.currentSelection = doc;
  }

  makeSelection(doc: DocumentAbstract) {
    // we need to deselect, otherwise an ExpressionChangedAfterItHasBeenCheckedError occurs if we
    // come back to this component (clicking on root folder)
    if (this.removeSelectionAfter && this.list) {
      this.list.deselectAll();
    } else {
      this.currentSelection = doc;
    }
    this.select.next(doc);
  }
}
