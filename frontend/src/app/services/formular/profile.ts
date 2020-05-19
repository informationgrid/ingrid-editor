import { InjectionToken } from '@angular/core';
import { IFieldBase } from '../../+form/controls';
import {IgeDocument} from '../../models/ige-document';
import {FormlyFieldConfig} from '@ngx-formly/core';

/**
 * A profile defines the formular fields for a document and its' validation rules, as well as the behaviours on user
 * actions.
 */
export interface Profile {
  /**
   * The id is used as an identifier for a profile.
   */
  id: string;

  /**
   * The label of the profile for easier reading.
   */
  label: string;

  /**
   * The css-image-class for the profile document. This will be shown in a tree and other places where necessary.
   */
  iconClass?: string;

  isAddressProfile?: boolean;


  behaviours?: any[];

  applyValidations?: any;

  /**
   * The field definitions for the formular, which also contains the layout classes and the validation.
   */
  getFields(): FormlyFieldConfig[];

  getIconClass?(doc: IgeDocument): string;
}

