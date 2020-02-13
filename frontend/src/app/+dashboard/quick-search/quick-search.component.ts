import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DocumentAbstract} from '../../store/document/document.model';
import {DocumentService} from '../../services/document/document.service';

@Component({
  selector: 'ige-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent implements OnInit {

  @Output() select = new EventEmitter<string>();

  docs: DocumentAbstract[];
  addresses: DocumentAbstract[];
  numDocs: number;
  numAddresses: number;

  constructor(private documentService: DocumentService) {
  }

  ngOnInit(): void {
  }

  search(value: string, $event: KeyboardEvent) {
    if ($event.key === 'ArrowDown' || $event.key === 'ArrowUp'/* || $event.key === 'Enter'*/) {
      return;
    }
    this.documentService.find(value, 5)
      .subscribe( result => {
        this.docs = result.hits;
        this.numDocs = result.totalHits;
      });
    this.documentService.find(value, 5)
      .subscribe( result => {
        this.addresses = result.hits;
        this.numAddresses = result.totalHits;
      });
  }

}
