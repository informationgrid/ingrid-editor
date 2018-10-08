import { CodelistService } from '../../app/+form/services/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseProfile } from './iso-base.profile';
import { StorageService } from '../../app/services/storage/storage.service';

export class IsoProjectProfile extends IsoBaseProfile {

  id = 'ISOProject';

  label = 'ISO-Projekt';

  constructor(storageService: StorageService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push( ...[]);
  }

}
