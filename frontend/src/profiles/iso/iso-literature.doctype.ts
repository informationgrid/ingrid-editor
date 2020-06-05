import {Container, TextboxField} from '../../app/+form/controls';
import {Rubric} from '../../app/+form/controls/rubric';
import {CodelistService} from '../../app/services/codelist/codelist.service';
import {IsoBaseDoctype} from './iso-base.doctype';
import {DocumentService} from '../../app/services/document/document.service';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';

export class IsoLiteratureDoctype extends IsoBaseDoctype {

  id = 'ISOLiterature';

  label = 'ISO-Literatur';

  constructor(storageService: DocumentService, codelistService: CodelistService, codelistQuery: CodelistQuery) {
    super(storageService, codelistService, codelistQuery);
  }

}
