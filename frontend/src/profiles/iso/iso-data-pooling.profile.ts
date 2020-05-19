import { CodelistService } from '../../app/services/codelist/codelist.service';
import { IsoBaseProfile } from './iso-base.profile';
import { DocumentService } from '../../app/services/document/document.service';
import {CodelistQuery} from '../../app/store/codelist/codelist.query';

export class IsoDataPoolingProfile extends IsoBaseProfile {

  id = 'ISODataPooling';

  label = 'ISO-Datensammlung';

  constructor(storageService: DocumentService, codelistService: CodelistService, codelistQuery: CodelistQuery) {
    super(storageService, codelistService, codelistQuery);

    this.fields.push( ...[]);
  }

}
