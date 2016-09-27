import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../../services/storage/storage.service";

@Component({
  selector: 'sidebar',
  template: require('./browser.component.html')
})
export class BrowserComponent implements OnInit {

  entries: any[] = [];
  searchString: string = '';

  constructor(private storageService: StorageService) {
    // TODO: register on save event to reload data in case a new document was added or a title was changed
    storageService.afterSave.asObservable().subscribe( () => {
      this.query();
    })
  }

  ngOnInit() {
    this.query();
  }

  query() {
    // initially show all documents
    this.storageService.findDocuments(this.searchString).subscribe(docs => this.entries = docs.filter((doc: any) => doc._profile !== undefined));
  }

}