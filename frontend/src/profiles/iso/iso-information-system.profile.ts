import { CodelistService } from '../../app/services/codelist/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseProfile } from './iso-base.profile';
import { DocumentService } from '../../app/services/document/document.service';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';

export class IsoInformationSystemProfile extends IsoBaseProfile {

  id = 'ISOInformationSystem';

  label = 'ISO-Informationssystem';

  constructor(storageService: DocumentService, codelistService: CodelistService, codelistQuery: CodelistQuery) {
    super(storageService, codelistService, codelistQuery);

    this.fields.push( ...[]);
  }

}
