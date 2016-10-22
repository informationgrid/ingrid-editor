import {Component, OnInit} from '@angular/core';
import {StorageService} from '../../../services/storage/storage.service';
// import {StorageDummyService as StorageService} from '../../../services/storage/storage.dummy.service';
import {Router, ActivatedRoute} from '@angular/router';

@Component( {
  selector: 'sidebar',
  template: require('./browser.component.html')
})
export class BrowserComponent implements OnInit {

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

  query() {
    // initially show all documents
    this.storageService.findDocuments( this.searchString ).subscribe( docs =>
      this.entries = docs.filter( (doc: any) => doc._profile !== undefined )
    );
  }

  open(id: string) {
    this.selectedId = id;
    this.router.navigate( ['/form', id] );
  }

  showTitle(entry: any) {
    if (entry.title) {
      return entry.title;
    } else if (entry['mainInfo.title']) {
      return entry['mainInfo.title'];
    } else {
      return '- untitled -';
    }
  }
}