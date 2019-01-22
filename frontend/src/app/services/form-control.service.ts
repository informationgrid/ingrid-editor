import { PartialGeneratorField } from '../+form/controls/field-partial-generator';
import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { IFieldBase, Container } from '../+form/controls';

@Injectable()
export class FormControlService {
  constructor() {
  }

  toFormGroup(fields: IFieldBase<any>[], data: any) {
    const group: any = {};
    fields.forEach( field => {
      if (field.controlType === 'container' || field.controlType === 'rubric') {
        let result: any = null;
        if ((<Container>field).isRepeatable) {
          const array: any[] = [];
          (<Container>field).children.forEach(groups => {
            const subGroup = field.key ? {} : group;
            groups.forEach((child: any) => {
              subGroup[child.key] = this._addValidator(child, this.getDataValue(data, [child.key]));
            });
            array.push(new FormGroup(subGroup));
          });
          result = new FormArray(array);
        } else {
          // const subGroup = field.key ? {} : group;
          /*field.children.forEach(child => {
            subGroup[child.key] = this._addValidator(child, this.getDataValue(data, [field.key, child.key]));
          });*/
          result = this.toFormGroup((<Container>field).children, field.key ? data[field.key] : data); // new FormGroup(subGroup);
        }
        if (field.key) {
          group[field.key] = result;
        } else {
          // merge all controls from result into current group
          for (const ctrl in result.controls) {
            if ( result.controls.hasOwnProperty(ctrl) ) {
              group[ctrl] = result.controls[ctrl];
            }
          }
        }
      } else if (field.controlType === 'partialGenerator') {
        const g: any = [];
        if (data[field.key] !== undefined) {
          data[field.key].forEach((entry: any) => {
            const partialKey = Object.keys(entry)[0];
            const partial = (<PartialGeneratorField>field).partials.filter( (part: any) => part.key === partialKey )[0];
            g.push(this.toFormGroup([partial], entry));
          });
        }
        group[field.key] = new FormArray(g);
      } else {
        group[field.key] = this._addValidator( field, this.getDataValue(data, [field.key] ));
      }
    } );
    return new FormGroup( group );
  }

  getDataValue(data: any, keys: string[]): any {
    if (data === undefined) {
      return undefined;
    }

    let obj: any = data;
    keys.some( key => {
      // for containers that do not want to bundle child fields -> skip
      if (!key) {
        return false;
      }

      obj = obj[key];
      if (obj === undefined) {
        return true;
      }
    });
    return obj;
  }

  _addValidator(field: any, value: any) {
    return field.validator ? new FormControl( value || '', field.validator ) :
      field.required ? new FormControl( value || '', Validators.required )
        : new FormControl( value || '' );
  }
}

