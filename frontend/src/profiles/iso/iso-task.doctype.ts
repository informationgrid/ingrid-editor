import { CodelistService } from '../../app/services/codelist/codelist.service';
import { Injectable } from '@angular/core';
import { IsoBaseDoctype } from './iso-base.doctype';
import { DocumentService } from '../../app/services/document/document.service';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';

export class IsoTaskDoctype extends IsoBaseDoctype {

  id = 'ISOTask';

  label = 'ISO-Fachaufgabe';

  constructor(storageService: DocumentService, codelistService: CodelistService, codelistQuery: CodelistQuery) {
    super(storageService, codelistService, codelistQuery);
  }

}
