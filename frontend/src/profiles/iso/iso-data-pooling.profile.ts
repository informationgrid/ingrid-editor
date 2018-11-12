import { CodelistService } from '../../app/services/codelist/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseProfile } from './iso-base.profile';
import { DocumentService } from '../../app/services/document/document.service';

export class IsoDataPoolingProfile extends IsoBaseProfile {

  id = 'ISODataPooling';

  label = 'ISO-Datensammlung';

  constructor(storageService: DocumentService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push( ...[]);
  }

}
