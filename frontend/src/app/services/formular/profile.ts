import { InjectionToken } from '@angular/core';
import { IFieldBase } from '../../+form/controls';
import {IgeDocument} from "../../models/ige-document";

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
   * The field definitions for the formular, which also contains the layout classes and the validation.
   */
  fields: IFieldBase<any>[];

  /**
   * This function creates a title from the data of a document of a certatin profile. Since every profile can have
   * different fields, some components need to display a title for easier recognition of a document (tree, browser,
   * formular header, ...)
   * @param doc
   * @returns {string}
   */
  getTitle: (doc: IgeDocument) => string;

  /**
   * The fields needed to build a title. These will be used to request the backend for the necessary fields.
   * @deprecated
   * @returns {string[]}
   */
  getTitleFields: () => string[];

  /**
   * The css-image-class for the profile document. This will be shown in a tree and other places where necessary.
   * TODO: do not use 'tree' in variable name
   */
  treeIconClass?: string;


  behaviours?: any[];

  applyValidations?: any;
}

export const PROFILES = new InjectionToken<Profile>( 'profiles' );
