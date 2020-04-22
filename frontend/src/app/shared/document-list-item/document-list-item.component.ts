import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {DocumentAbstract} from '../../store/document/document.model';
import {Observable, Subject} from 'rxjs';
import {TreeNode} from '../../store/tree/tree-node.model';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-document-list-item',
  templateUrl: './document-list-item.component.html',
  styleUrls: ['./document-list-item.component.scss']
})
export class DocumentListItemComponent implements OnInit {

  @Input() docs: Observable<DocumentAbstract[] | TreeNode[]>;
  @Input() doc: DocumentAbstract | TreeNode;
  @Input() denseMode = false;
  @Input() hideDate = true;
  @Input() hideDivider = false;
  @Input() showSelection = false;
  @Input() setActiveItem: Subject<DocumentAbstract>;
  @Output() select = new EventEmitter<DocumentAbstract>();

  currentSelection: DocumentAbstract;

  constructor() {
  }

  ngOnInit(): void {
    if (this.setActiveItem) {
      this.setActiveItem
        .pipe(untilDestroyed(this))
        .subscribe(doc => this.updateSelectionFromExternal(doc));
    }
  }

  private updateSelectionFromExternal(doc: DocumentAbstract) {
    this.currentSelection = doc;
  }

  makeSelection(doc: DocumentAbstract) {
    this.select.next(doc);
    this.currentSelection = doc;
  }

  /**
   * TODO: Refactor since this functionality is also in tree.component.ts
   * @param doc
   */
  getStateClass(doc: DocumentAbstract | TreeNode) {
    const state = (<DocumentAbstract>doc)._state || (<TreeNode>doc).state;

    switch (state) {
      case 'W':
        return 'working';
      case 'PW':
        return 'workingWithPublished';
      case 'P':
        return 'published';
      default:
        console.error('State is not supported: ' + state, doc);
        throw new Error('State is not supported: ' + state);
    }
  }
}
