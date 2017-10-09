import {Profile} from '../profile';
import {DropdownField} from '../../../+form/controls/field-dropdown';
import {FieldBase} from '../../../+form/controls/field-base';
import {CodelistService} from '../../../+form/services/codelist.service';
import {Injectable} from '@angular/core';
import {IsoBaseProfile} from './iso-base.profile';

@Injectable()
export class IsoDataPoolingProfile extends IsoBaseProfile {

  id = 'ISODataPooling';

  label = 'ISO-Datensammlung';

  constructor(public codelistService: CodelistService) {
    super(codelistService);

    this.profile.push( ...[]);
  }

}
