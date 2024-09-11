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
import { Component, inject, NgModule } from "@angular/core";
import { InGridComponent, InGridDoctype } from "./profile-ingrid";
import { CodelistQuery } from "../app/store/codelist/codelist.query";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CommonFieldsLfuBayern } from "./ingrid-lfubayern/doctypes/common-fields";
import { AnonymousAddressPlugin } from "./ingrid-lfubayern/behaviours/anonymous-address.plugin";
import { PluginService } from "../app/services/plugin/plugin.service";
import { FormFieldHelper } from "./form-field-helper";

@Component({
  template: "",
  standalone: true,
})
class InGridLFUBayernComponent extends InGridComponent {
  codelistQuery = inject(CodelistQuery);
  common = inject(CommonFieldsLfuBayern);
  pluginService = inject(PluginService);
  anonymousAddressPlugin = inject(AnonymousAddressPlugin);

  constructor() {
    super();
    // this.isoView.isoExportFormat = "ingridISOLfuExternalBayern";
    this.isoView.isoExportFormat = "ingridISOLfuBayern";
    this.modifyFormFieldConfiguration();
    this.pluginService.registerPlugin(this.anonymousAddressPlugin);
  }

  protected getDocTypes = () => [
    this.folder,
    this.geoDataset,
    this.geoService,
    this.informationSystem,
    this.person,
    this.organisation,
  ];

  private modifyFormFieldConfiguration() {
    this.geoService.showLayernamesForCoupledResources = true;
    this.geoService.showUpdateGetCapabilities = false;
    [this.geoDataset, this.geoService, this.informationSystem].forEach(
      (docType) => {
        docType.showAdVCompatible = false;
        docType.showAdVProductGroup = false;
        docType.codelistIds.urlDataType = "20002";
        docType.manipulateDocumentFields = (
          fieldConfig: FormlyFieldConfig[],
        ) => {
          this.addFields(fieldConfig, docType.id);
          return fieldConfig;
        };
      },
    );
  }

  private addFields(fieldConfig: FormlyFieldConfig[], docType: string) {
    const pointOfContactPosition = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "pointOfContact",
    );
    const freeKeywordsPosition = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "free",
    );
    const orderInfoPosition = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "orderInfo",
    );

    // for all classes
    FormFieldHelper.addAfter(
      pointOfContactPosition,
      this.common.getGeodataFieldConfig(),
    );
    FormFieldHelper.addAfter(
      orderInfoPosition,
      this.common.getFeesFieldConfig(),
    );
    const useConstraintsElement = FormFieldHelper.findFieldElementWithId(
      fieldConfig,
      "useConstraints",
    );

    // limit number of use constraints to 1
    useConstraintsElement.fieldConfig[useConstraintsElement.index].expressions[
      "props.maxLength"
    ] = "1";
    FormFieldHelper.addAfter(
      useConstraintsElement,
      this.common.getUseConstraintsCommentFieldConfig(),
    );

    if (
      docType === InGridDoctype.InGridGeoDataset.toString() ||
      docType === InGridDoctype.InGridGeoService.toString()
    ) {
      FormFieldHelper.addAfter(
        freeKeywordsPosition,
        this.common.getInternalKeywordsFieldConfig(),
      );
    }

    if (docType === InGridDoctype.InGridGeoDataset.toString()) {
      FormFieldHelper.addAfter(
        pointOfContactPosition,
        this.common.getSupplementFieldConfig(),
      );
      FormFieldHelper.addAfter(
        freeKeywordsPosition,
        this.common.getGeologicalKeywordsFieldConfig(),
      );
    }
  }
}

@NgModule({
  imports: [InGridLFUBayernComponent],
})
export class ProfilePack {
  static getMyComponent() {
    return InGridLFUBayernComponent;
  }
}
