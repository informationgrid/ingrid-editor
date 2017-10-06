import { CheckboxField, RadioField, TextareaField, TextboxField } from '../../../+form/controls/index';
import { OpenTableField } from '../../../+form/controls/field-opentable';
import { Profile } from '../profile';
import { Rubric } from '../../../+form/controls/rubric';
import { DropdownField } from '../../../+form/controls/field-dropdown';
import { FieldBase } from '../../../+form/controls/field-base';
import { CodelistService } from '../../../+form/services/codelist.service';
import { Container } from '../../../+form/controls/container';
import {Injectable} from '@angular/core';
import {IsoBaseProfile} from './iso-base.profile';

@Injectable()
export class IsoTaskProfile extends IsoBaseProfile {

  id = 'ISOTask';

  constructor(public codelistService: CodelistService) {
    super(codelistService);

    this.profile.push( ...[]);
  }

}
