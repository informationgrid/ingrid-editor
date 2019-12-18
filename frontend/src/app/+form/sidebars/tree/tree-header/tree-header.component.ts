import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {DocumentAbstract} from '../../../../store/document/document.model';
import {DocumentService} from '../../../../services/document/document.service';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {FormControl} from '@angular/forms';
import {DynamicDatabase} from '../dynamic.database';
import {map} from 'rxjs/operators';
import {TreeNode} from '../../../../store/tree/tree-node.model';
import {MatOptionSelectionChange} from '@angular/material/core';

@Component({
  selector: 'ige-tree-header',
  templateUrl: './tree-header.component.html',
  styleUrls: ['./tree-header.component.scss']
})
export class TreeHeaderComponent implements OnInit, AfterViewInit {
  @Input() showReloadButton = true;

  @Output() reload = new EventEmitter();
  @Output() open = new EventEmitter();

  @ViewChild(MatAutocompleteTrigger, {static: false}) trigger: MatAutocompleteTrigger;

  searchValue = new FormControl();
  searchResult = new Subject<TreeNode[]>();

  constructor(private docService: DocumentService, private db: DynamicDatabase) {
  }

  ngOnInit() {
    this.searchValue.valueChanges.subscribe(value => this.search(value));
  }

  ngAfterViewInit() {
    this.trigger.panelClosingActions.subscribe( () => {
      console.log('Search panel closed');
      this.trigger.openPanel();
    });
  }

  reloadTree() {
    this.reload.emit();
  }

  search(value: string) {
    if (value.length === 0) {
      this.searchResult.next([]);
      return;
    }

    console.log('Search: ', value);
    this.db.search(value)
      .pipe(
        map(docs => this.db.mapDocumentsToTreeNodes(docs, 0))
      )
      .subscribe(result => this.searchResult.next(result));
  }

  loadResultDocument(doc: TreeNode) {
    console.log('Loading document', doc);
    this.searchValue.setValue(doc.title);
    this.open.next(doc._id);
  }
}
