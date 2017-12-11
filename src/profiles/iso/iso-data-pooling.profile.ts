import {Profile} from '../../app/services/formular/profile';
import {DropdownField} from '../../app/+form/controls/field-dropdown';
import {FieldBase} from '../../app/+form/controls/field-base';
import {CodelistService} from '../../app/+form/services/codelist.service';
import {Injectable} from '@angular/core';
import {IsoBaseProfile} from './iso-base.profile';
import { StorageService } from '../../app/services/storage/storage.service';

@Injectable()
export class IsoDataPoolingProfile extends IsoBaseProfile {

  id = 'ISODataPooling';

  label = 'ISO-Datensammlung';

  constructor(storageService: StorageService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push( ...[]);
  }

}
