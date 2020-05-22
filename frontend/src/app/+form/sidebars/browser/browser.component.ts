import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DocumentService} from '../../../services/document/document.service';
// import {StorageDummyService as StorageService} from '../../../services/storage/storage.dummy.service';
import {ActivatedRoute} from '@angular/router';
import {UpdateType} from '../../../models/update-type.enum';
import {Subscription} from 'rxjs';

@Component({
  selector: 'browser',
  templateUrl: './browser.component.html',
  styles: [`
    li {
      cursor: pointer;
    }
  `]
})
export class BrowserComponent implements OnInit, OnDestroy {

  @Input() filter: any;
  @Output() onSelected = new EventEmitter<any>();

  entries: any[] = [];
  searchString = '';
  selectedId: string;

  subscription: Subscription;

  constructor(private storageService: DocumentService, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.selectedId = params['id'];
    });

    this.subscription = this.storageService.datasetsChanged$.subscribe((event) => {
      if (event.type === UpdateType.Update) {
        this.query();
      }
    });

    /*this.profileService.initialized.then( () => {
      this.query();
    });*/
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  matchFilter(doc: any): boolean {
    const keys = Object.keys(this.filter);
    return keys.every(key => doc[key] === this.filter[key]);
  }

  query() {
    // initially show all documents
    this.storageService.find(this.searchString);
    /*TODO: .subscribe( (docs: any[]) => {
      this.entries = docs
        .filter(doc => doc._type !== undefined)
        .filter(doc => !this.filter || this.matchFilter(doc) )
        .map( doc => {
          doc.title = this.formularService.getTitle(doc._type, doc);
          return doc;
        } );
    });*/
  }

  open(id: string, title: string) {
    this.selectedId = id;
    this.onSelected.next({id: id, title: title});
    // this.router.navigate( ['/form', id] );
  }

}
