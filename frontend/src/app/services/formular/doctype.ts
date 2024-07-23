/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
import { FormlyFieldConfig } from "@ngx-formly/core";

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
   * @deprecated label should not be used but translated from the id
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
  // fieldsMap: SelectOptionUi[];

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
   * @param docType is the document type for which the icon shall be determined
   */
  getIconClass?(docType: string): string;

  init(help: string[]): Promise<void>;
}
