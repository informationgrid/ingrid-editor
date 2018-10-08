import { CodelistService } from '../../app/+form/services/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseProfile } from './iso-base.profile';
import { StorageService } from '../../app/services/storage/storage.service';

export class IsoTaskProfile extends IsoBaseProfile {

  id = 'ISOTask';

  label = 'ISO-Fachaufgabe';

  constructor(storageService: StorageService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push( ...[]);
  }

}
