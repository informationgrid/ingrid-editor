import {TextboxField, TextareaField, RadioField, CheckboxField, TableField} from "../../../+form/controls/index";
import {OpenTableField} from "../../../+form/controls/field-opentable";
import {LinkDatasetField} from "../../../+form/controls/field-link-dataset";
import {Container} from "../../../+form/controls/container";
import {PartialGeneratorField} from "../../../+form/controls/field-partial-generator";
import {DropdownField} from "../../../+form/controls/field-dropdown";
import {Profile} from "../profile";


export class AddressProfile implements Profile {

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
      label: 'Kontakt',
      order: 30,
      domClass: 'half',
      columns: [
        new DropdownField({
          key: 'type',
          label: 'Typ',
          domClass: 'quarter',
          options: [{id: 'email', value: 'Email'}, {id: 'phone', value: 'Telefon'}]
        }),
        new TextboxField({
          key: 'value',
          label: 'Wert',
          domClass: 'three-quarter'
        })
      ]
    }),

    /*new PartialGeneratorField({
     key: 'contact',
     label: 'Kontakt',
     domClass: 'half',
     order: 30,
     partials: [
     new Container({
     key: 'info',
     label: 'Kontaktinformation',
     children: [
     new DropdownField({
     key: 'type',
     label: 'Typ',
     domClass: 'half',
     options: [{key: 'email', value: 'Email'}, {key: 'phone', value: 'Telefon'}]
     }),
     new TextboxField({
     key: 'value',
     label: 'Wert',
     domClass: 'half'
     })
     ]
     })
     ]
     }),*/

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
        new TextboxField({
          key: 'country',
          label: 'Land'
          // domClass: 'half'
        }),
      ]
    }),
  ];

  getTitle(doc: any) {
    if (!doc.firstName && !doc.lastName) return null;
    else {
      return doc.firstName + ' ' + doc.lastName;
    }
  }

  getTitleFields(): string[] {
    return ['firstName', 'lastName'];
  }
}
