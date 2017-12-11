import { CheckboxField, RadioField, TextareaField, TextboxField } from '../../app/+form/controls/index';
import { OpenTableField } from '../../app/+form/controls/field-opentable';
import { Profile } from '../../app/services/formular/profile';
import { Rubric } from '../../app/+form/controls/rubric';
import { DropdownField } from '../../app/+form/controls/field-dropdown';
import { FieldBase } from '../../app/+form/controls/field-base';
import { CodelistService } from '../../app/+form/services/codelist.service';
import { Container } from '../../app/+form/controls/container';
import {Injectable} from '@angular/core';
import {IsoBaseProfile} from './iso-base.profile';
import { StorageService } from '../../app/services/storage/storage.service';

@Injectable()
export class IsoProjectProfile extends IsoBaseProfile {

  id = 'ISOProject';

  label = 'ISO-Projekt';

  constructor(storageService: StorageService, codelistService: CodelistService) {
    super(storageService, codelistService);

    this.fields.push( ...[]);
  }

}
