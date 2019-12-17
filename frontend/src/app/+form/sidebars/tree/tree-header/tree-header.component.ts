import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Subject} from 'rxjs';
import {DocumentAbstract} from '../../../../store/document/document.model';
import {DocumentService} from '../../../../services/document/document.service';
import {MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'ige-tree-header',
  templateUrl: './tree-header.component.html',
  styleUrls: ['./tree-header.component.scss']
})
export class TreeHeaderComponent implements OnInit, AfterViewInit {
  @Input() showReloadButton = true;

  @Output() reload = new EventEmitter();

  @ViewChild(MatAutocompleteTrigger, {static: false}) trigger: MatAutocompleteTrigger;

  searchValue = new FormControl();
  searchResult = new Subject<DocumentAbstract[]>();

  constructor(private docService: DocumentService) {
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
    this.docService.find(value).subscribe(result => this.searchResult.next(result));
  }

  loadResultDocument(doc: DocumentAbstract) {
    console.log('Loading document', doc);
    this.searchValue.setValue('xxx');
  }
}
