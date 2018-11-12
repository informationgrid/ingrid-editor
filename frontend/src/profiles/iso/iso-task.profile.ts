import { CodelistService } from '../../app/services/codelist/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseProfile } from './iso-base.profile';
import { DocumentService } from '../../app/services/document/document.service';

export class IsoTaskProfile extends IsoBaseProfile {

  id = 'ISOTask';

  label = 'ISO-Fachaufgabe';

  constructor(storageService: DocumentService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push( ...[]);
  }

}
