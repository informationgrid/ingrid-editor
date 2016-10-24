import {TextboxField, TextareaField, RadioField, CheckboxField, TableField} from "../../../+form/controls/index";
import {OpenTableField} from "../../../+form/controls/field-opentable";
import {LinkDatasetField} from "../../../+form/controls/field-link-dataset";

export let profile = [

  new TextboxField({
    key: 'title',
    label: 'Titel',
    // domClass: 'half',
    order: 10
  }),

  new LinkDatasetField({
    key: 'publisher',
    label: 'Herausgeber',
    filter: { _profile: 'ISO' },
    order: 12
  }),

  new TextboxField({
    key: 'age',
    label: 'Alter',
    // type: 'number',
    order: 15
  }),

  new TextareaField({
    key: 'description',
    label: 'Beschreibung',
    // domClass: 'half',
    rows: 10,
    order: 20
  }),

  new CheckboxField({
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

  new OpenTableField({
    key: 'addresses',
    label: 'Adressen',
    order: 30,
    columns: [
      new TextboxField({
        key: 'title',
        label: 'Titel',
        width: '100px'
      }),
      new TextboxField({
        key: 'description',
        label: 'Description',
        width: '200px'
      }),
      new TextboxField({
        key: 'date',
        label: 'Datum',
        type: 'date'
      })
    ]
  })

/*  new TableField({
    key: 'addresses',
    label: 'Adressen',
    order: 30,
    columns: [
      {headerName: 'Titel', field: 'title', editable: true},
      {headerName: 'Description', field: 'description', editable: true}
    ]
  })*/
];