import {Component, OnInit, Output, EventEmitter, Input} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
// import {StorageDummyService as StorageService} from '../../../services/storage/storage.dummy.service';
import {Router, ActivatedRoute} from '@angular/router';

@Component( {
  selector: 'browser',
  template: require('./browser.component.html'),
  styles: [`
    li { cursor: pointer; }
  `]
})
export class BrowserComponent implements OnInit {

  @Input() filter: any;
  @Output() onSelected = new EventEmitter<any>();

  entries: any[] = [];
  searchString: string = '';
  selectedId: string;

  constructor(private storageService: StorageService, private router: Router, private route: ActivatedRoute) {
    this.route.params.subscribe(params => {
      this.selectedId = params['id'];
    });

    storageService.datasetsChanged.asObservable().subscribe( () => {
      this.query();
    } );

  }

  ngOnInit() {
    this.query();
  }

  matchFilter(doc: any): boolean {
    let keys = Object.keys(this.filter);
    return keys.every( key => doc[key] === this.filter[key] );
  }

  query() {
    // initially show all documents
    this.storageService.findDocuments( this.searchString ).subscribe( (docs: any[]) => {
      this.entries = docs
        .filter(doc => doc._profile !== undefined)
        .filter(doc => !this.filter || this.matchFilter(doc) )
        .map( doc => {
          if (doc.title) {
            // do nothing
          } else if (doc['mainInfo.title']) {
            doc.title = doc['mainInfo.title'];
          } else {
            doc.title = '- untitled -';
          }
          return doc;
        } );
    });
  }

  open(id: string, title: string) {
    this.selectedId = id;
    this.onSelected.next({id: id, title: title});
    // this.router.navigate( ['/form', id] );
  }

}