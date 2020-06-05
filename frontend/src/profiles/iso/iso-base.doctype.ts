import {CodelistService} from '../../app/services/codelist/codelist.service';
import {DocumentService} from '../../app/services/document/document.service';
import {BaseDoctype} from '../base.doctype';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';

export class IsoBaseDoctype extends BaseDoctype {

  id = 'ISOService';

  label = 'no-name';

  documentFields = () => {
  }

  constructor(storageService: DocumentService, codelistService: CodelistService, codelistQuery: CodelistQuery) {
    super(codelistService, codelistQuery);

  }


}
