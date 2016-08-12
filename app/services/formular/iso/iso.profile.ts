import {TextboxField, TextareaField} from '../../../form/controls/index';

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
  } )
];