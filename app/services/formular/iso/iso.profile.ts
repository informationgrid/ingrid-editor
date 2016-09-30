import {TextboxField, TextareaField, TableField, RadioField} from "../../../+form/controls/index";
import {FormControl} from "@angular/forms";

export var profile = [

  new TextboxField( {
    key: 'title',
    label: 'Titel',
    // domClass: 'half',
    order: 10,
    validator: function (fc: FormControl) {
      return fc.value === 'top' ? null : {
        validateTop: { valid: false }
      };
    }
  } ),

  new TextareaField( {
    key: 'description',
    label: 'Beschreibung',
    // domClass: 'half',
    rows: 10,
    order: 20
  } ),

  new RadioField({
    key: 'myRadio',
    label: 'Gender',
    options: [
      {label: 'male', value: 'm'},
      {label: 'female', value: 'f'}
    ]
  }),

  new TableField({
    key: 'addresses',
    label: 'Adressen',
    order: 30,
    columns: [
      {headerName: 'Titel', field: 'title', editable: true},
      {headerName: 'Link', field: 'link', editable: true},
      {headerName: 'Typ', field: 'type', editable: true}
    ]
  })
];