import { IgeDocument } from "../../models/ige-document";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { SelectOptionUi } from "../codelist/codelist.service";

export type AddressType = "person" | "organization";

/**
 * A profile defines the formular fields for a document and its' validation rules, as well as the behaviours on user
 * actions.
 */
export interface Doctype {
  /**
   * The id is used as an identifier for a document type.
   */
  id: string;

  /**
   * The label of the document type for easier reading.
   */
  label: string;

  /**
   * The css-image-class for the profile document. This will be shown in a tree and other places where necessary.
   */
  iconClass?: string;

  /**
   * Set this field to make this document type for addresses
   */
  isAddressType?: boolean;

  /**
   * Set this field to make this document type for addresses
   */
  addressType: AddressType;

  /**
   *
   */
  hasOptionalFields: boolean;

  /**
   *
   */
  fieldsMap: SelectOptionUi[];

  cleanFields: FormlyFieldConfig[];

  behaviours?: any[];

  applyValidations?: any;

  /**
   * The field definitions for the formular, which also contains the layout classes and the validation.
   */
  getFields(): FormlyFieldConfig[];

  /**
   * The field definitions for the print and compare view
   */
  getFieldsForPrint(diff: any): FormlyFieldConfig[];

  /**
   * In case we need to determine icon class dynamically, you need to implement this function.
   * @param doc is the document for which the icon shall be determined
   */
  getIconClass?(doc: IgeDocument): string;

  init(help: string[]): Promise<void>;
}
