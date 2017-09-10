import { TextboxField } from "../../../+form/controls/index";
import { OpenTableField } from "../../../+form/controls/field-opentable";
import { Container } from "../../../+form/controls/container";
import { DropdownField } from "../../../+form/controls/field-dropdown";
import { Profile } from "../profile";
import { CodelistService } from '../../../+form/services/codelist.service';
import { ModalService } from '../../modal/modal.service';
import { TextareaField } from '../../../+form/controls/field-textarea';
import {Injectable} from '@angular/core';

@Injectable()
export class AddressProfile implements Profile {

  id = 'ADDRESS';

  treeIconClass = 'fa fa-address-card-o';

  countrySelect = new DropdownField({
    key: 'country',
    label: 'Land',
    domClass: 'half',
    options: []
  });
  adminAreaSelect = new DropdownField({
    key: 'adminArea',
    label: 'Verwaltungsgebiet',
    domClass: 'half',
    options: []
  });

  profile = [
    new TextboxField({
      key: 'firstName',
      label: 'Vorname',
      domClass: 'half',
      order: 10
    }),

    new TextboxField({
      key: 'lastName',
      label: 'Nachname',
      domClass: 'half',
      order: 20
    }),

    new OpenTableField({
      key: 'contact',
      label: 'Kommunikation',
      order: 30,
      domClass: 'half',
      columns: [
        {
          editor: new DropdownField({
            key: 'type',
            label: 'Typ',
            options: [{id: 'email', value: 'Email'}, {id: 'phone', value: 'Telefon'}]
          }),
          width: '100px'
        },
        {
          editor: new TextboxField({
            key: 'value',
            label: 'Wert'
          })
        }
      ]
    }),

    new Container({
      key: 'address',
      domClass: 'half',
      order: 40,
      children: [
        new TextboxField({
          key: 'street',
          label: 'Strasse',
          domClass: 'three-quarter'
        }),
        new TextboxField({
          key: 'houseNumber',
          label: 'Hausnr',
          domClass: 'quarter'
        }),
        new TextboxField({
          key: 'postbox',
          label: 'PLZ',
          domClass: 'quarter'
        }),
        new TextboxField({
          key: 'city',
          label: 'Stadt',
          domClass: 'three-quarter'
        }),

        this.adminAreaSelect,

        this.countrySelect
      ]
    }),

    new TextareaField({
      key: 'tasks',
      label: 'Aufgaben',
      rows: 2,
      order: 40
    }),

    new TextboxField({
      key: 'serviceTimes',
      label: 'Servicezeiten',
      order: 40
    })
  ];

  constructor(private codelistService: CodelistService, modalService: ModalService) {
    this.codelistService.byIds(['6200', '6250']).then(codelists => {
      this.countrySelect.options = codelists[0];
      this.adminAreaSelect.options = codelists[1];
    }).catch( err => modalService.showError(err));
  }

  getTitle(doc: any) {
    if (!doc.firstName && !doc.lastName) {
      return null;
    } else {
      return doc.firstName + ' ' + doc.lastName;
    }
  }

  getTitleFields(): string[] {
    return ['firstName', 'lastName'];
  }
}
