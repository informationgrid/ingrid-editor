import {TextboxField, TextareaField, TableField, RadioField, CheckboxField} from "../../../+form/controls/index";
import {FormControl} from "@angular/forms";

export var profile = [

  new TextboxField( {
    key: 'title',
    label: 'Titel',
    // domClass: 'half',
    order: 10
  } ),

  new TextareaField( {
    key: 'description',
    label: 'Beschreibung',
    // domClass: 'half',
    rows: 10,
    order: 20
  } ),

  new CheckboxField( {
    key: 'isOpenData',
    label: 'Open Data',
    domClass: 'half',
    order: 25
  }),

  new RadioField({
    key: 'isConform',
    domClass: 'half',
    order: 26,
    options: [
      {label: 'konform', value: 'conform'},
      {label: 'nicht konform', value: 'not_conform'}
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