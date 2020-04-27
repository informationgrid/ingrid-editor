import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {DynamicDatabase} from '../dynamic.database';
import {map} from 'rxjs/operators';
import {TreeNode} from '../../../../store/tree/tree-node.model';

@Component({
  selector: 'ige-tree-header',
  templateUrl: './tree-header.component.html',
  styleUrls: ['./tree-header.component.scss']
})
export class TreeHeaderComponent implements OnInit, AfterViewInit {
  @Input() showReloadButton = true;
  @Input() isAddress = false;
  @Input() showOptions = true;
  @Input() showOnlyFolders = false;

  @Output() reload = new EventEmitter();
  @Output() open = new EventEmitter();

  searchResult = new Subject<TreeNode[]>();

  constructor(private db: DynamicDatabase) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
  }

  reloadTree() {
    this.reload.emit();
  }

  search(value: string, $event: KeyboardEvent) {
    console.log('getting search input event')
    if ($event.key === 'ArrowDown' || $event.key === 'ArrowUp'/* || $event.key === 'Enter'*/) {
      return;
    }
    if (value.length === 0) {
      this.searchResult.next([]);
      return;
    }

    console.log('Search: ', value);
    this.db.search(value, this.isAddress)
      .pipe(
        map(result => DynamicDatabase.mapDocumentsToTreeNodes(result.hits, 0))
      )
      .subscribe(result => this.searchResult.next(this.filterResult(result)));
  }

  loadResultDocument(doc: TreeNode) {
    console.log('Loading document', doc);
    this.open.next(doc._id);
  }

  private filterResult(result: TreeNode[]) {
    return this.showOnlyFolders
      ? result.filter(node => node.profile === 'FOLDER')
      : result;
  }
}
