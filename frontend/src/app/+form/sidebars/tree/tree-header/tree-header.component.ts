import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {DynamicDatabase} from '../dynamic.database';
import {debounceTime, map} from 'rxjs/operators';
import {TreeNode} from '../../../../store/tree/tree-node.model';
import {FormControl} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'ige-tree-header',
  templateUrl: './tree-header.component.html',
  styleUrls: ['./tree-header.component.scss']
})
export class TreeHeaderComponent implements OnInit {
  @Input() showReloadButton = true;
  @Input() isAddress = false;
  @Input() showOptions = true;
  @Input() showOnlyFolders = false;
  @Input() showMultiSelectButton = true;

  @Output() reload = new EventEmitter();
  @Output() open = new EventEmitter();
  @Output() edit = new EventEmitter();

  searchResult = new Subject<TreeNode[]>();
  query = new FormControl('');

  constructor(private db: DynamicDatabase) {
  }

  ngOnInit() {
    // TODO: refactor search function into service to be also used by quick-search-component
    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300)
      )
      .subscribe(query => this.search(query));
  }

  reloadTree() {
    this.reload.emit();
  }

  search(value: string) {
    if (!value) {
      return;
    } else if (value.length === 0) {
      this.searchResult.next([]);
      return;
    }

    this.db.search(value, this.isAddress)
      .pipe(
        map(result => this.db.mapDocumentsToTreeNodes(result.hits, 0))
      )
      .subscribe(result => this.searchResult.next(this.filterResult(result)));
  }

  loadResultDocument(doc: TreeNode) {
    console.log('Loading document', doc);
    this.open.next(doc._id);
  }

  private filterResult(result: TreeNode[]) {
    return this.showOnlyFolders
      ? result.filter(node => node.type === 'FOLDER')
      : result;
  }
}
