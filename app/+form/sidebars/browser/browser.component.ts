import {Component, OnInit} from '@angular/core';
import {StorageService} from "../../../services/storage/storage.service";

@Component({
  selector: 'sidebar',
  template: require('./browser.component.html')
})
export class BrowserComponent implements OnInit {

  entries: any[] = [];

  constructor(private storageService: StorageService) {
  }

  ngOnInit() {
    // TODO: register on save event to reload data in case a new document was added or a title was changed

    // initially show all documents
    this.storageService.findDocuments().subscribe(docs => this.entries = docs.filter(doc => doc._profile !== undefined));
  }

}