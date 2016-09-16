import {TextboxField, TextareaField} from "../../../+form/controls/index";
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
  } )
];