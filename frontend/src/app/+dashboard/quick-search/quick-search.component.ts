import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DocumentAbstract} from '../../store/document/document.model';
import {DocumentService} from '../../services/document/document.service';
import {Router} from '@angular/router';
import {FormControl} from '@angular/forms';
import {UntilDestroy, untilDestroyed} from '@ngneat/until-destroy';
import {debounceTime} from 'rxjs/operators';

@UntilDestroy()
@Component({
  selector: 'ige-quick-search',
  templateUrl: './quick-search.component.html',
  styleUrls: ['./quick-search.component.scss']
})
export class QuickSearchComponent implements OnInit {

  @Output() selectDoc = new EventEmitter<string>();
  @Output() selectAddress = new EventEmitter<string>();

  docs: DocumentAbstract[];
  addresses: DocumentAbstract[];
  numDocs: number;
  numAddresses: number;

  query = new FormControl('');

  constructor(private documentService: DocumentService, private router: Router) {
  }

  ngOnInit(): void {
    this.query.valueChanges
      .pipe(
        untilDestroyed(this),
        debounceTime(300)
      )
      .subscribe(query => this.search(query));
  }

  search(value: string) {
    this.documentService.find(value, 5)
      .subscribe(result => {
        this.docs = result.hits;
        this.numDocs = result.totalHits;
      });
    this.documentService.find(value, 5, true)
      .subscribe(result => {
        this.addresses = result.hits;
        this.numAddresses = result.totalHits;
      });
  }

  openResearchPage(event: Event) {
    event.preventDefault();
    this.router.navigate(['/research']);
  }
}
