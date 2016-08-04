import { Injectable } from '@angular/core';

export interface DocumentInterface {
  id: string;

}

@Injectable()
export class StorageService {

  constructor() { }

  load(id: string) {}

  save(document: DocumentInterface) {

  }


  // FIXME: this should be added with a plugin
  publish() {

  }

}