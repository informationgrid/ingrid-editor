import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { DocumentAbstract } from "../../store/document/document.model";
import { Observable, Subject } from "rxjs";
import { TreeNode } from "../../store/tree/tree-node.model";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { DocumentUtils } from "../../services/document.utils";
import { MatSelectionList } from "@angular/material/list";

@UntilDestroy()
@Component({
  selector: "ige-document-list-item",
  templateUrl: "./document-list-item.component.html",
  styleUrls: ["./document-list-item.component.scss"],
})
export class DocumentListItemComponent implements OnInit {
  @Input() docs: Observable<DocumentAbstract[] | TreeNode[]>;
  @Input() doc: DocumentAbstract | TreeNode;
  @Input() denseMode = false;
  @Input() hideDate = true;
  @Input() hideDivider = false;
  @Input() showSelection = false;
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
    if (this.list) this.list.deselectAll();
    this.currentSelection = doc;
    this.select.next(doc);
  }

  getStateClass(doc: DocumentAbstract | TreeNode) {
    const state = (<DocumentAbstract>doc)._state || (<TreeNode>doc).state;
    const type = (<DocumentAbstract>doc)._type || (<TreeNode>doc).type;

    return DocumentUtils.getStateClass(state, type);
  }
}
